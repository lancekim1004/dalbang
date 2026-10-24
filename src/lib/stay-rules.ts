// 예약 요청 가능 조건 (PLAN.md 4-2). 화면 미리보기와 서버 검사에서 같이 쓴다.
import { addDaysIso, addMonthsIso, isValidIsoDate, nightsBetween, rangesOverlap, todayInSeoul } from "./dates";
import type { BookedRange, BookingStatus } from "./types";

export const MIN_NIGHTS = 30;
export const MAX_NIGHTS = 365;
export const MAX_MONTHS_AHEAD = 12;

/** 날짜를 차지하는 확정 예약인지 (DB 겹침 금지 규칙과 같은 기준) */
export function isConfirmed(status: BookingStatus): boolean {
  return status === "approved" || status === "awaiting_payment" || status === "paid";
}

export type StayError =
  | "invalidDate"
  | "checkoutBeforeCheckin"
  | "checkinTooSoon"
  | "checkinTooFar"
  | "minStay"
  | "maxStay"
  | "datesTaken";

export interface StayCheck {
  checkIn: string;
  checkOut: string;
  minNights: number; // 방마다 다를 수 있음 (30 이상)
  booked: BookedRange[]; // 이 방의 예약들
  today?: string; // 시험용. 없으면 서울 오늘
}

/** 문제가 없으면 null, 있으면 첫 번째 문제 이름 */
export function checkStay(input: StayCheck): StayError | null {
  const { checkIn, checkOut } = input;
  if (!isValidIsoDate(checkIn) || !isValidIsoDate(checkOut)) return "invalidDate";
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) return "checkoutBeforeCheckin";

  const today = input.today ?? todayInSeoul();
  if (checkIn < addDaysIso(today, 1)) return "checkinTooSoon";
  if (checkIn > addMonthsIso(today, MAX_MONTHS_AHEAD)) return "checkinTooFar";

  const minNights = Math.max(MIN_NIGHTS, input.minNights);
  if (nights < minNights) return "minStay";
  if (nights > MAX_NIGHTS) return "maxStay";

  // 확정된 예약과 겹치면 불가 (대기 요청끼리는 겹쳐도 됨)
  const taken = input.booked.some(
    (b) => isConfirmed(b.status) && rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
  );
  if (taken) return "datesTaken";
  return null;
}
