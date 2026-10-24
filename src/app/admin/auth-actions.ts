"use server";
// 관리자 로그인·로그아웃
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdmin } from "@/lib/admin-auth";
import { getSessionClient } from "@/lib/supabase/session-client";

export type LoginState = { error?: "invalid" | "notAdmin" } | null;

const schema = z.object({
  email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email()),
  password: z.string().min(1).max(200),
});

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };
  const supabase = await getSessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // 이메일·비밀번호 중 무엇이 틀렸는지는 알려주지 않는다
  if (error) return { error: "invalid" };
  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    return { error: "notAdmin" };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await getSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
