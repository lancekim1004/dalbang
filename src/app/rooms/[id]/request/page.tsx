import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { RequestForm } from "@/components/RequestForm";
import { isValidIsoDate } from "@/lib/dates";
import { formatKRW } from "@/lib/format";
import { getBookedRanges, getRoom } from "@/lib/repo";

// 예약 상황이 계속 바뀌므로 매번 새로 만든다
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/rooms/[id]/request">): Promise<Metadata> {
  const t = await getTranslations("Request");
  const room = await getRoom((await params).id);
  // 개인 양식 화면이라 검색 결과에는 안 나오게
  return { title: room ? t("metaTitle", { room: room.name }) : undefined, robots: { index: false } };
}

const one = (v: string | string[] | undefined) => (typeof v === "string" && isValidIsoDate(v) ? v : undefined);

export default async function RequestPage({ params, searchParams }: PageProps<"/rooms/[id]/request">) {
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();
  const sp = await searchParams;
  const [t, booked] = await Promise.all([getTranslations("Request"), getBookedRanges(room.id)]);
  const photo = room.photos[0] ?? room.listing.photos[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href={`/rooms/${room.id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("back")}
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("intro")}</p>

      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line bg-white p-3">
        {photo && (
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
            <Image src={photo.url} alt={photo.altText} fill sizes="80px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{room.name}</p>
          <p className="truncate text-sm text-muted">{room.listing.title} · {room.district.nameEn}</p>
          <p className="text-sm">{t("perMonth", { amount: formatKRW(room.monthlyPrice) })}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <RequestForm room={room} booked={booked} initialCheckIn={one(sp.checkIn)} initialCheckOut={one(sp.checkOut)} />
      </div>
    </div>
  );
}
