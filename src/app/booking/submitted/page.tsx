import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CircleCheck } from "lucide-react";
import { bookingCodeSchema } from "@/lib/booking-rules";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Submitted");
  return { title: t("metaTitle"), robots: { index: false } };
}

// 요청 완료 (U6). 주소의 예약 번호는 형식만 확인해서 보여준다 (번호만으로는 예약 내용을 볼 수 없음)
export default async function SubmittedPage({ searchParams }: PageProps<"/booking/submitted">) {
  const t = await getTranslations("Submitted");
  const code = bookingCodeSchema.safeParse((await searchParams).code).data;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <CircleCheck className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("body")}</p>
      {code && (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5">
          <p className="text-sm text-muted">{t("codeLabel")}</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-wider">{code}</p>
          <p className="mt-2 text-xs text-muted">{t("codeHint")}</p>
        </div>
      )}
      <ol className="mt-6 space-y-2 text-left text-sm">
        <li>1. {t("next1")}</li>
        <li>2. {t("next2")}</li>
        <li>3. {t("next3")}</li>
      </ol>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link href={code ? `/booking/lookup?code=${code}` : "/booking/lookup"} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
          {t("lookup")}
        </Link>
        <Link href="/rooms" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">
          {t("browse")}
        </Link>
      </div>
    </div>
  );
}
