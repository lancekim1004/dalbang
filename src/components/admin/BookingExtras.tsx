"use client";
// 관리자 메모(손님에게 안 보임) · 실패한 메일 다시 보내기
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { resendEmail, saveAdminNote } from "@/app/admin/booking-actions";
import { inputClass } from "./FormBits";

export function NoteEditor({ id, note }: { id: string; note: string | null }) {
  const t = useTranslations("Admin.booking");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <textarea defaultValue={note ?? ""} rows={3} maxLength={2000} aria-label={t("note")} placeholder={t("notePlaceholder")} className={inputClass()}
        onBlur={(e) => {
          const value = e.target.value;
          start(async () => setMsg((await saveAdminNote(id, value)) ? t("noteSaved") : t("error.server")));
        }} />
      {(pending || msg) && <p className="text-xs text-muted">{pending ? t("working") : msg}</p>}
    </div>
  );
}

export function ResendButton({ logId }: { logId: string }) {
  const t = useTranslations("Admin.booking");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<boolean | null>(null);
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => setResult(await resendEmail(logId)))}
      className="rounded-full border border-line px-3 py-1 text-xs hover:border-ink disabled:opacity-50">
      <span key={`${pending}-${result}`}>{pending ? t("working") : result === null ? t("resend") : result ? t("resent") : t("resendFailed")}</span>
    </button>
  );
}
