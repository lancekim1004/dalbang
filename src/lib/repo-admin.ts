// 관리자 화면용 자료 (서버 권한). 부르기 전에 반드시 requireAdmin()으로 관리자 확인.
import "server-only";
import { addDaysIso, todayInSeoul } from "./dates";
import { getAdminClient } from "./supabase/admin-client";
import type { BookingStatus } from "./types";

function fail(what: string, error: { message: string }): never {
  console.error(`[repo-admin] ${what}: ${error.message}`);
  throw new Error("Failed to load admin data.");
}

/** 이번 달 1일 ~ 다음 달 1일 (서울 기준) */
function thisMonth() {
  const today = todayInSeoul();
  const start = `${today.slice(0, 7)}-01`;
  const [y, m] = start.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { start, next };
}

export async function getDashboardStats() {
  const db = getAdminClient();
  const { start, next } = thisMonth();
  const count = async (q: PromiseLike<{ count: number | null; error: { message: string } | null }>) => {
    const r = await q;
    if (r.error) fail("dashboard", r.error);
    return r.count ?? 0;
  };
  const head = { count: "exact" as const, head: true };
  const [pending, moveIns, moveOuts, failedEmails] = await Promise.all([
    count(db.from("bookings").select("id", head).eq("status", "pending")),
    count(db.from("bookings").select("id", head).eq("status", "approved").gte("check_in", start).lt("check_in", next)),
    count(db.from("bookings").select("id", head).eq("status", "approved").gte("check_out", start).lt("check_out", next)),
    count(db.from("email_logs").select("id", head).eq("status", "failed")),
  ]);
  return { pending, moveIns, moveOuts, failedEmails };
}

export interface AdminBookingRow {
  id: string;
  code: string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  totalAmount: number;
  createdAt: string;
  roomId: string;
  roomName: string;
  listingTitle: string;
}

const BOOKING_COLUMNS =
  "id, code, status, check_in, check_out, guest_name, guest_email, total_amount, created_at, room:rooms!inner(id, name, listing:listings!inner(title))";

type BookingJoinRow = {
  id: string; code: string; status: BookingStatus; check_in: string; check_out: string; guest_name: string;
  guest_email: string; total_amount: number; created_at: string;
  room: { id: string; name: string; listing: { title: string } };
};

const toRow = (b: BookingJoinRow): AdminBookingRow => ({
  id: b.id, code: b.code, status: b.status, checkIn: b.check_in, checkOut: b.check_out, guestName: b.guest_name,
  guestEmail: b.guest_email, totalAmount: b.total_amount, createdAt: b.created_at,
  roomId: b.room.id, roomName: b.room.name, listingTitle: b.room.listing.title,
});

export async function listAdminBookings(status?: BookingStatus): Promise<AdminBookingRow[]> {
  let q = getAdminClient().from("bookings").select(BOOKING_COLUMNS).order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q.overrideTypes<BookingJoinRow[], { merge: false }>();
  if (error) fail("bookings", error);
  return data.map(toRow);
}

/** 달력용: 오늘 기준 앞뒤 기간의 대기·확정 예약 */
export async function listCalendarBookings(from: string, days: number): Promise<AdminBookingRow[]> {
  const to = addDaysIso(from, days);
  const { data, error } = await getAdminClient()
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .in("status", ["pending", "approved", "awaiting_payment", "paid"])
    .lt("check_in", to)
    .gt("check_out", from)
    .overrideTypes<BookingJoinRow[], { merge: false }>();
  if (error) fail("calendar", error);
  return data.map(toRow);
}
