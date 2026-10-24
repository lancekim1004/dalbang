// 하루 한 번 자동 실행 (Vercel Cron, vercel.json 참고)
// 1) 3일 넘게 처리 안 된 / 입주일 지난 대기 요청 만료  2) 오래된 개인정보 삭제
// Vercel이 CRON_SECRET을 담아 부른다. 비밀 값이 안 맞으면 아무것도 하지 않는다.
import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin-client";

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(header);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const [expired, purged] = await Promise.all([db.rpc("expire_stale_bookings"), db.rpc("purge_old_personal_data")]);
  if (expired.error || purged.error) {
    console.error(`[cron] expire: ${expired.error?.message ?? "ok"} / purge: ${purged.error?.message ?? "ok"}`);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ expired: expired.data.length, purged: purged.data });
}
