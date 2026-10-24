// 날짜는 "YYYY-MM-DD" 글자로 다루고, 계산할 때만 Date로 바꾼다.
// 모든 기준은 서울 시간(Asia/Seoul).
import { addDays, addMonths, differenceInCalendarDays, format } from "date-fns";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-03-15" → 날짜 객체 (시각 없이 그 날짜 자정) */
export function parseDate(iso: string): Date {
  if (!ISO_DATE.test(iso)) throw new Error(`Invalid date: ${iso}`);
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // 2월 30일처럼 없는 날짜 거르기
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Invalid date: ${iso}`);
  }
  return date;
}

export function isValidIsoDate(iso: string): boolean {
  try {
    parseDate(iso);
    return true;
  } catch {
    return false;
  }
}

export function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** 서울 기준 오늘 날짜 */
export function todayInSeoul(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDaysIso(iso: string, days: number): string {
  return toIso(addDays(parseDate(iso), days));
}

export function addMonthsIso(iso: string, months: number): string {
  // date-fns는 없는 날짜를 그 달 마지막 날로 맞춰줌 (1/31 + 1개월 = 2/28)
  return toIso(addMonths(parseDate(iso), months));
}

/** 숙박일수 = 퇴실일 − 입주일 */
export function nightsBetween(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(parseDate(checkOut), parseDate(checkIn));
}

/** 두 기간이 겹치는지. 퇴실일 당일 입주는 겹침 아님. */
export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && bIn < aOut;
}
