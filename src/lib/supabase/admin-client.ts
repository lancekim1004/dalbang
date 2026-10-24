// 서버 권한(비밀 키)으로 DB에 접속. RLS를 건너뛰므로 서버 코드에서만, 꼭 필요한 곳에만 쓴다.
// 브라우저 코드에서 import하면 "server-only" 때문에 빌드가 막힌다.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

export function getAdminClient(): SupabaseClient<Database> {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase URL or secret key is missing in environment variables.");
  client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
