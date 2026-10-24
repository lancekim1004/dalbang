import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { formatKRW } from "@/lib/format";
import type { RoomWithListing } from "@/lib/types";

export function RoomCard({ room, query = "", priority = false }: { room: RoomWithListing; query?: string; priority?: boolean }) {
  const t = useTranslations();
  const photo = room.photos[0] ?? room.listing.photos[0];
  return (
    <Link href={`/rooms/${room.id}${query}`} className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-line">
        {photo && (
          <Image
            src={photo.url}
            alt={photo.altText}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium">
          {t(`RoomType.${room.roomType}`)}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <p className="flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {room.district.nameEn} · {t(`ListingType.${room.listing.type}`)}
        </p>
        <h3 className="font-semibold leading-snug">{room.listing.title}</h3>
        <p className="text-sm text-muted">{room.name}</p>
        <p className="pt-1">
          <span className="text-lg font-bold">{formatKRW(room.monthlyPrice)}</span>{" "}
          <span className="text-sm text-muted">{t("Rooms.perMonth")}</span>
        </p>
        <p className="text-xs text-muted">{t("Rooms.deposit", { amount: formatKRW(room.deposit) })}</p>
      </div>
    </Link>
  );
}
