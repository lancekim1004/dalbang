"use client";
// 방 상세의 "날짜 고르면 총액 바로 보기". 계산은 lib/pricing.ts, 조건은 lib/stay-rules.ts 사용.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { addDaysIso, addMonthsIso, nightsBetween, todayInSeoul } from "@/lib/dates";
import { formatKRW } from "@/lib/format";
import { calcPrice } from "@/lib/pricing";
import { checkStay, MAX_MONTHS_AHEAD, MIN_NIGHTS } from "@/lib/stay-rules";
import type { BookedRange } from "@/lib/types";

interface Props {
  room: { monthlyPrice: number; deposit: number; maintenanceFee: number; minNights: number };
  booked: BookedRange[];
  initialMoveIn?: string;
  initialMonths?: number;
}

const QUICK = [1, 2, 3, 6];

export function PricePreview({ room, booked, initialMoveIn, initialMonths }: Props) {
  const t = useTranslations("Price");
  const te = useTranslations("StayErrors");
  const today = todayInSeoul();
  const minDate = addDaysIso(today, 1);
  const maxDate = addMonthsIso(today, MAX_MONTHS_AHEAD);
  const minNights = Math.max(MIN_NIGHTS, room.minNights);

  // 입주일 + n개월. 1개월이 최소 박수보다 짧으면(2월 등) 최소 박수로 맞춤
  const outFor = (checkIn: string, months: number) => {
    const out = addMonthsIso(checkIn, months);
    return nightsBetween(checkIn, out) < minNights ? addDaysIso(checkIn, minNights) : out;
  };

  const [checkIn, setCheckIn] = useState(initialMoveIn ?? "");
  const [checkOut, setCheckOut] = useState(initialMoveIn ? outFor(initialMoveIn, initialMonths ?? 1) : "");

  const result = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const error = checkStay({ checkIn, checkOut, minNights, booked, today });
    if (error) return { error } as const;
    return { price: calcPrice(room, checkIn, checkOut) } as const;
  }, [checkIn, checkOut, minNights, booked, today, room]);

  const field = "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none";
  return (
    <section aria-labelledby="price-title" className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 id="price-title" className="text-lg font-semibold">{t("title")}</h2>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">{t("monthly")}</dt><dd className="font-semibold">{t("perMonth", { amount: formatKRW(room.monthlyPrice) })}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">{t("maintenance")}</dt><dd>{t("perMonth", { amount: formatKRW(room.maintenanceFee) })}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">{t("deposit")}</dt><dd>{formatKRW(room.deposit)}</dd></div>
      </dl>
      <p className="mt-1 text-xs text-muted">{t("refundable")}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="min-w-0 text-xs font-medium text-muted">
          {t("moveIn")}
          <input type="date" className={`${field} mt-1`} min={minDate} max={maxDate} value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value && (!checkOut || checkOut <= e.target.value)) setCheckOut(outFor(e.target.value, 1));
            }} />
        </label>
        <label className="min-w-0 text-xs font-medium text-muted">
          {t("moveOut")}
          <input type="date" className={`${field} mt-1`} min={checkIn ? addDaysIso(checkIn, minNights) : minDate} value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)} />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted">{t("quick")}</span>
        {QUICK.map((m) => (
          <button key={m} type="button"
            onClick={() => {
              const start = checkIn || minDate;
              setCheckIn(start);
              setCheckOut(outFor(start, m));
            }}
            className="rounded-full border border-line px-3 py-1 text-xs hover:border-ink">
            {m}M
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-line pt-4 text-sm" aria-live="polite">
        {!result && <p className="text-muted">{t("pickDates")}</p>}
        {result && "error" in result && (
          <p className="rounded-lg bg-booked/60 px-3 py-2 text-ink">{te(result.error!, { nights: minNights })}</p>
        )}
        {result && "price" in result && result.price && (
          <dl className="space-y-1.5">
            <div className="flex justify-between text-muted"><dt>{t("nights", { count: result.price.nights })}</dt></div>
            <div className="flex justify-between"><dt>{t("rentMonths", { count: result.price.months })}</dt><dd>{formatKRW(result.price.rentForMonths)}</dd></div>
            {result.price.extraDays > 0 && (
              <div className="flex justify-between"><dt>{t("rentDays", { count: result.price.extraDays, daily: formatKRW(result.price.dailyRate) })}</dt><dd>{formatKRW(result.price.rentForExtraDays)}</dd></div>
            )}
            <div className="flex justify-between"><dt>{t("maintenanceMonths", { count: result.price.months })}</dt><dd>{formatKRW(result.price.maintenanceTotal)}</dd></div>
            <div className="flex justify-between"><dt>{t("depositOnce")}</dt><dd>{formatKRW(result.price.deposit)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>{t("total")}</dt><dd>{formatKRW(result.price.total)}</dd></div>
          </dl>
        )}
      </div>

      <button type="button" disabled className="mt-4 w-full cursor-not-allowed rounded-xl bg-ink/40 py-3 text-sm font-semibold text-white">
        {t("request")}
      </button>
      <p className="mt-2 text-center text-xs text-muted">{t("requestSoon")}</p>
    </section>
  );
}
