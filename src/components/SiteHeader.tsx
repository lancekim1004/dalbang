import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function SiteHeader() {
  const t = useTranslations("Nav");
  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label={t("home")}>
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/#how" className="hidden rounded-full px-3 py-2 text-muted hover:text-ink sm:inline">
            {t("howItWorks")}
          </Link>
          <Link href="/rooms" className="rounded-full bg-ink px-4 py-2 font-medium text-white hover:bg-ink-soft">
            {t("rooms")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
