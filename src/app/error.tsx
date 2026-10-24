"use client";
import { useTranslations } from "next-intl";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Error");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("body")}</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
        {t("retry")}
      </button>
    </div>
  );
}
