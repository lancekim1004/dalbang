"use client";
// 예약 조회 (U7). 번호 + 이메일이 둘 다 맞을 때만 결과가 나온다.
import { startTransition, useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { lookupBooking, type LookupState } from "@/app/booking/actions";
import { formatDate, formatKRW } from "@/lib/format";
import { PriceBreakdownList } from "./PriceBreakdownList";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  cancelled: "bg-zinc-200 text-zinc-800",
  expired: "bg-zinc-200 text-zinc-800",
  awaiting_payment: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
};

export function LookupForm({ initialCode = "" }: { initialCode?: string }) {
  const t = useTranslations("Lookup");
  const ts = useTranslations("Status");
  const [state, formAction, pending] = useActionState<LookupState, FormData>(lookupBooking, null);
  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base focus:border-ink focus:outline-none sm:text-sm";
  const b = state?.booking;

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="space-y-3 rounded-2xl border border-line bg-white p-5"
      >
        <label className="block text-sm font-medium">
          {t("code")}
          <input name="code" required defaultValue={initialCode} placeholder="DB-XXXXXX" autoCapitalize="characters" className={`${field} font-mono uppercase`} />
        </label>
        <label className="block text-sm font-medium">
          {t("email")}
          <input type="email" name="email" required autoComplete="email" className={field} />
        </label>
        {state?.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t(`error.${state.error}`)}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white disabled:bg-ink/50">
          <span key={String(pending)}>{pending ? t("searching") : t("submit")}</span>
        </button>
      </form>

      {b && (
        <section aria-live="polite" className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-lg font-bold">{b.code}</p>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[b.status]}`}>{ts(`${b.status}.label`)}</span>
          </div>
          <p className="text-sm">{ts(`${b.status}.body`)}</p>
          {b.status === "rejected" && b.rejectReason && (
            <p className="rounded-xl bg-paper px-4 py-3 text-sm"><span className="font-semibold">{t("reason")}</span> {b.rejectReason}</p>
          )}
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div className="col-span-2"><dt className="text-muted">{t("room")}</dt><dd><Link href={`/rooms/${b.roomId}`} className="font-medium underline underline-offset-2">{b.roomName}</Link> · {b.listingTitle}</dd></div>
            <div><dt className="text-muted">{t("moveIn")}</dt><dd className="font-medium">{formatDate(b.checkIn)}</dd></div>
            <div><dt className="text-muted">{t("moveOut")}</dt><dd className="font-medium">{formatDate(b.checkOut)}</dd></div>
            <div><dt className="text-muted">{t("guests")}</dt><dd className="font-medium">{b.guests}</dd></div>
            <div><dt className="text-muted">{t("name")}</dt><dd className="font-medium">{b.guestName}</dd></div>
          </dl>
          <div className="border-t border-line pt-4">
            {b.price ? <PriceBreakdownList price={b.price} /> : <p className="text-sm font-bold">{t("total", { amount: formatKRW(b.totalAmount) })}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
