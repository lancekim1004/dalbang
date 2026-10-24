import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LookupForm } from "@/components/LookupForm";
import { bookingCodeSchema } from "@/lib/booking-rules";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Lookup");
  return { title: t("title"), robots: { index: false } };
}

export default async function LookupPage({ searchParams }: PageProps<"/booking/lookup">) {
  const t = await getTranslations("Lookup");
  const code = bookingCodeSchema.safeParse((await searchParams).code).data;
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">{t("intro")}</p>
      <LookupForm initialCode={code} />
    </div>
  );
}
