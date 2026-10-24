import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// 관리자 화면은 항상 최신 자료로
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <>
      <AdminNav email={admin.email} />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </>
  );
}
