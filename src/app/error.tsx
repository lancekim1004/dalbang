"use client";
// 화면 일부에서 오류가 났을 때 (서버 오류 내용은 손님에게 보여주지 않는다)
import { useTranslations } from "next-intl";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("Error");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("body")}</p>
      <button type="button" onClick={() => retry()} className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
        {t("retry")}
      </button>
    </div>
  );
}
