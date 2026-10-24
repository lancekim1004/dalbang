import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Maximize, Moon, TrainFront, Users } from "lucide-react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { Chips } from "@/components/Chips";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PricePreview } from "@/components/PricePreview";
import { RoomCard } from "@/components/RoomCard";
import { MapView } from "@/components/map/MapView";
import { todayInSeoul } from "@/lib/dates";
import { formatKRW } from "@/lib/format";
import { getBookedRanges, getListing, getRoom } from "@/lib/repo";
import { parseRoomFilters } from "@/lib/search-params";
import { MIN_NIGHTS } from "@/lib/stay-rules";

// 예약 달력은 오늘 날짜 기준이라 매번 새로 만든다
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/rooms/[id]">): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) return {};
  const title = `${room.name} · ${room.listing.title}`;
  const description = `${formatKRW(room.monthlyPrice)}/month in ${room.district.nameEn}, Seoul. ${room.listing.description}`.slice(0, 160);
  return { title, description, openGraph: { title, description, images: room.photos.slice(0, 1).map((p) => p.url) } };
}

export default async function RoomPage({ params, searchParams }: PageProps<"/rooms/[id]">) {
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();

  const t = await getTranslations();
  const filters = parseRoomFilters(await searchParams);
  const [booked, building] = await Promise.all([getBookedRanges(room.id), getListing(room.listingId)]);
  const others = building?.rooms.filter((r) => r.id !== room.id) ?? [];
  const today = todayInSeoul();
  const minNights = Math.max(MIN_NIGHTS, room.minNights);
  const pin = { id: room.listingId, lat: room.listing.lat, lng: room.listing.lng, label: formatKRW(room.monthlyPrice), title: room.listing.title, href: `/listings/${room.listingId}`, rooms: [] };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link href="/rooms" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("Room.back")}
      </Link>

      <PhotoGallery photos={[...room.photos, ...room.listing.photos]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <header>
            <p className="text-sm text-muted">
              {room.district.nameEn} · {t(`ListingType.${room.listing.type}`)} · {t(`RoomType.${room.roomType}`)}
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{room.name}</h1>
            <p className="mt-1">
              {t("Room.inListing", { listing: room.listing.title })}{" "}
              <Link href={`/listings/${room.listingId}`} className="text-sm font-medium underline underline-offset-2">
                {t("Room.viewListing")}
              </Link>
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li className="flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" />{t("Room.guests", { count: room.maxGuests })}</li>
              <li className="flex items-center gap-1.5"><Maximize className="h-4 w-4" aria-hidden="true" />{t("Room.size", { size: room.sizeM2 })}</li>
              <li className="flex items-center gap-1.5"><Moon className="h-4 w-4" aria-hidden="true" />{t("Room.minStay", { nights: minNights })}</li>
              <li className="flex items-center gap-1.5"><TrainFront className="h-4 w-4" aria-hidden="true" />{room.listing.nearestStation}</li>
            </ul>
          </header>

          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("Room.features")}</h2>
            <Chips items={room.features.map((f) => t(`Feature.${f}`))} />
          </section>

          <div className="lg:hidden">
            <PricePreview room={room} booked={booked} initialMoveIn={filters.moveIn} initialMonths={filters.months} />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("Room.availability")}</h2>
            <AvailabilityCalendar booked={booked} today={today} />
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">{t("Room.aboutListing", { listing: room.listing.title })}</h2>
            <p className="text-sm leading-relaxed text-ink/80">{room.listing.description}</p>
            <h3 className="mb-3 mt-5 text-sm font-semibold">{t("Room.sharedAmenities")}</h3>
            <Chips items={room.listing.amenities.map((a) => t(`Amenity.${a}`))} />
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">{t("Room.location")}</h2>
            <p className="mb-3 text-sm text-muted">{room.listing.addressEn}</p>
            <div className="h-64 overflow-hidden rounded-2xl border border-line">
              <MapView pins={[pin]} interactive={false} />
            </div>
            <p className="mt-2 text-xs text-muted">{t("Room.locationNote")}</p>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <PricePreview room={room} booked={booked} initialMoveIn={filters.moveIn} initialMonths={filters.months} />
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-semibold">{t("Room.otherRooms")}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((r) => <RoomCard key={r.id} room={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
