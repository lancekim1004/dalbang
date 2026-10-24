// 요청 횟수 제한 + 스팸 방지(Turnstile). 서버 액션 맨 앞에서 부른다.
import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getAdminClient } from "./supabase/admin-client";

export const LIMITS = {
  request: { limit: 5, windowSeconds: 60 * 60 }, // 예약 요청: 1시간 5번
  lookup: { limit: 20, windowSeconds: 15 * 60 }, // 예약 조회: 15분 20번
  login: { limit: 10, windowSeconds: 15 * 60 }, // 관리자 로그인: 15분 10번
} as const;

async function clientIp(): Promise<string> {
  const h = await headers();
  // Vercel이 넣어 주는 실제 접속 주소 (맨 앞 값)
  return (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim();
}

/** 한도 안이면 true. 기록에는 IP 원문 대신 알아볼 수 없게 바꾼 값만 남긴다. DB 오류 시에는 막지 않는다. */
export async function allowRequest(kind: keyof typeof LIMITS): Promise<boolean> {
  const ip = await clientIp();
  const hashed = createHash("sha256").update(`dalbang:${ip}`).digest("hex").slice(0, 32);
  const { limit, windowSeconds } = LIMITS[kind];
  const { data, error } = await getAdminClient().rpc("hit_rate_limit", {
    p_key: `${kind}:${hashed}`, p_limit: limit, p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error(`[rate-limit] ${error.message}`);
    return true;
  }
  return data;
}

/** Turnstile("로봇이 아닙니다") 확인. 키가 설정되지 않았으면 검사하지 않는다. */
export async function verifyTurnstile(token: FormDataEntryValue | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: await clientIp() }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
