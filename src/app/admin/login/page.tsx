import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/admin-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.login");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  const t = await getTranslations("Admin.login");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">{t("intro")}</p>
      <LoginForm />
    </div>
  );
}
