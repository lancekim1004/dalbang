import { useTranslations } from "next-intl";

/** 모든 화면 위 "포트폴리오 데모" 안내 띠 */
export function DemoBanner() {
  const t = useTranslations("Demo");
  return (
    <div className="bg-ink px-4 py-1.5 text-center text-xs text-white/85" role="note">
      {t("banner")}
    </div>
  );
}
