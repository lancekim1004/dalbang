// DB 시험 공통: 비밀 키 접속 + 시험용 예약 만들기·지우기
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

process.loadEnvFile(".env.local");
export const db = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});

const created: string[] = [];
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const code = () => "DB-" + Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * 32)]).join("");

/** 시험용 예약 하나 넣기 (손님 정보는 가짜, 날짜는 먼 미래라 실제 예약과 안 섞임) */
export async function insertBooking(roomId: string, checkIn: string, checkOut: string, status: "pending" | "approved" = "pending") {
  const { data, error } = await db
    .from("bookings")
    .insert({
      code: code(), room_id: roomId, check_in: checkIn, check_out: checkOut, status,
      guest_name: "DB test", guest_email: "db-test@example.com", price_snapshot: { test: true }, total_amount: 0,
    })
    .select("id")
    .single();
  if (data) created.push(data.id);
  return { id: data?.id, error };
}

export async function cleanup() {
  if (created.length) await db.from("bookings").delete().in("id", created.splice(0));
}

export async function anyRoomId(): Promise<string> {
  const { data } = await db.from("rooms").select("id").limit(1).single();
  return data!.id;
}
