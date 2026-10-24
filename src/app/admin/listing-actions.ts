"use server";
// 숙소·방 저장. 관리자 확인 후, 로그인한 관리자 권한으로 저장해 DB 보안 규칙(RLS)도 한 번 더 확인하게 한다.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { formToObject, listingSchema, roomSchema } from "@/lib/admin-schemas";
import { getSessionClient } from "@/lib/supabase/session-client";

export type SaveState = { invalidFields?: string[]; error?: "server" } | null;

const optionalId = z.uuid().optional().catch(undefined);
const fields = (e: z.ZodError) => [...new Set(e.issues.map((i) => String(i.path[0])))];

export async function saveListing(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = optionalId.parse(formData.get("id") || undefined);
  const parsed = listingSchema.safeParse(formToObject(formData, ["amenities"]));
  if (!parsed.success) return { invalidFields: fields(parsed.error) };
  const v = parsed.data;
  const row = {
    district_id: v.districtId, type: v.type, title: v.title, description: v.description, address_en: v.addressEn,
    lat: v.lat, lng: v.lng, amenities: v.amenities, nearest_station: v.nearestStation, is_published: v.isPublished,
  };
  const db = await getSessionClient();
  const result = id
    ? await db.from("listings").update(row).eq("id", id).select("id").single()
    : await db.from("listings").insert(row).select("id").single();
  if (result.error) {
    console.error(`[listing-actions] save listing: ${result.error.message}`);
    return { error: "server" };
  }
  // 손님 화면(홈·목록·상세)에 바로 반영
  revalidatePath("/", "layout");
  redirect(`/admin/listings/${result.data.id}?saved=1`);
}

export async function saveRoom(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = optionalId.parse(formData.get("id") || undefined);
  const parsed = roomSchema.safeParse(formToObject(formData, ["features"]));
  if (!parsed.success) return { invalidFields: fields(parsed.error) };
  const v = parsed.data;
  const row = {
    listing_id: v.listingId, name: v.name, room_type: v.roomType, monthly_price: v.monthlyPrice, deposit: v.deposit,
    maintenance_fee: v.maintenanceFee, min_nights: v.minNights, max_guests: v.maxGuests, size_m2: v.sizeM2,
    features: v.features, is_published: v.isPublished,
  };
  const db = await getSessionClient();
  const result = id
    ? await db.from("rooms").update(row).eq("id", id).select("id").single()
    : await db.from("rooms").insert(row).select("id").single();
  if (result.error) {
    console.error(`[listing-actions] save room: ${result.error.message}`);
    return { error: "server" };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/rooms/${result.data.id}?saved=1`);
}
