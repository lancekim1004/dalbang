// 방문자 권한(공개 키)으로 DB를 읽는 연결. RLS 규칙 때문에 공개된 자료만 보인다.
// 서버에서만 쓴다 (브라우저 코드에서 import하면 빌드 오류로 막힘).
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

export function getPublicClient(): SupabaseClient<Database> {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase URL or publishable key is missing in environment variables.");
  client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
