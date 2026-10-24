import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/admin/auth-actions";

const LINKS = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/bookings", key: "bookings" },
  { href: "/admin/calendar", key: "calendar" },
  { href: "/admin/listings", key: "listings" },
] as const;

export function AdminNav({ email }: { email: string }) {
  const t = useTranslations("Admin.nav");
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-1 gap-y-2 px-4 py-2">
        <span className="mr-2 rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white">{t("badge")}</span>
        <nav className="flex flex-wrap gap-1 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 hover:bg-paper">{t(l.key)}</Link>
          ))}
        </nav>
        <form action={signOut} className="ml-auto flex items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline">{email}</span>
          <button type="submit" className="rounded-full border border-line px-3 py-1.5 text-ink hover:border-ink">{t("signOut")}</button>
        </form>
      </div>
    </div>
  );
}
