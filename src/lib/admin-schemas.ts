// 관리자 입력 양식 검사 (숙소·방). 화면에 보일 이름이 있는 시설만 고를 수 있게 목록을 고정한다.
import { z } from "zod";

// messages/en.json의 Amenity·Feature 이름과 같아야 화면에 글자가 나온다
export const AMENITIES = [
  "wifi", "washer", "kitchen", "rooftop", "airConditioning", "workspace", "cleaning", "studyLounge",
  "courtyard", "floorHeating", "elevator", "gym", "security", "parking",
] as const;
export const FEATURES = [
  "desk", "wardrobe", "window", "privateBathroom", "doubleBed", "locker", "readingLight", "kitchenette",
  "parkView", "balcony", "courtyardView", "floorBed", "floorHeating", "fullKitchen", "cityView",
] as const;

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const won = z.coerce.number().int().min(0).max(100_000_000); // 원 단위 정수만
const text = (max: number) => z.string().trim().max(max);

export const listingSchema = z.object({
  districtId: z.uuid(),
  type: z.enum(["sharehouse", "studio", "apartment"]),
  title: text(120).min(1),
  description: text(3000),
  addressEn: text(200),
  lat: z.coerce.number().min(33).max(39), // 대한민국 범위
  lng: z.coerce.number().min(124).max(132),
  amenities: z.array(z.enum(AMENITIES)).max(AMENITIES.length),
  nearestStation: text(120),
  isPublished: checkbox,
});

export const roomSchema = z.object({
  listingId: z.uuid(),
  name: text(120).min(1),
  roomType: z.enum(["private", "shared", "entire"]),
  monthlyPrice: won.min(1),
  deposit: won,
  maintenanceFee: won,
  minNights: z.coerce.number().int().min(30).max(365),
  maxGuests: z.coerce.number().int().min(1).max(10),
  sizeM2: z.coerce.number().min(1).max(1000),
  features: z.array(z.enum(FEATURES)).max(FEATURES.length),
  isPublished: checkbox,
});

/** FormData → 객체. 체크박스 여러 개(amenities, features)는 배열로 모은다 */
export function formToObject(formData: FormData, arrayFields: string[] = []) {
  const obj: Record<string, unknown> = Object.fromEntries(formData);
  for (const f of arrayFields) obj[f] = formData.getAll(f);
  return obj;
}
