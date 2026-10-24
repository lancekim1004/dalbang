// 데이터 가져오기 창구. 지금은 예시 자료(src/data/sample.ts)를 읽고,
// Supabase 연결 후에는 이 파일 안쪽만 바꾸면 화면 코드는 그대로 쓸 수 있다.
import { districts, listings, rooms, sampleBookings } from "@/data/sample";
import { addDaysIso, isValidIsoDate, rangesOverlap } from "./dates";
import type { BookedRange, District, Listing, RoomWithListing } from "./types";

export interface RoomFilters {
  district?: string; // 지역 slug
  minPrice?: number;
  maxPrice?: number;
  moveIn?: string; // YYYY-MM-DD
  months?: number; // 머물 개월 수 (입주일과 함께 빈 방 확인에 사용)
  sort?: "recommended" | "priceAsc" | "priceDesc";
}

export const STAY_MONTH_OPTIONS = [1, 2, 3, 6, 12] as const;

function attach(roomList = rooms): RoomWithListing[] {
  return roomList.flatMap((room) => {
    const listing = listings.find((l) => l.id === room.listingId);
    const district = listing && districts.find((d) => d.id === listing.districtId);
    if (!listing || !district || !listing.isPublished || !room.isPublished) return [];
    return [{ ...room, listing, district }];
  });
}

export async function getDistricts(): Promise<District[]> {
  return [...districts].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBookedRanges(roomId: string): Promise<BookedRange[]> {
  return sampleBookings().filter((b) => b.roomId === roomId);
}

/** 그 기간에 승인된 예약이 없는지 */
function isFree(roomId: string, checkIn: string, checkOut: string, booked: BookedRange[]) {
  return !booked.some(
    (b) => b.roomId === roomId && b.status === "approved" && rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
  );
}

export async function searchRooms(filters: RoomFilters = {}): Promise<RoomWithListing[]> {
  let result = attach();
  if (filters.district) result = result.filter((r) => r.district.slug === filters.district);
  if (filters.minPrice != null) result = result.filter((r) => r.monthlyPrice >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter((r) => r.monthlyPrice <= filters.maxPrice!);
  if (filters.moveIn && isValidIsoDate(filters.moveIn)) {
    // 개월 수를 안 고르면 최소 기간(30일)만큼 비어 있는지 확인
    const nights = (filters.months ?? 1) * 30;
    const checkOut = addDaysIso(filters.moveIn, nights);
    const booked = sampleBookings();
    result = result.filter((r) => isFree(r.id, filters.moveIn!, checkOut, booked));
  }
  if (filters.sort === "priceAsc") result.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
  if (filters.sort === "priceDesc") result.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
  return result;
}

export async function getRoom(id: string): Promise<RoomWithListing | null> {
  return attach().find((r) => r.id === id) ?? null;
}

export async function getListing(
  id: string,
): Promise<{ listing: Listing; district: District; rooms: RoomWithListing[] } | null> {
  const listing = listings.find((l) => l.id === id && l.isPublished);
  const district = listing && districts.find((d) => d.id === listing.districtId);
  if (!listing || !district) return null;
  return { listing, district, rooms: attach().filter((r) => r.listingId === id) };
}

/** 홈 화면 추천: 숙소마다 가장 저렴한 방 하나씩 */
export async function getFeaturedRooms(limit = 6): Promise<RoomWithListing[]> {
  const all = attach();
  const byListing = new Map<string, RoomWithListing>();
  for (const r of all.filter((x) => x.roomType !== "shared")) {
    const cur = byListing.get(r.listingId);
    if (!cur || r.monthlyPrice < cur.monthlyPrice) byListing.set(r.listingId, r);
  }
  return [...byListing.values()].slice(0, limit);
}

export async function getAllRoomIds(): Promise<string[]> {
  return attach().map((r) => r.id);
}

export async function getAllListingIds(): Promise<string[]> {
  return listings.filter((l) => l.isPublished).map((l) => l.id);
}
