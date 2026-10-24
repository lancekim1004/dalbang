// 총액 계산은 이 파일에서만 한다 (CLAUDE.md 규칙). PLAN.md 4-3 참고.
import { addMonthsIso, nightsBetween, parseDate } from "./dates";

export interface PriceInput {
  monthlyPrice: number;
  deposit: number;
  maintenanceFee: number;
}

export interface PriceBreakdown {
  nights: number;
  months: number; // 달력 기준 꽉 찬 개월 수
  extraDays: number; // 개월 수를 빼고 남은 날
  dailyRate: number; // 월 가격 ÷ 30 (반올림)
  rentForMonths: number;
  rentForExtraDays: number;
  maintenanceTotal: number; // 관리비 × 개월 수
  deposit: number;
  total: number;
}

/** 입주일부터 "같은 날짜"를 1개월로 세서, 꽉 찬 개월 수와 남는 날을 구한다. */
export function splitStay(checkIn: string, checkOut: string) {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) throw new Error("Check-out must be after check-in.");
  let months = 0;
  // 입주일 기준으로 n개월 뒤가 퇴실일을 넘지 않는 최대 n
  while (parseDate(addMonthsIso(checkIn, months + 1)) <= parseDate(checkOut)) {
    months += 1;
  }
  const extraDays = nightsBetween(addMonthsIso(checkIn, months), checkOut);
  return { nights, months, extraDays };
}

export function calcPrice(room: PriceInput, checkIn: string, checkOut: string): PriceBreakdown {
  const { nights, months, extraDays } = splitStay(checkIn, checkOut);
  const dailyRate = Math.round(room.monthlyPrice / 30);
  const rentForMonths = room.monthlyPrice * months;
  const rentForExtraDays = dailyRate * extraDays;
  const maintenanceTotal = room.maintenanceFee * months;
  const total = rentForMonths + rentForExtraDays + maintenanceTotal + room.deposit;
  return {
    nights,
    months,
    extraDays,
    dailyRate,
    rentForMonths,
    rentForExtraDays,
    maintenanceTotal,
    deposit: room.deposit,
    total,
  };
}
