// 관리자용 숙소·방 읽기 (숨긴 것 포함). 부르기 전 requireAdmin() 필수.
import "server-only";
import { getAdminClient } from "./supabase/admin-client";
import type { Database } from "./supabase/database.types";

type T = Database["public"]["Tables"];
export type AdminPhoto = Pick<T["photos"]["Row"], "id" | "storage_path" | "alt_text" | "sort_order">;
export type AdminListing = T["listings"]["Row"] & { photos: AdminPhoto[]; rooms: T["rooms"]["Row"][]; district: T["districts"]["Row"] };
export type AdminRoom = T["rooms"]["Row"] & { photos: AdminPhoto[]; listing: Pick<T["listings"]["Row"], "id" | "title" | "is_published"> };

function fail(what: string, error: { message: string }): never {
  console.error(`[repo-admin-listings] ${what}: ${error.message}`);
  throw new Error("Failed to load admin data.");
}

const byOrder = (a: AdminPhoto, b: AdminPhoto) => a.sort_order - b.sort_order;

export async function listAdminListings(): Promise<AdminListing[]> {
  const { data, error } = await getAdminClient()
    .from("listings")
    .select("*, district:districts!inner(*), rooms(*), photos(id, storage_path, alt_text, sort_order)")
    .order("title")
    .overrideTypes<AdminListing[], { merge: false }>();
  if (error) fail("listings", error);
  return data.map((l) => ({ ...l, photos: l.photos.sort(byOrder) }));
}

export async function getAdminListing(id: string): Promise<AdminListing | null> {
  const { data, error } = await getAdminClient()
    .from("listings")
    .select("*, district:districts!inner(*), rooms(*), photos(id, storage_path, alt_text, sort_order)")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<AdminListing | null, { merge: false }>();
  if (error) fail("listing", error);
  if (!data) return null;
  return { ...data, photos: data.photos.sort(byOrder), rooms: data.rooms.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAdminRoom(id: string): Promise<(AdminRoom & { pendingCount: number }) | null> {
  const db = getAdminClient();
  const [{ data, error }, pending] = await Promise.all([
    db.from("rooms")
      .select("*, photos(id, storage_path, alt_text, sort_order), listing:listings!inner(id, title, is_published)")
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<AdminRoom | null, { merge: false }>(),
    db.from("bookings").select("id", { count: "exact", head: true }).eq("room_id", id).eq("status", "pending"),
  ]);
  if (error) fail("room", error);
  if (!data) return null;
  return { ...data, photos: data.photos.sort(byOrder), pendingCount: pending.count ?? 0 };
}

export async function listDistricts() {
  const { data, error } = await getAdminClient().from("districts").select("id, name_en").order("sort_order");
  if (error) fail("districts", error);
  return data;
}
