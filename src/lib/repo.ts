// 데이터 가져오기 창구. 화면은 이 파일을 통해서만 DB(Supabase)를 읽는다.
// DB를 바꾸게 되면 이 파일 안쪽만 고치면 된다.
import "server-only";
import { z } from "zod";
import { addDaysIso, isValidIsoDate, rangesOverlap } from "./dates";
import type { RoomFilters } from "./search-params";
import { isConfirmed } from "./stay-rules";
import { getPublicClient } from "./supabase/public-client";
import type { Database } from "./supabase/database.types";
import type { BookedRange, District, Listing, Photo, Room, RoomWithListing } from "./types";

// 예약 저장·조회는 따로 둔 파일에서 (파일 길이 관리용). 화면은 여기서 가져다 쓴다.
export { createBookingRequest, findBooking, getMyPendingRanges, type BookingSummary } from "./repo-bookings";

type Tables = Database["public"]["Tables"];
type PhotoRow = Pick<Tables["photos"]["Row"], "id" | "storage_path" | "alt_text" | "sort_order">;

// 방 + 숙소 + 지역 + 사진을 한 번에 가져오는 조회 모양
const ROOM_SELECT =
  "*, photos(id, storage_path, alt_text, sort_order), listing:listings!inner(*, district:districts!inner(*), photos(id, storage_path, alt_text, sort_order))";

const isUuid = (id: string) => z.uuid().safeParse(id).success;

/** DB 오류는 기술 내용이 손님에게 보이지 않게, 서버 기록에만 남기고 일반 오류로 바꾼다 */
function fail(what: string, error: { message: string }): never {
  console.error(`[repo] ${what}: ${error.message}`);
  throw new Error("Failed to load data.");
}

/** 사진 위치 → 화면용 주소. 예시 자료는 외부 주소, 올린 사진은 Supabase 사진 창고 */
function photoUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${path}`;
}

function toPhotos(rows: PhotoRow[]): Photo[] {
  return rows
    .map((p) => ({ id: p.id, url: photoUrl(p.storage_path), altText: p.alt_text, sortOrder: p.sort_order }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function toDistrict(d: Tables["districts"]["Row"]): District {
  return { id: d.id, slug: d.slug, nameEn: d.name_en, sortOrder: d.sort_order };
}

function toListing(l: Tables["listings"]["Row"] & { photos: PhotoRow[] }): Listing {
  return {
    id: l.id,
    districtId: l.district_id,
    type: l.type,
    title: l.title,
    description: l.description,
    addressEn: l.address_en,
    lat: l.lat,
    lng: l.lng,
    amenities: l.amenities,
    nearestStation: l.nearest_station,
    isPublished: l.is_published,
    photos: toPhotos(l.photos),
  };
}

type RoomRow = Tables["rooms"]["Row"] & {
  photos: PhotoRow[];
  listing: Tables["listings"]["Row"] & { photos: PhotoRow[]; district: Tables["districts"]["Row"] };
};

function toRoom(r: RoomRow): RoomWithListing {
  const room: Room = {
    id: r.id,
    listingId: r.listing_id,
    name: r.name,
    roomType: r.room_type,
    monthlyPrice: r.monthly_price,
    deposit: r.deposit,
    maintenanceFee: r.maintenance_fee,
    minNights: r.min_nights,
    maxGuests: r.max_guests,
    sizeM2: Number(r.size_m2 ?? 0),
    features: r.features,
    isPublished: r.is_published,
    photos: toPhotos(r.photos),
  };
  return { ...room, listing: toListing(r.listing), district: toDistrict(r.listing.district) };
}

/** 공개된 방 전체 (숨긴 방·숙소는 RLS와 아래 조건으로 이중 차단). 기본 순서 = 숙소 → 가격 */
async function fetchRooms(match: { id?: string; listingId?: string } = {}): Promise<RoomWithListing[]> {
  let query = getPublicClient()
    .from("rooms")
    .select(ROOM_SELECT)
    .eq("is_published", true)
    .eq("listing.is_published", true);
  if (match.id) query = query.eq("id", match.id);
  if (match.listingId) query = query.eq("listing_id", match.listingId);
  const { data, error } = await query.overrideTypes<RoomRow[], { merge: false }>();
  if (error) fail("rooms", error);
  return data
    .map(toRoom)
    .sort((a, b) => a.listing.title.localeCompare(b.listing.title) || a.monthlyPrice - b.monthlyPrice);
}

export async function getDistricts(): Promise<District[]> {
  const { data, error } = await getPublicClient().from("districts").select("*").order("sort_order");
  if (error) fail("districts", error);
  return data.map(toDistrict);
}

/** 달력·빈 방 검색용 예약 날짜 (손님 정보 없음). roomId가 없으면 모든 방 */
export async function getBookedRanges(roomId?: string): Promise<BookedRange[]> {
  if (roomId && !isUuid(roomId)) return [];
  const { data, error } = await getPublicClient().rpc("get_booked_ranges", roomId ? { p_room_id: roomId } : {});
  if (error) fail("booked ranges", error);
  return data.map((b) => ({ roomId: b.room_id, checkIn: b.check_in, checkOut: b.check_out, status: b.status }));
}

export async function searchRooms(filters: RoomFilters = {}): Promise<RoomWithListing[]> {
  let result = await fetchRooms();
  if (filters.district) result = result.filter((r) => r.district.slug === filters.district);
  if (filters.minPrice != null) result = result.filter((r) => r.monthlyPrice >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter((r) => r.monthlyPrice <= filters.maxPrice!);
  if (filters.moveIn && isValidIsoDate(filters.moveIn)) {
    // 개월 수를 안 고르면 최소 기간(30일)만큼 비어 있는지 확인
    const checkIn = filters.moveIn;
    const checkOut = addDaysIso(checkIn, (filters.months ?? 1) * 30);
    const taken = (await getBookedRanges()).filter(
      (b) => isConfirmed(b.status) && rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
    );
    result = result.filter((r) => !taken.some((b) => b.roomId === r.id));
  }
  if (filters.sort === "priceAsc") result.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
  if (filters.sort === "priceDesc") result.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
  return result;
}

export async function getRoom(id: string): Promise<RoomWithListing | null> {
  if (!isUuid(id)) return null;
  const [room] = await fetchRooms({ id });
  return room ?? null;
}

export async function getListing(
  id: string,
): Promise<{ listing: Listing; district: District; rooms: RoomWithListing[] } | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await getPublicClient()
    .from("listings")
    .select("*, district:districts!inner(*), photos(id, storage_path, alt_text, sort_order)")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle()
    .overrideTypes<(Tables["listings"]["Row"] & { photos: PhotoRow[]; district: Tables["districts"]["Row"] }) | null, { merge: false }>();
  if (error) fail("listing", error);
  if (!data) return null;
  return { listing: toListing(data), district: toDistrict(data.district), rooms: await fetchRooms({ listingId: id }) };
}

/** 홈 화면 추천: 숙소마다 가장 저렴한 방 하나씩 (다인실 제외) */
export async function getFeaturedRooms(limit = 6): Promise<RoomWithListing[]> {
  const byListing = new Map<string, RoomWithListing>();
  for (const r of (await fetchRooms()).filter((x) => x.roomType !== "shared")) {
    const cur = byListing.get(r.listingId);
    if (!cur || r.monthlyPrice < cur.monthlyPrice) byListing.set(r.listingId, r);
  }
  return [...byListing.values()].slice(0, limit);
}
