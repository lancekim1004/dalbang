// 관리자 양식 공통 부품 (칸·체크박스 목록·저장 버튼)
import type { ReactNode } from "react";

export const inputClass = (bad = false) =>
  `mt-1 w-full rounded-xl border bg-white px-3 py-2 text-base focus:border-ink focus:outline-none sm:text-sm ${bad ? "border-red-500" : "border-line"}`;

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

export function CheckList({ name, options, checked, label }: { name: string; options: { value: string; label: string }[]; checked: string[]; label: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={name} value={o.value} defaultChecked={checked.includes(o.value)} className="h-4 w-4 accent-ink" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SaveBar({ pending, saveLabel, savingLabel, message }: { pending: boolean; saveLabel: string; savingLabel: string; message?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="submit" disabled={pending} className="rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white disabled:bg-ink/50">
        <span key={String(pending)}>{pending ? savingLabel : saveLabel}</span>
      </button>
      {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
    </div>
  );
}
