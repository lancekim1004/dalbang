import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RoomCard } from "@/components/RoomCard";
import { RoomsBrowser } from "@/components/RoomsBrowser";
import { SearchForm } from "@/components/SearchForm";
import { SortSelect } from "@/components/SortSelect";
import { MapView } from "@/components/map/MapView";
import { roomsToPins } from "@/components/map/pins";
import { addDaysIso, addMonthsIso, todayInSeoul } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { getDistricts, searchRooms } from "@/lib/repo";
import { parseRoomFilters, stayQuery } from "@/lib/search-params";
import { MAX_MONTHS_AHEAD } from "@/lib/stay-rules";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return { title: t("roomsTitle"), description: t("roomsDescription") };
}

export default async function RoomsPage({ searchParams }: PageProps<"/rooms">) {
  const t = await getTranslations("Rooms");
  const ts = await getTranslations("Search");
  const filters = parseRoomFilters(await searchParams);
  const [districts, rooms] = await Promise.all([getDistricts(), searchRooms(filters)]);
  const district = districts.find((d) => d.slug === filters.district);
  const today = todayInSeoul();
  const query = stayQuery(filters);

  const list = (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {/* 제목 단계(h1→h2→h3)를 맞춰 화면낭독기가 구조를 이해하도록 */}
        <h2 className="text-sm font-normal text-muted">
          {t("count", { count: rooms.length })}
          {filters.moveIn && rooms.length > 0 && ` · ${t("availableFrom", { date: formatDate(filters.moveIn) })}`}
        </h2>
        <SortSelect />
      </div>
      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-semibold">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("emptyBody")}</p>
          <Link href="/rooms" className="mt-4 inline-block rounded-full border border-ink px-4 py-2 text-sm font-medium">
            {ts("reset")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 pb-20 sm:grid-cols-2 lg:pb-0">
          {rooms.map((r, i) => <RoomCard key={r.id} room={r} query={query} priority={i < 2} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold">{district ? t("inDistrict", { district: district.nameEn }) : t("heading")}</h1>
      <div className="mt-4 rounded-2xl border border-line bg-white p-3">
        <SearchForm
          key={JSON.stringify(filters)}
          variant="bar"
          districts={districts}
          defaults={filters}
          minDate={addDaysIso(today, 1)}
          maxDate={addMonthsIso(today, MAX_MONTHS_AHEAD)}
        />
      </div>
      <div className="mt-6">
        <RoomsBrowser list={list} map={<MapView pins={roomsToPins(rooms, query)} />} />
      </div>
    </div>
  );
}
