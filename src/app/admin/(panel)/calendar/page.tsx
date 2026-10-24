import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { addDaysIso, isValidIsoDate, todayInSeoul } from "@/lib/dates";
import { requireAdmin } from "@/lib/admin-auth";
import { listAdminListings, listCalendarBookings } from "@/lib/repo";
import { isConfirmed } from "@/lib/stay-rules";

export async function generateMetadata() {
  return { title: (await getTranslations("Admin.calendar"))("title") };
}

const DAYS = 42; // 6주

/** 방별 가로 줄 달력 (A8). 확정 = 진한색, 대기 = 연한색 */
export default async function AdminCalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  await requireAdmin();
  const sp = await searchParams;
  const today = todayInSeoul();
  const from = typeof sp.from === "string" && isValidIsoDate(sp.from) ? sp.from : addDaysIso(today, -7);
  const [t, listings, bookings] = await Promise.all([getTranslations("Admin.calendar"), listAdminListings(), listCalendarBookings(from, DAYS)]);
  const days = Array.from({ length: DAYS }, (_, i) => addDaysIso(from, i));
  const rooms = listings.flatMap((l) => l.rooms.map((r) => ({ ...r, listingTitle: l.title })));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="ml-auto flex gap-2 text-sm">
          <Link href={`/admin/calendar?from=${addDaysIso(from, -28)}`} className="rounded-full border border-line px-3 py-1.5">← {t("earlier")}</Link>
          <Link href="/admin/calendar" className="rounded-full border border-line px-3 py-1.5">{t("today")}</Link>
          <Link href={`/admin/calendar?from=${addDaysIso(from, 28)}`} className="rounded-full border border-line px-3 py-1.5">{t("later")} →</Link>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-ink" />{t("approved")}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-amber-300" />{t("pending")}</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-40 bg-white p-2 text-left">{t("room")}</th>
              {days.map((d) => (
                <th key={d} className={`w-7 min-w-7 p-0.5 text-center font-normal ${d === today ? "text-ink font-bold" : "text-muted"}`}>
                  {d.endsWith("-01") || d === from ? <span className="block text-[10px]">{d.slice(5, 7)}/</span> : null}
                  {Number(d.slice(8))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => {
              const mine = bookings.filter((b) => b.roomId === r.id);
              return (
                <tr key={r.id} className="border-t border-line">
                  <th className="sticky left-0 z-10 bg-white p-2 text-left font-normal">
                    <Link href={`/admin/rooms/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                    <span className="block text-muted">{r.listingTitle}</span>
                  </th>
                  {days.map((d) => {
                    // 그 날 밤을 차지하는 예약 (퇴실일 밤은 비어 있음). 확정이 대기보다 우선
                    const hits = mine.filter((b) => b.checkIn <= d && d < b.checkOut);
                    const hit = hits.find((b) => isConfirmed(b.status)) ?? hits[0];
                    const color = !hit ? "" : isConfirmed(hit.status) ? "bg-ink" : "bg-amber-300";
                    return (
                      <td key={d} className={`h-9 border-l border-line/60 p-0 ${d === today ? "bg-paper" : ""}`}>
                        {hit && (
                          <Link href={`/admin/bookings/${hit.id}`} title={`${hit.code} · ${hit.guestName}`} className={`block h-6 ${color}`}>
                            <span className="sr-only">{hit.code}</span>
                          </Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
