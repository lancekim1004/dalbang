import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PublishedBadge } from "@/components/admin/Badge";
import { requireAdmin } from "@/lib/admin-auth";
import { formatKRW } from "@/lib/format";
import { listAdminListings } from "@/lib/repo";

export async function generateMetadata() {
  return { title: (await getTranslations("Admin.listings"))("title") };
}

export default async function AdminListingsPage() {
  await requireAdmin();
  const t = await getTranslations("Admin.listings");
  const listings = await listAdminListings();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/admin/listings/new" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">{t("add")}</Link>
      </div>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
        {listings.map((l) => {
          const prices = l.rooms.map((r) => r.monthly_price);
          return (
            <li key={l.id}>
              <Link href={`/admin/listings/${l.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-paper">
                <span className="font-semibold">{l.title}</span>
                <PublishedBadge published={l.is_published} />
                <span className="text-sm text-muted">{l.district.name_en}</span>
                <span className="text-sm text-muted">{t("rooms", { count: l.rooms.length })}</span>
                {prices.length > 0 && <span className="ml-auto text-sm">{formatKRW(Math.min(...prices))} – {formatKRW(Math.max(...prices))}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
