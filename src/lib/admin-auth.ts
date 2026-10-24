// 관리자 확인. 관리자 화면과 관리자 기능(서버 액션) 맨 앞에서 매번 부른다 (CLAUDE.md 규칙).
// 로그인 계정이 있어도 admins 명단에 없으면 들어올 수 없다.
import "server-only";
import { redirect } from "next/navigation";
import { getAdminClient } from "./supabase/admin-client";
import { getSessionClient } from "./supabase/session-client";

export interface AdminUser {
  userId: string;
  email: string;
}

/** 관리자가 아니면 null */
export async function getAdmin(): Promise<AdminUser | null> {
  const supabase = await getSessionClient();
  // getUser()는 Supabase 서버에 물어 로그인 정보가 진짜인지 확인한다 (쿠키만 믿지 않음)
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: row } = await getAdminClient().from("admins").select("email").eq("user_id", data.user.id).maybeSingle();
  return row ? { userId: data.user.id, email: row.email } : null;
}

/** 관리자가 아니면 로그인 화면으로 보낸다 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
