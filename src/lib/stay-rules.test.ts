import { describe, expect, it } from "vitest";
import { checkStay, isConfirmed } from "./stay-rules";
import type { BookedRange } from "./types";

const today = "2027-01-10";
const base = { minNights: 30, booked: [] as BookedRange[], today };

describe("checkStay — 예약 요청 가능 조건", () => {
  it("정상 30박은 통과", () => {
    expect(checkStay({ ...base, checkIn: "2027-02-01", checkOut: "2027-03-03" })).toBeNull();
  });
  it("29박은 거부", () => {
    expect(checkStay({ ...base, checkIn: "2027-02-01", checkOut: "2027-03-02" })).toBe("minStay");
  });
  it("2/1 → 3/1 은 1개월이지만 28박이라 거부", () => {
    expect(checkStay({ ...base, checkIn: "2027-02-01", checkOut: "2027-03-01" })).toBe("minStay");
  });
  it("방의 최소 기간이 60박이면 45박 거부", () => {
    expect(checkStay({ ...base, minNights: 60, checkIn: "2027-02-01", checkOut: "2027-03-18" })).toBe("minStay");
  });
  it("오늘 입주는 거부 (내일부터 가능)", () => {
    expect(checkStay({ ...base, checkIn: today, checkOut: "2027-02-20" })).toBe("checkinTooSoon");
  });
  it("12개월 넘게 먼 입주일 거부", () => {
    expect(checkStay({ ...base, checkIn: "2028-01-11", checkOut: "2028-03-01" })).toBe("checkinTooFar");
  });
  it("365박 초과 거부", () => {
    expect(checkStay({ ...base, checkIn: "2027-02-01", checkOut: "2028-02-02" })).toBe("maxStay");
  });
  it("퇴실일이 입주일보다 빠르면 거부", () => {
    expect(checkStay({ ...base, checkIn: "2027-03-01", checkOut: "2027-02-01" })).toBe("checkoutBeforeCheckin");
  });
  it("없는 날짜 거부", () => {
    expect(checkStay({ ...base, checkIn: "2027-02-30", checkOut: "2027-04-01" })).toBe("invalidDate");
  });

  const booked: BookedRange[] = [
    { roomId: "r1", checkIn: "2027-03-01", checkOut: "2027-04-01", status: "approved" },
    { roomId: "r1", checkIn: "2027-06-01", checkOut: "2027-07-15", status: "pending" },
  ];
  it("승인된 예약과 겹치면 거부", () => {
    expect(checkStay({ ...base, booked, checkIn: "2027-02-10", checkOut: "2027-03-15" })).toBe("datesTaken");
  });
  it("승인된 예약 퇴실일에 입주는 가능 (겹침 아님)", () => {
    expect(checkStay({ ...base, booked, checkIn: "2027-04-01", checkOut: "2027-05-01" })).toBeNull();
  });
  it("승인된 예약 입주일에 퇴실도 가능", () => {
    expect(checkStay({ ...base, booked, checkIn: "2027-01-20", checkOut: "2027-03-01" })).toBeNull();
  });
  it("대기(pending) 요청과는 겹쳐도 가능", () => {
    expect(checkStay({ ...base, booked, checkIn: "2027-06-10", checkOut: "2027-07-20" })).toBeNull();
  });
});

describe("isConfirmed — 날짜를 차지하는 예약 상태 (DB 겹침 금지 규칙과 같은 기준)", () => {
  it("승인·결제 대기·결제 완료는 확정", () => {
    expect(["approved", "awaiting_payment", "paid"].every((s) => isConfirmed(s as BookedRange["status"]))).toBe(true);
  });
  it("대기·거절·취소·만료는 확정 아님", () => {
    expect(["pending", "rejected", "cancelled", "expired"].some((s) => isConfirmed(s as BookedRange["status"]))).toBe(false);
  });
  it("결제 완료 예약과 겹치는 날짜는 거부, 거절된 예약과는 허용", () => {
    const range = { roomId: "r1", checkIn: "2027-02-10", checkOut: "2027-03-20" };
    const stay = { ...base, checkIn: "2027-02-01", checkOut: "2027-03-03" };
    expect(checkStay({ ...stay, booked: [{ ...range, status: "paid" }] })).toBe("datesTaken");
    expect(checkStay({ ...stay, booked: [{ ...range, status: "rejected" }] })).toBeNull();
  });
});
