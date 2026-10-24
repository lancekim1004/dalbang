import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TrainFront } from "lucide-react";
import { Chips } from "@/components/Chips";
import { PhotoGallery } from "@/components/PhotoGallery";
import { RoomCard } from "@/components/RoomCard";
import { MapView } from "@/components/map/MapView";
import { roomsToPins } from "@/components/map/pins";
import { formatKRW } from "@/lib/format";
import { getListing } from "@/lib/repo";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/listings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const data = await getListing(id);
  if (!data) return {};
  const { listing } = data;
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: { title: listing.title, description: listing.description, images: listing.photos.slice(0, 1).map((p) => p.url) },
  };
}

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const data = await getListing(id);
  if (!data) notFound();
  const { listing, district, rooms } = data;
  const t = await getTranslations();
  const minPrice = Math.min(...rooms.map((r) => r.monthlyPrice));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PhotoGallery photos={listing.photos} />
      <header className="mt-6">
        <p className="text-sm text-muted">{district.nameEn} · {t(`ListingType.${listing.type}`)}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{listing.title}</h1>
        {rooms.length > 0 && <p className="mt-1 font-semibold">{t("Listing.from", { amount: formatKRW(minPrice) })}</p>}
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <TrainFront className="h-4 w-4" aria-hidden="true" /> {listing.nearestStation}
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <p className="leading-relaxed text-ink/80">{listing.description}</p>
          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("Room.sharedAmenities")}</h2>
            <Chips items={listing.amenities.map((a) => t(`Amenity.${a}`))} />
          </section>
        </div>
        <section>
          <div className="h-64 overflow-hidden rounded-2xl border border-line">
            <MapView pins={roomsToPins(rooms).map((p) => ({ ...p, rooms: [] }))} interactive={false} />
          </div>
          <p className="mt-2 text-xs text-muted">{t("Room.locationNote")}</p>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">{t("Listing.roomsHere")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      </section>
    </div>
  );
}
