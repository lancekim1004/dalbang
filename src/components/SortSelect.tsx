"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function SortSelect() {
  const t = useTranslations("Rooms");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get("sort") ?? "recommended";
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {t("sort")}
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "recommended") next.delete("sort");
          else next.set("sort", e.target.value);
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        className="rounded-lg border border-line bg-white px-2 py-1.5 text-ink"
      >
        <option value="recommended">{t("sortRecommended")}</option>
        <option value="priceAsc">{t("sortPriceAsc")}</option>
        <option value="priceDesc">{t("sortPriceDesc")}</option>
      </select>
    </label>
  );
}
