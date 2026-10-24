import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function SiteFooter() {
  const t = useTranslations("Footer");
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-10 text-sm text-muted">
        <Logo className="text-ink" />
        <p>{t("about")}</p>
        <p>{t("demo")}</p>
        <p className="text-xs">
          {t("photos")} · {t("map")}
        </p>
      </div>
    </footer>
  );
}
