// 예약 메일 보내기 + 결과 기록(email_logs). 실패해도 예외를 던지지 않는다 → 예약 처리는 항상 그대로 완료.
import "server-only";
import { getAdminClient } from "../supabase/admin-client";
import { buildMail, type MailBooking } from "./templates";
import { MailNotConfiguredError, sendMail } from "./transport";
import type { EmailType } from "./types";

async function loadBooking(id: string): Promise<MailBooking | null> {
  const { data } = await getAdminClient()
    .from("bookings")
    .select("id, code, guest_name, guest_email, check_in, check_out, guests_count, total_amount, reject_reason, message, room:rooms!inner(name, listing:listings!inner(title, address_en, district:districts!inner(slug)))")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<{
      id: string; code: string; guest_name: string; guest_email: string; check_in: string; check_out: string; guests_count: number;
      total_amount: number; reject_reason: string | null; message: string | null;
      room: { name: string; listing: { title: string; address_en: string; district: { slug: string } } };
    } | null, { merge: false }>();
  if (!data) return null;
  return {
    id: data.id, code: data.code, guestName: data.guest_name, guestEmail: data.guest_email, checkIn: data.check_in,
    checkOut: data.check_out, guests: data.guests_count, totalAmount: data.total_amount, rejectReason: data.reject_reason,
    message: data.message, roomName: data.room.name, listingTitle: data.room.listing.title,
    addressEn: data.room.listing.address_en, districtSlug: data.room.listing.district.slug,
  };
}

/** 메일 한 통 보내고 기록. 성공하면 true */
export async function sendBookingEmail(bookingId: string, type: EmailType): Promise<boolean> {
  const db = getAdminClient();
  let error: string | null = null;
  try {
    const booking = await loadBooking(bookingId);
    if (!booking) throw new Error("Booking not found");
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
    if (type === "admin_new_request" && !adminEmail) throw new MailNotConfiguredError();
    await sendMail(buildMail(type, booking, adminEmail));
  } catch (e) {
    // 손님 개인정보(이메일 주소 등)는 기록에 남기지 않고 원인만 남긴다
    error = e instanceof MailNotConfiguredError ? "not_configured" : (e instanceof Error ? e.message : "unknown").slice(0, 300);
    console.error(`[mail] ${type} failed: ${error}`);
  }
  await db.from("email_logs").insert({ booking_id: bookingId, type, status: error ? "failed" : "sent", error });
  return !error;
}
