"use client";
// 승인·거절·취소 버튼. 거절은 사유가 꼭 필요 (손님 메일에 들어감).
import { startTransition, useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { decideBooking, type DecideState } from "@/app/admin/booking-actions";
import type { BookingStatus } from "@/lib/types";
import { inputClass } from "./FormBits";

export function DecisionPanel({ id, status, overlapCount }: { id: string; status: BookingStatus; overlapCount: number }) {
  const t = useTranslations("Admin.booking");
  const [state, action, pending] = useActionState<DecideState, FormData>(decideBooking, null);
  const [mode, setMode] = useState<"reject" | "cancel" | null>(null);
  const send = (act: string, reason = "") => {
    const data = new FormData();
    data.set("id", id);
    data.set("action", act);
    data.set("reason", reason);
    startTransition(() => action(data));
  };
  const canDecide = status === "pending";
  const canCancel = ["approved", "awaiting_payment", "paid"].includes(status);
  if (!canDecide && !canCancel) return <p className="text-sm text-muted">{t("closed")}</p>;

  return (
    <div className="space-y-3">
      {canDecide && overlapCount > 0 && <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900">{t("approveWarning", { count: overlapCount })}</p>}
      <div className="flex flex-wrap gap-2">
        {canDecide && (
          <>
            <button type="button" disabled={pending} onClick={() => send("approve")} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{t("approve")}</button>
            <button type="button" disabled={pending} onClick={() => setMode("reject")} className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700">{t("reject")}</button>
          </>
        )}
        {canCancel && <button type="button" disabled={pending} onClick={() => setMode("cancel")} className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold">{t("cancel")}</button>}
      </div>
      {mode && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(mode, String(new FormData(e.currentTarget).get("reason") ?? ""));
          }}
          className="space-y-2 rounded-xl border border-line bg-paper p-3"
        >
          <label className="block text-sm font-medium">
            {t(mode === "reject" ? "rejectReason" : "cancelReason")}
            <textarea name="reason" rows={3} maxLength={500} required={mode === "reject"} placeholder={t("reasonPlaceholder")} className={inputClass()} />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t(mode === "reject" ? "confirmReject" : "confirmCancel")}</button>
            <button type="button" onClick={() => setMode(null)} className="rounded-xl px-4 py-2 text-sm">{t("back")}</button>
          </div>
        </form>
      )}
      {pending && <p className="text-sm text-muted">{t("working")}</p>}
      {state?.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{t(`error.${state.error}`)}</p>}
      {state?.done && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{t(`done.${state.done}`)}</p>}
    </div>
  );
}
