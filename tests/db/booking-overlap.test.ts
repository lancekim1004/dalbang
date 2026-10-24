// 2-3. "확정된 예약끼리 날짜 겹침 금지"를 DB가 직접 막는지 (PLAN 4-4)
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anyRoomId, cleanup, db, insertBooking } from "./helpers";

let roomId = "";
beforeAll(async () => { roomId = await anyRoomId(); });
afterAll(cleanup);

describe("DB 겹침 금지 규칙", () => {
  it("확정 예약과 겹치는 확정 예약은 저장 안 됨", async () => {
    const a = await insertBooking(roomId, "2031-01-01", "2031-02-01", "approved");
    expect(a.error).toBeNull();
    const b = await insertBooking(roomId, "2031-01-20", "2031-03-01", "approved");
    expect(b.error?.code).toBe("23P01"); // 겹침 제외 제약 위반
  });

  it("퇴실일 = 다음 손님 입주일은 겹침 아님", async () => {
    const a = await insertBooking(roomId, "2031-04-01", "2031-05-01", "approved");
    const b = await insertBooking(roomId, "2031-05-01", "2031-06-01", "approved");
    expect(a.error).toBeNull();
    expect(b.error).toBeNull();
  });

  it("대기 요청끼리는 겹쳐도 저장됨", async () => {
    const a = await insertBooking(roomId, "2031-07-01", "2031-08-01");
    const b = await insertBooking(roomId, "2031-07-10", "2031-08-10");
    expect(a.error).toBeNull();
    expect(b.error).toBeNull();
  });

  it("관리자 여러 명이 동시에 겹치는 요청을 승인해도 딱 1건만 성공", async () => {
    const pending = await Promise.all(
      Array.from({ length: 5 }, (_, i) => insertBooking(roomId, `2031-09-0${i + 1}`, "2031-10-15")),
    );
    const results = await Promise.all(
      pending.map((p) => db.from("bookings").update({ status: "approved" }).eq("id", p.id!).select("id")),
    );
    const ok = results.filter((r) => !r.error);
    expect(ok).toHaveLength(1);
    expect(results.filter((r) => r.error?.code === "23P01")).toHaveLength(4);
  });
});
