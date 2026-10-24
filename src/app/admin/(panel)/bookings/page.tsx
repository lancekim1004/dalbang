import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate, formatKRW } from "@/lib/format";
import { listAdminBookings } from "@/lib/repo";

export async function generateMetadata() {
  return { title: (await getTranslations("Admin.bookings"))("title") };
}

const FILTERS = ["pending", "approved", "rejected", "cancelled", "expired"] as const;

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const status = z.enum(FILTERS).optional().catch(undefined).parse((await searchParams).status);
  const [t, ts, rows] = await Promise.all([getTranslations("Admin.bookings"), getTranslations("Status"), listAdminBookings(status)]);
  const tab = (active: boolean) => `rounded-full px-3 py-1.5 text-sm ${active ? "bg-ink text-white" : "border border-line bg-white hover:border-ink"}`;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <nav className="flex flex-wrap gap-2">
        <Link href="/admin/bookings" className={tab(!status)}>{t("all")}</Link>
        {FILTERS.map((f) => <Link key={f} href={`/admin/bookings?status=${f}`} className={tab(status === f)}>{ts(`${f}.label`)}</Link>)}
      </nav>
      {rows.length === 0 ? <p className="text-sm text-muted">{t("empty")}</p> : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/bookings/${b.id}`} className="grid gap-1 px-4 py-3 hover:bg-paper sm:grid-cols-[110px_1fr_1fr_auto] sm:items-center sm:gap-4">
                <span className="font-mono text-sm font-semibold">{b.code}</span>
                <span className="text-sm"><span className="font-medium">{b.guestName}</span> · {b.roomName}<span className="text-muted"> · {b.listingTitle}</span></span>
                <span className="text-sm text-muted">{formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {formatKRW(b.totalAmount)}</span>
                <StatusBadge status={b.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
