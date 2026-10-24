// 관리자 예약 상세 (A7). 부르기 전 requireAdmin() 필수.
import "server-only";
import { z } from "zod";
import type { PriceBreakdown } from "./pricing";
import { getAdminClient } from "./supabase/admin-client";
import type { Database } from "./supabase/database.types";

type T = Database["public"]["Tables"];
export type AdminBookingDetail = T["bookings"]["Row"] & {
  room: { id: string; name: string; listing: { id: string; title: string } };
  events: T["booking_events"]["Row"][];
  emails: T["email_logs"]["Row"][];
  overlapping: Pick<T["bookings"]["Row"], "id" | "code" | "status" | "check_in" | "check_out" | "guest_name">[];
  price: PriceBreakdown | null;
};

const priceSchema = z.object({
  nights: z.number(), months: z.number(), extraDays: z.number(), dailyRate: z.number(), rentForMonths: z.number(),
  rentForExtraDays: z.number(), maintenanceTotal: z.number(), deposit: z.number(), total: z.number(),
});

export async function getAdminBookingDetail(id: string): Promise<AdminBookingDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const db = getAdminClient();
  const { data, error } = await db
    .from("bookings")
    .select("*, room:rooms!inner(id, name, listing:listings!inner(id, title)), events:booking_events(*), emails:email_logs(*)")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Omit<AdminBookingDetail, "overlapping" | "price"> | null, { merge: false }>();
  if (error) {
    console.error(`[repo-admin-booking] ${error.message}`);
    throw new Error("Failed to load booking.");
  }
  if (!data) return null;
  // 같은 방에서 날짜가 겹치는 다른 대기·확정 예약 (승인 전에 확인용)
  const { data: overlapping } = await db
    .from("bookings")
    .select("id, code, status, check_in, check_out, guest_name")
    .eq("room_id", data.room_id)
    .neq("id", id)
    .in("status", ["pending", "approved", "awaiting_payment", "paid"])
    .lt("check_in", data.check_out)
    .gt("check_out", data.check_in);
  const byTime = <X extends { created_at: string }>(a: X, b: X) => a.created_at.localeCompare(b.created_at);
  return {
    ...data,
    events: data.events.sort(byTime),
    emails: data.emails.sort(byTime),
    overlapping: overlapping ?? [],
    price: priceSchema.safeParse(data.price_snapshot).data ?? null,
  };
}
