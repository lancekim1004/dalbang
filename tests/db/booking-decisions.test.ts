// 2-7·2-10. 승인·거절·취소 함수와 자동 만료 함수
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anyRoomId, cleanup, db, insertBooking } from "./helpers";

let roomId = "";
beforeAll(async () => { roomId = await anyRoomId(); });
afterAll(cleanup);

const decide = (id: string, action: string, reason: string | null = null) =>
  db.rpc("decide_booking", {
    p_booking_id: id, p_action: action, p_actor: "admin:test@example.com",
    p_reason: reason as string, p_auto_reject_reason: "Dates taken", p_decided_by: null as unknown as string,
  });

describe("decide_booking", () => {
  it("승인하면 겹치는 대기 요청은 자동 거절, 안 겹치는 요청은 그대로", async () => {
    const a = await insertBooking(roomId, "2032-01-01", "2032-02-01");
    const b = await insertBooking(roomId, "2032-01-15", "2032-02-15");
    const c = await insertBooking(roomId, "2032-02-01", "2032-03-05"); // 퇴실일=입주일 → 안 겹침
    const { data, error } = await decide(a.id!, "approve");
    expect(error).toBeNull();
    expect(data).toEqual(expect.arrayContaining([
      { booking_id: a.id, new_status: "approved", auto: false },
      { booking_id: b.id, new_status: "rejected", auto: true },
    ]));
    const { data: rows } = await db.from("bookings").select("id, status, reject_reason").in("id", [b.id!, c.id!]);
    expect(rows!.find((r) => r.id === b.id)).toMatchObject({ status: "rejected", reject_reason: "Dates taken" });
    expect(rows!.find((r) => r.id === c.id)!.status).toBe("pending");
    const { data: ev } = await db.from("booking_events").select("actor").eq("booking_id", b.id!);
    expect(ev).toEqual([{ actor: "system" }]);
  });

  it("거절은 사유와 함께 기록되고, 거절된 요청은 다시 승인할 수 없음", async () => {
    const a = await insertBooking(roomId, "2032-05-01", "2032-06-01");
    expect((await decide(a.id!, "reject", "Room under repair")).error).toBeNull();
    const { data } = await db.from("bookings").select("status, reject_reason").eq("id", a.id!).single();
    expect(data).toEqual({ status: "rejected", reject_reason: "Room under repair" });
    const again = await decide(a.id!, "approve");
    expect(again.error?.message).toContain("invalid_transition");
  });

  it("확정 예약만 취소 가능", async () => {
    const a = await insertBooking(roomId, "2032-07-01", "2032-08-01");
    expect((await decide(a.id!, "cancel")).error?.message).toContain("invalid_transition");
    await decide(a.id!, "approve");
    expect((await decide(a.id!, "cancel", "Guest asked")).error).toBeNull();
  });

  it("방문자 키로는 부를 수 없음", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
    const { error } = await anon.rpc("decide_booking", { p_booking_id: "00000000-0000-0000-0000-000000000000", p_action: "approve", p_actor: "x", p_reason: "", p_auto_reject_reason: "", p_decided_by: "00000000-0000-0000-0000-000000000000" });
    expect(error).not.toBeNull();
  });
});

describe("expire_stale_bookings", () => {
  it("입주일이 지난 대기 요청은 만료", async () => {
    const a = await insertBooking(roomId, "2020-01-01", "2020-02-01");
    const { data, error } = await db.rpc("expire_stale_bookings");
    expect(error).toBeNull();
    expect(data!.map((d) => d.booking_id)).toContain(a.id);
    const { data: row } = await db.from("bookings").select("status").eq("id", a.id!).single();
    expect(row!.status).toBe("expired");
  });
});

describe("purge_old_personal_data", () => {
  it("퇴실 1년 지난 예약은 개인정보만 지우고 날짜·금액은 남김", async () => {
    const a = await insertBooking(roomId, "2020-03-01", "2020-04-01", "approved");
    const { error } = await db.rpc("purge_old_personal_data");
    expect(error).toBeNull();
    const { data } = await db.from("bookings").select("guest_name, guest_email, check_in, personal_data_deleted_at").eq("id", a.id!).single();
    expect(data!.guest_name).toBe("Deleted guest");
    expect(data!.guest_email).not.toContain("db-test");
    expect(data!.check_in).toBe("2020-03-01");
    expect(data!.personal_data_deleted_at).not.toBeNull();
  });
});
