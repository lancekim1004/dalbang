import Form from "next/form";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { formatKRW } from "@/lib/format";
import { STAY_MONTH_OPTIONS } from "@/lib/repo";
import type { District } from "@/lib/types";

export const BUDGET_OPTIONS = [600_000, 800_000, 1_000_000, 1_500_000, 2_000_000];

export interface SearchDefaults {
  district?: string;
  moveIn?: string;
  months?: number;
  maxPrice?: number;
}

interface Props {
  districts: District[];
  defaults?: SearchDefaults;
  minDate: string;
  maxDate: string;
  variant?: "hero" | "bar";
}

/** 지역·입주일·기간·예산 검색. 자바스크립트 없이도 동작 (주소에 조건을 붙여 /rooms로 이동) */
export function SearchForm({ districts, defaults = {}, minDate, maxDate, variant = "hero" }: Props) {
  const t = useTranslations("Search");
  const field = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none";
  const label = "mb-1 block text-xs font-medium text-muted";
  return (
    <Form
      action="/rooms"
      className={
        variant === "hero"
          ? "grid gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1fr_auto] lg:items-end"
          : "grid grid-cols-2 gap-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1fr_auto] lg:items-end"
      }
    >
      <div className="col-span-2 sm:col-span-1 lg:col-span-1">
        <label htmlFor={`${variant}-district`} className={label}>{t("district")}</label>
        <select id={`${variant}-district`} name="district" defaultValue={defaults.district ?? ""} className={field}>
          <option value="">{t("anyDistrict")}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.slug}>{d.nameEn}</option>
          ))}
        </select>
      </div>
      <div className="min-w-0">
        <label htmlFor={`${variant}-moveIn`} className={label}>{t("moveIn")}</label>
        <input id={`${variant}-moveIn`} type="date" name="moveIn" min={minDate} max={maxDate} defaultValue={defaults.moveIn} className={field} />
      </div>
      <div className="min-w-0">
        <label htmlFor={`${variant}-months`} className={label}>{t("stay")}</label>
        <select id={`${variant}-months`} name="months" defaultValue={String(defaults.months ?? 1)} className={field}>
          {STAY_MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>{t("months", { count: m })}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 sm:col-span-1 lg:col-span-1">
        <label htmlFor={`${variant}-maxPrice`} className={label}>{t("budget")}</label>
        <select id={`${variant}-maxPrice`} name="maxPrice" defaultValue={defaults.maxPrice ? String(defaults.maxPrice) : ""} className={field}>
          <option value="">{t("anyBudget")}</option>
          {BUDGET_OPTIONS.map((b) => (
            <option key={b} value={b}>{t("upTo", { amount: formatKRW(b) })}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft sm:col-span-2 lg:col-span-1">
        <Search className="h-4 w-4" aria-hidden="true" />
        {t("submit")}
      </button>
    </Form>
  );
}
