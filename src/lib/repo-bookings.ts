// 예약 요청 저장·조회 (서버 권한). 화면은 repo.ts를 통해 이 함수들을 쓴다.
// 손님 개인정보는 로그에 찍지 않는다.
import "server-only";
import { z } from "zod";
import { generateBookingCode, type BookingRequestInput } from "./booking-rules";
import type { PriceBreakdown } from "./pricing";
import { getAdminClient } from "./supabase/admin-client";
import type { BookingStatus } from "./types";

function fail(what: string, error: { message: string; code?: string }): never {
  console.error(`[repo-bookings] ${what}: ${error.code ?? ""} ${error.message}`);
  throw new Error("Failed to save or load booking.");
}

/** 같은 이메일로 이 방에 넣은 대기 요청 (중복 요청 막기용) */
export async function getMyPendingRanges(roomId: string, email: string) {
  const { data, error } = await getAdminClient()
    .from("bookings")
    .select("check_in, check_out")
    .eq("room_id", roomId)
    .eq("guest_email", email)
    .eq("status", "pending");
  if (error) fail("pending ranges", error);
  return data.map((b) => ({ checkIn: b.check_in, checkOut: b.check_out }));
}

interface PriceSnapshot extends PriceBreakdown {
  currency: "KRW";
  monthlyPrice: number;
  maintenanceFee: number;
  checkIn: string;
  checkOut: string;
}

/** 대기(pending) 상태로 저장하고 예약 id·번호를 돌려준다. 금액은 서버가 계산한 값만 받는다. */
export async function createBookingRequest(
  input: BookingRequestInput,
  price: PriceBreakdown,
  room: { monthlyPrice: number; maintenanceFee: number },
): Promise<{ id: string; code: string }> {
  const db = getAdminClient();
  const snapshot: PriceSnapshot = {
    ...price,
    currency: "KRW",
    monthlyPrice: room.monthlyPrice,
    maintenanceFee: room.maintenanceFee,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  };
  // 예약 번호가 우연히 겹치면(약 10억분의 1) 새 번호로 다시 시도
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateBookingCode();
    const { data, error } = await db
      .from("bookings")
      .insert({
        code,
        room_id: input.roomId,
        check_in: input.checkIn,
        check_out: input.checkOut,
        status: "pending",
        guest_name: input.name,
        guest_email: input.email,
        guest_phone: input.phone ?? null,
        nationality: input.nationality ?? null,
        guests_count: input.guests,
        message: input.message ?? null,
        price_snapshot: { ...snapshot },
        total_amount: price.total,
        privacy_consent_at: new Date().toISOString(),
        locale: "en",
      })
      .select("id")
      .single();
    if (error?.code === "23505") continue; // 번호 중복
    if (error) fail("insert booking", error);
    // 처리 기록. 실패해도 요청 자체는 이미 저장됐으므로 기록만 남기고 넘어간다
    const ev = await db.from("booking_events").insert({ booking_id: data.id, from_status: null, to_status: "pending", actor: "guest" });
    if (ev.error) console.error(`[repo-bookings] booking event: ${ev.error.message}`);
    return { id: data.id, code };
  }
  throw new Error("Failed to create a unique booking code.");
}

// 저장된 금액 내역 모양 확인 (데모 예약처럼 내역이 없으면 null)
const priceSchema = z.object({
  nights: z.number(), months: z.number(), extraDays: z.number(), dailyRate: z.number(),
  rentForMonths: z.number(), rentForExtraDays: z.number(), maintenanceTotal: z.number(),
  deposit: z.number(), total: z.number(),
});

export interface BookingSummary {
  code: string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  totalAmount: number;
  price: PriceBreakdown | null;
  rejectReason: string | null;
  roomId: string;
  roomName: string;
  listingTitle: string;
  createdAt: string;
}

/** 예약 번호 + 이메일이 둘 다 맞을 때만 돌려준다 (하나라도 틀리면 null — 어느 쪽인지 알려주지 않음) */
export async function findBooking(code: string, email: string): Promise<BookingSummary | null> {
  const { data, error } = await getAdminClient()
    .from("bookings")
    .select("code, status, check_in, check_out, guests_count, guest_name, total_amount, price_snapshot, reject_reason, created_at, room:rooms!inner(id, name, listing:listings!inner(title))")
    .eq("code", code)
    .eq("guest_email", email)
    .maybeSingle();
  if (error) fail("find booking", error);
  if (!data) return null;
  return {
    code: data.code,
    status: data.status,
    checkIn: data.check_in,
    checkOut: data.check_out,
    guests: data.guests_count,
    guestName: data.guest_name,
    totalAmount: data.total_amount,
    price: priceSchema.safeParse(data.price_snapshot).data ?? null,
    rejectReason: data.reject_reason,
    roomId: data.room.id,
    roomName: data.room.name,
    listingTitle: data.room.listing.title,
    createdAt: data.created_at,
  };
}
