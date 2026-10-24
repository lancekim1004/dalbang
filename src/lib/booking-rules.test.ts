import { describe, expect, it } from "vitest";
import { bookingCodeSchema, bookingRequestSchema, evaluateRequest, generateBookingCode } from "./booking-rules";

const today = "2027-01-10";
const room = { monthlyPrice: 900_000, deposit: 500_000, maintenanceFee: 100_000, minNights: 30, maxGuests: 2 };
const base = { room, booked: [], myPending: [], today };
const input = { checkIn: "2027-03-15", checkOut: "2027-05-20", guests: 1 };

describe("evaluateRequest — 예약 요청 서버 검사", () => {
  it("정상 요청은 서버가 다시 계산한 금액을 돌려줌 (PLAN 4-3 예시: 2,650,000원)", () => {
    const r = evaluateRequest({ ...base, input });
    expect("price" in r && r.price.total).toBe(2_650_000);
  });
  it("숨겼거나 없는 방은 거부", () => {
    expect(evaluateRequest({ ...base, room: null, input })).toEqual({ error: "roomUnavailable" });
  });
  it("최대 인원 초과는 거부", () => {
    expect(evaluateRequest({ ...base, input: { ...input, guests: 3 } })).toEqual({ error: "tooManyGuests" });
  });
  it("30박 미만은 거부", () => {
    expect(evaluateRequest({ ...base, input: { ...input, checkOut: "2027-04-10" } })).toEqual({ error: "minStay" });
  });
  it("확정 예약과 겹치면 거부", () => {
    const booked = [{ roomId: "r", checkIn: "2027-05-01", checkOut: "2027-06-01", status: "approved" as const }];
    expect(evaluateRequest({ ...base, booked, input })).toEqual({ error: "datesTaken" });
  });
  it("다른 손님의 대기 요청과는 겹쳐도 됨", () => {
    const booked = [{ roomId: "r", checkIn: "2027-05-01", checkOut: "2027-06-01", status: "pending" as const }];
    expect("price" in evaluateRequest({ ...base, booked, input })).toBe(true);
  });
  it("같은 이메일로 겹치는 대기 요청이 이미 있으면 거부", () => {
    const myPending = [{ checkIn: "2027-04-01", checkOut: "2027-05-01" }];
    expect(evaluateRequest({ ...base, myPending, input })).toEqual({ error: "duplicatePending" });
  });
  it("같은 이메일이라도 날짜가 안 겹치면 허용 (퇴실일 = 입주일)", () => {
    const myPending = [{ checkIn: "2027-02-01", checkOut: "2027-03-15" }];
    expect("price" in evaluateRequest({ ...base, myPending, input })).toBe(true);
  });
});

describe("bookingRequestSchema — 요청 양식 검사", () => {
  const form = {
    roomId: "cffec1dc-da44-5f56-8173-0d4665b109f3",
    checkIn: "2027-03-15", checkOut: "2027-05-20", guests: "1",
    name: "  Alex Kim ", email: " Alex@Example.COM ", phone: "", nationality: "", message: "", consent: "on",
  };
  it("정상 양식: 이메일은 소문자로, 빈 칸은 없음으로", () => {
    const r = bookingRequestSchema.parse(form);
    expect(r.email).toBe("alex@example.com");
    expect(r.name).toBe("Alex Kim");
    expect(r.phone).toBeUndefined();
    expect(r.guests).toBe(1);
  });
  it("개인정보 동의가 없으면 거부", () => {
    expect(bookingRequestSchema.safeParse({ ...form, consent: undefined }).success).toBe(false);
  });
  it("잘못된 이메일·날짜·방 번호는 거부", () => {
    expect(bookingRequestSchema.safeParse({ ...form, email: "nope" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...form, checkIn: "2027-02-30" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...form, roomId: "r-hg-a" }).success).toBe(false);
  });
  it("너무 긴 메시지는 거부", () => {
    expect(bookingRequestSchema.safeParse({ ...form, message: "a".repeat(1001) }).success).toBe(false);
  });
});

describe("예약 번호", () => {
  it("DB-로 시작하는 6자리, 헷갈리는 글자 없음", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateBookingCode();
      expect(code).toMatch(/^DB-[A-HJ-NP-Z2-9]{6}$/);
    }
  });
  it("조회할 때 소문자·띄어쓰기로 입력해도 인식", () => {
    expect(bookingCodeSchema.parse(" db-7k3q9p ")).toBe("DB-7K3Q9P");
  });
});
