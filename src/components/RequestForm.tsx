"use client";
// 예약 요청 양식 (U5). 화면 검사는 안내용이고, 최종 검사·금액 계산은 서버(app/booking/actions.ts)가 다시 한다.
import { startTransition, useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { submitBookingRequest, type RequestState } from "@/app/booking/actions";
import { MAX_MESSAGE_LENGTH, type RequestField } from "@/lib/booking-rules";
import { addDaysIso, addMonthsIso, todayInSeoul } from "@/lib/dates";
import { calcPrice } from "@/lib/pricing";
import { checkStay, MAX_MONTHS_AHEAD, MIN_NIGHTS } from "@/lib/stay-rules";
import type { BookedRange } from "@/lib/types";
import { PriceBreakdownList } from "./PriceBreakdownList";

interface Props {
  room: { id: string; monthlyPrice: number; deposit: number; maintenanceFee: number; minNights: number; maxGuests: number };
  booked: BookedRange[];
  initialCheckIn?: string;
  initialCheckOut?: string;
}

const STAY_ERRORS = ["invalidDate", "checkoutBeforeCheckin", "checkinTooSoon", "checkinTooFar", "minStay", "maxStay", "datesTaken"];

export function RequestForm({ room, booked, initialCheckIn = "", initialCheckOut = "" }: Props) {
  const t = useTranslations("Request");
  const ts = useTranslations("StayErrors");
  const tr = useTranslations("RequestErrors");
  const [state, formAction, pending] = useActionState<RequestState, FormData>(submitBookingRequest, null);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const today = todayInSeoul();
  const minNights = Math.max(MIN_NIGHTS, room.minNights);
  const preview = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const error = checkStay({ checkIn, checkOut, minNights, booked, today });
    return error ? ({ error } as const) : ({ price: calcPrice(room, checkIn, checkOut) } as const);
  }, [checkIn, checkOut, minNights, booked, today, room]);

  const errorText = (key: string) =>
    STAY_ERRORS.includes(key) ? ts(key, { nights: minNights }) : tr(key, { guests: room.maxGuests });
  const invalid = (f: RequestField) => state?.invalidFields?.includes(f) ?? false;
  const field = (f: RequestField) =>
    `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-base focus:border-ink focus:outline-none sm:text-sm ${invalid(f) ? "border-red-500" : "border-line"}`;
  const label = "block text-sm font-medium";
  const fieldError = (f: RequestField) =>
    invalid(f) && <span className="mt-1 block text-xs text-red-600">{t(`invalid.${f}`)}</span>;

  return (
    <form
      noValidate
      // 직접 보내서 오류가 나도 입력한 내용이 지워지지 않게 함
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-6"
    >
      <input type="hidden" name="roomId" value={room.id} />

      <fieldset className="space-y-3">
        <legend className="mb-2 text-lg font-semibold">{t("datesTitle")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>
            {t("moveIn")}
            <input type="date" name="checkIn" required value={checkIn} min={addDaysIso(today, 1)} max={addMonthsIso(today, MAX_MONTHS_AHEAD)}
              onChange={(e) => setCheckIn(e.target.value)} className={field("checkIn")} />
          </label>
          <label className={label}>
            {t("moveOut")}
            <input type="date" name="checkOut" required value={checkOut} min={checkIn ? addDaysIso(checkIn, minNights) : undefined}
              onChange={(e) => setCheckOut(e.target.value)} className={field("checkOut")} />
          </label>
        </div>
        <label className={label}>
          {t("guests")}
          <select name="guests" defaultValue="1" className={field("guests")}>
            {Array.from({ length: room.maxGuests }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
        </label>
        <div className="rounded-xl bg-paper p-4" aria-live="polite">
          {!preview && <p className="text-sm text-muted">{t("pickDates")}</p>}
          {preview?.error && <p className="text-sm">{errorText(preview.error)}</p>}
          {preview?.price && <PriceBreakdownList price={preview.price} />}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-lg font-semibold">{t("aboutYou")}</legend>
        <label className={label}>
          {t("name")}
          <input name="name" autoComplete="name" required maxLength={100} aria-invalid={invalid("name")} className={field("name")} />
          {fieldError("name")}
        </label>
        <label className={label}>
          {t("email")}
          <input type="email" name="email" autoComplete="email" required maxLength={254} aria-invalid={invalid("email")} className={field("email")} />
          <span className="mt-1 block text-xs text-muted">{t("emailHint")}</span>
          {fieldError("email")}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>
            {t("phone")} <span className="font-normal text-muted">{t("optional")}</span>
            <input type="tel" name="phone" autoComplete="tel" maxLength={40} className={field("phone")} />
          </label>
          <label className={label}>
            {t("nationality")} <span className="font-normal text-muted">{t("optional")}</span>
            <input name="nationality" autoComplete="country-name" maxLength={60} className={field("nationality")} />
          </label>
        </div>
        <label className={label}>
          {t("message")} <span className="font-normal text-muted">{t("optional")}</span>
          <textarea name="message" rows={4} maxLength={MAX_MESSAGE_LENGTH} placeholder={t("messagePlaceholder")} className={field("message")} />
        </label>
      </fieldset>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required aria-invalid={invalid("consent")} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
        <span>
          {t("consent")}
          {fieldError("consent")}
        </span>
      </label>

      {(state?.error || (state?.invalidFields && state.invalidFields.length > 0)) && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error ? errorText(state.error) : t("fixFields")}
        </p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-xl bg-ink py-3.5 text-base font-semibold text-white hover:bg-ink-soft disabled:cursor-wait disabled:bg-ink/50">
        {pending ? t("sending") : t("submit")}
      </button>
      <p className="text-center text-xs text-muted">{t("noPayment")}</p>
    </form>
  );
}
