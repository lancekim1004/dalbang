// 예약 요청 검사 (PLAN.md 4-2). DB와 무관한 순수 규칙만 둬서 자동 시험이 쉽게 한다.
// 서버는 저장 직전에 반드시 이 함수로 다시 검사하고 금액도 다시 계산한다.
import { z } from "zod";
import { isValidIsoDate, rangesOverlap } from "./dates";
import { calcPrice, type PriceBreakdown } from "./pricing";
import { checkStay, type StayError } from "./stay-rules";
import type { BookedRange } from "./types";

export const MAX_MESSAGE_LENGTH = 1000;

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

/** 손님이 보낸 요청 양식. 이상한 값은 여기서 걸러진다. */
export const bookingRequestSchema = z.object({
  roomId: z.uuid(),
  checkIn: z.string().refine(isValidIsoDate),
  checkOut: z.string().refine(isValidIsoDate),
  guests: z.coerce.number().int().min(1).max(10),
  name: z.string().trim().min(1).max(100),
  // 조회할 때 대소문자 상관없이 찾도록 소문자로 저장
  email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email().max(254)),
  phone: optionalText(40),
  nationality: optionalText(60),
  message: optionalText(MAX_MESSAGE_LENGTH),
  consent: z.literal("on"), // 개인정보 동의 체크 필수
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type RequestField = keyof BookingRequestInput;

/** 화면에 보여줄 문제 이름 (messages/en.json의 RequestErrors 이름과 같음) */
export type RequestError = StayError | "roomUnavailable" | "tooManyGuests" | "duplicatePending";

interface RequestCheck {
  input: Pick<BookingRequestInput, "checkIn" | "checkOut" | "guests">;
  room: { monthlyPrice: number; deposit: number; maintenanceFee: number; minNights: number; maxGuests: number } | null;
  booked: BookedRange[]; // 이 방의 예약 날짜
  myPending: { checkIn: string; checkOut: string }[]; // 같은 이메일로 이 방에 넣은 대기 요청
  today?: string; // 시험용
}

/** 문제가 있으면 첫 번째 문제, 없으면 서버에서 다시 계산한 금액 */
export function evaluateRequest(c: RequestCheck): { error: RequestError } | { price: PriceBreakdown } {
  if (!c.room) return { error: "roomUnavailable" };
  const { checkIn, checkOut, guests } = c.input;
  if (guests > c.room.maxGuests) return { error: "tooManyGuests" };
  const stayError = checkStay({ checkIn, checkOut, minNights: c.room.minNights, booked: c.booked, today: c.today });
  if (stayError) return { error: stayError };
  if (c.myPending.some((p) => rangesOverlap(checkIn, checkOut, p.checkIn, p.checkOut))) {
    return { error: "duplicatePending" };
  }
  return { price: calcPrice(c.room, checkIn, checkOut) };
}

// 헷갈리는 글자(0·O·1·I) 뺀 32글자 → 6자리면 약 10억 가지라 추측이 어렵다
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 예약 번호 "DB-7K3Q9P" */
export function generateBookingCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  // 256은 32로 나누어떨어져서 글자가 고르게 나온다
  return "DB-" + Array.from(bytes, (b) => CODE_CHARS[b % 32]).join("");
}

export const bookingCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^DB-[A-Z0-9]{6}$/);
