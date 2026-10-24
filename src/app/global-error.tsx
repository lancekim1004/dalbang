"use client";
// 3-6. 사이트 전체가 멈출 만큼 큰 오류(500)일 때 보이는 화면. 평소 틀(머리·꼬리)도 못 쓰므로 스스로 html을 만든다.
import Link from "next/link";
import { createTranslator } from "next-intl";
import messages from "../../messages/en.json";
import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  const t = createTranslator({ locale: "en", messages, namespace: "Error" });
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
        <title>{t("title")}</title>
        <div className="max-w-md text-center">
          <p className="text-6xl font-bold text-moon">500</p>
          <h1 className="mt-4 text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("body")}</p>
          <div className="mt-6 flex justify-center gap-2">
            <button type="button" onClick={() => retry()} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">{t("retry")}</button>
            <Link href="/" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">{t("home")}</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
