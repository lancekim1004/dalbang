import { formatKRW, formatKRWShort } from "@/lib/format";
import type { RoomWithListing } from "@/lib/types";
import type { MapPin } from "./types";

/** 방 목록 → 숙소별 핀 (가장 싼 방 가격 표시) */
export function roomsToPins(rooms: RoomWithListing[], query = ""): MapPin[] {
  const byListing = new Map<string, MapPin & { min: number }>();
  for (const r of rooms) {
    const pin = byListing.get(r.listingId) ?? {
      id: r.listingId,
      lat: r.listing.lat,
      lng: r.listing.lng,
      label: "",
      title: r.listing.title,
      href: `/listings/${r.listingId}`,
      rooms: [],
      min: Infinity,
    };
    pin.rooms.push({ name: r.name, price: formatKRW(r.monthlyPrice), href: `/rooms/${r.id}${query}` });
    pin.min = Math.min(pin.min, r.monthlyPrice);
    pin.label = formatKRWShort(pin.min);
    byListing.set(r.listingId, pin);
  }
  return [...byListing.values()].map((p) => ({
    id: p.id, lat: p.lat, lng: p.lng, label: p.label, title: p.title, href: p.href, rooms: p.rooms,
  }));
}
