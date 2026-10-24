import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PublishedBadge, SavedNotice } from "@/components/admin/Badge";
import { ListingForm } from "@/components/admin/ListingForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { requireAdmin } from "@/lib/admin-auth";
import { formatKRW } from "@/lib/format";
import { getAdminListing, listDistricts } from "@/lib/repo";
import { z } from "zod";

export async function generateMetadata() {
  return { title: (await getTranslations("Admin.listings"))("editTitle") };
}

export default async function AdminListingPage({ params, searchParams }: PageProps<"/admin/listings/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !z.uuid().safeParse(id).success) notFound();
  const [t, districts, listing, sp] = await Promise.all([
    getTranslations("Admin.listings"), listDistricts(), isNew ? null : getAdminListing(id), searchParams,
  ]);
  if (!isNew && !listing) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/listings" className="text-sm text-muted hover:text-ink">← {t("back")}</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{listing ? listing.title : t("new")}</h1>
        {listing && <PublishedBadge published={listing.is_published} />}
        {listing?.is_published && <Link href={`/listings/${listing.id}`} className="text-sm underline underline-offset-2">{t("viewPublic")}</Link>}
      </div>
      {sp.saved && <SavedNotice />}
      <ListingForm listing={listing ?? undefined} districts={districts} />

      {listing && (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("roomsTitle")}</h2>
              <Link href={`/admin/rooms/new?listing=${listing.id}`} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:border-ink">{t("addRoom")}</Link>
            </div>
            {listing.rooms.length === 0 ? <p className="text-sm text-muted">{t("noRooms")}</p> : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
                {listing.rooms.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/rooms/${r.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-paper">
                      <span className="font-medium">{r.name}</span>
                      <PublishedBadge published={r.is_published} />
                      <span className="ml-auto text-sm">{formatKRW(r.monthly_price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <PhotoManager owner={{ kind: "listing", id: listing.id }} photos={listing.photos} />
        </>
      )}
    </div>
  );
}
