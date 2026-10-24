import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocPage } from "@/components/DocPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  return { title: t("title"), description: t("metaDescription") };
}

export default function Page() {
  return <DocPage namespace="Terms" />;
}
