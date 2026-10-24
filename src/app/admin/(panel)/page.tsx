import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboardStats, listAdminBookings } from "@/lib/repo";
import { formatDate } from "@/lib/format";

export async function generateMetadata() {
  const t = await getTranslations("Admin.dashboard");
  return { title: t("title") };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const t = await getTranslations("Admin.dashboard");
  const [stats, pending] = await Promise.all([getDashboardStats(), listAdminBookings("pending")]);
  const cards = [
    { label: t("pending"), value: stats.pending, href: "/admin/bookings?status=pending" },
    { label: t("moveIns"), value: stats.moveIns, href: "/admin/calendar" },
    { label: t("moveOuts"), value: stats.moveOuts, href: "/admin/calendar" },
    { label: t("failedEmails"), value: stats.failedEmails, href: "/admin/bookings" },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl border border-line bg-white p-4 hover:border-ink">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("waiting")}</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">{t("noneWaiting")}</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
            {pending.slice(0, 8).map((b) => (
              <li key={b.id}>
                <Link href={`/admin/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-paper">
                  <span className="font-mono text-sm font-semibold">{b.code}</span>
                  <span className="text-sm">{b.roomName} · {b.listingTitle}</span>
                  <span className="text-sm text-muted">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
