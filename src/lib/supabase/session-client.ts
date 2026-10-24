// 로그인한 사람(관리자) 권한으로 DB에 접속. 로그인 정보는 쿠키에 담긴다.
// 요청마다 새로 만든다 (여러 사람이 같은 연결을 쓰면 안 됨).
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export async function getSessionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // 화면(서버 컴포넌트)에서는 쿠키를 못 쓴다. 로그인 연장은 proxy.ts가 맡는다.
          }
        },
      },
    },
  );
}
