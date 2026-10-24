// 금액 내역 표 (방 상세 미리보기·예약 요청·예약 조회에서 같이 사용)
import { useTranslations } from "next-intl";
import { formatKRW } from "@/lib/format";
import type { PriceBreakdown } from "@/lib/pricing";

export function PriceBreakdownList({ price }: { price: PriceBreakdown }) {
  const t = useTranslations("Price");
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between text-muted"><dt>{t("nights", { count: price.nights })}</dt></div>
      <div className="flex justify-between"><dt>{t("rentMonths", { count: price.months })}</dt><dd>{formatKRW(price.rentForMonths)}</dd></div>
      {price.extraDays > 0 && (
        <div className="flex justify-between"><dt>{t("rentDays", { count: price.extraDays, daily: formatKRW(price.dailyRate) })}</dt><dd>{formatKRW(price.rentForExtraDays)}</dd></div>
      )}
      <div className="flex justify-between"><dt>{t("maintenanceMonths", { count: price.months })}</dt><dd>{formatKRW(price.maintenanceTotal)}</dd></div>
      <div className="flex justify-between"><dt>{t("depositOnce")}</dt><dd>{formatKRW(price.deposit)}</dd></div>
      <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>{t("total")}</dt><dd>{formatKRW(price.total)}</dd></div>
    </dl>
  );
}
