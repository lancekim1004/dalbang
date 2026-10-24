import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-bold text-moon">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("body")}</p>
      <Link href="/rooms" className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
        {t("cta")}
      </Link>
    </div>
  );
}
