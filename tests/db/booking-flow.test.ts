// 3-8. 주요 흐름: 검색 → 요청 → (서버 검사·저장) → 관리자 승인 → 손님 조회. 화면 대신 서버 코드를 그대로 부른다.
import "./helpers"; // .env.local 불러오기 (맨 먼저)
import { afterAll, describe, expect, it } from "vitest";
import { bookingRequestSchema, evaluateRequest } from "@/lib/booking-rules";
import { addDaysIso, todayInSeoul } from "@/lib/dates";
import { createBookingRequest, findBooking, getBookedRanges, getMyPendingRanges, getRoom, searchRooms } from "@/lib/repo";
import { db } from "./helpers";

const created: string[] = [];
afterAll(async () => {
  if (created.length) await db.from("bookings").delete().in("id", created);
});

describe("손님 요청부터 조회까지", () => {
  it("빈 방 검색 → 요청 저장 → 승인 → 조회 시 '승인됨'", async () => {
    // 1) 검색: 11개월 뒤 입주, 1개월
    const moveIn = addDaysIso(todayInSeoul(), 330);
    const rooms = await searchRooms({ moveIn, months: 1 });
    expect(rooms.length).toBeGreaterThan(0);
    const target = rooms[0];

    // 2) 요청 양식 → 서버 검사 → 저장
    const form = bookingRequestSchema.parse({
      roomId: target.id, checkIn: moveIn, checkOut: addDaysIso(moveIn, Math.max(30, target.minNights)), guests: "1",
      name: "Flow Test", email: "flow-test@example.com", consent: "on",
    });
    const [room, booked, mine] = await Promise.all([getRoom(form.roomId), getBookedRanges(form.roomId), getMyPendingRanges(form.roomId, form.email)]);
    const result = evaluateRequest({ input: form, room, booked, myPending: mine });
    expect("price" in result).toBe(true);
    if (!("price" in result)) return;
    const saved = await createBookingRequest(form, result.price, room!);
    created.push(saved.id);
    expect(saved.code).toMatch(/^DB-[A-Z0-9]{6}$/);

    // 같은 사람이 같은 날짜로 또 보내면 거부
    const again = evaluateRequest({ input: form, room, booked, myPending: await getMyPendingRanges(form.roomId, form.email) });
    expect(again).toEqual({ error: "duplicatePending" });

    // 3) 조회: 대기 중
    expect((await findBooking(saved.code, "flow-test@example.com"))?.status).toBe("pending");
    expect(await findBooking(saved.code, "someone-else@example.com")).toBeNull();

    // 4) 관리자 승인 (관리자 기능이 부르는 DB 함수)
    const { error } = await db.rpc("decide_booking", {
      p_booking_id: saved.id, p_action: "approve", p_actor: "admin:flow-test", p_reason: null as unknown as string,
      p_auto_reject_reason: "taken", p_decided_by: null as unknown as string,
    });
    expect(error).toBeNull();

    // 5) 조회: 승인됨 + 저장된 금액이 서버 계산과 같음
    const after = await findBooking(saved.code, "flow-test@example.com");
    expect(after?.status).toBe("approved");
    expect(after?.totalAmount).toBe(result.price.total);

    // 6) 이제 그 날짜는 검색에서 빠짐
    const again2 = await searchRooms({ moveIn, months: 1 });
    expect(again2.some((r) => r.id === target.id)).toBe(false);
  });
});
