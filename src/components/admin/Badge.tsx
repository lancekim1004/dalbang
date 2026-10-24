import { useTranslations } from "next-intl";

export function PublishedBadge({ published }: { published: boolean }) {
  const t = useTranslations("Admin.form");
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${published ? "bg-emerald-100 text-emerald-900" : "bg-zinc-200 text-zinc-700"}`}>
      {published ? t("public") : t("hidden")}
    </span>
  );
}

export function SavedNotice() {
  const t = useTranslations("Admin.form");
  return <p role="status" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{t("saved")}</p>;
}
