import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarCheck, Mail, Search } from "lucide-react";
import { HERO_PHOTO } from "@/data/sample";
import { RoomCard } from "@/components/RoomCard";
import { SearchForm } from "@/components/SearchForm";
import { addDaysIso, addMonthsIso, todayInSeoul } from "@/lib/dates";
import { getDistricts, getFeaturedRooms } from "@/lib/repo";
import { MAX_MONTHS_AHEAD } from "@/lib/stay-rules";

// 예약 가능 여부가 날짜에 따라 바뀌므로 1시간마다 새로 만든다
export const revalidate = 3600;

export default async function HomePage() {
  const t = await getTranslations("Home");
  const [districts, featured] = await Promise.all([getDistricts(), getFeaturedRooms(6)]);
  const today = todayInSeoul();
  const steps = [
    { icon: Search, title: t("step1Title"), body: t("step1Body") },
    { icon: CalendarCheck, title: t("step2Title"), body: t("step2Body") },
    { icon: Mail, title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Image src={HERO_PHOTO} alt="Seoul skyline at dusk with Namsan Tower" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/80" />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:pt-24">
          <p className="text-sm font-medium text-moon">{t("eyebrow")}</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">{t("headline")}</h1>
          <p className="mt-4 max-w-xl text-white/85">{t("sub")}</p>
          <div className="mt-8">
            <SearchForm districts={districts} minDate={addDaysIso(today, 1)} maxDate={addMonthsIso(today, MAX_MONTHS_AHEAD)} />
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <h2 className="text-2xl font-bold">{t("howTitle")}</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-moon-soft text-ink">
                  <s.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">{t("featured")}</h2>
          <Link href="/rooms" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
            {t("seeAll")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">{t("districts")}</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {districts.map((d) => (
            <Link key={d.id} href={`/rooms?district=${d.slug}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-ink">
              {d.nameEn}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-ink px-6 py-10 text-white sm:px-10">
          <h2 className="text-2xl font-bold">
            {t("whatIs")} <span className="text-moon">달방</span>
          </h2>
          <p className="mt-3 max-w-2xl text-white/80">{t("whatIsBody")}</p>
        </div>
      </section>
    </>
  );
}
