import Link from "next/link";
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
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/booking/lookup" className="underline underline-offset-2">{t("lookup")}</Link>
          <Link href="/faq" className="underline underline-offset-2">{t("faq")}</Link>
          <Link href="/terms" className="underline underline-offset-2">{t("terms")}</Link>
          <Link href="/privacy" className="underline underline-offset-2">{t("privacy")}</Link>
        </nav>
        <p className="text-xs">
          {t("photos")} · {t("map")}
        </p>
      </div>
    </footer>
  );
}
