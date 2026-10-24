import { useTranslations } from "next-intl";
import { addMonths, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { parseDate, toIso, rangesOverlap, addDaysIso } from "@/lib/dates";
import { isConfirmed } from "@/lib/stay-rules";
import type { BookedRange } from "@/lib/types";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

/** 앞으로 3개월 달력. 승인된 예약 날짜는 칠해서 표시 */
export function AvailabilityCalendar({ booked, today, months = 3 }: { booked: BookedRange[]; today: string; months?: number }) {
  const t = useTranslations("Room");
  const approved = booked.filter((b) => isConfirmed(b.status));
  const isBooked = (iso: string) => approved.some((b) => rangesOverlap(iso, addDaysIso(iso, 1), b.checkIn, b.checkOut));
  const first = startOfMonth(parseDate(today));

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: months }, (_, m) => {
          const monthStart = addMonths(first, m);
          const days = endOfMonth(monthStart).getDate();
          const offset = getDay(monthStart);
          return (
            <div key={m}>
              <p className="mb-2 text-sm font-semibold">{format(monthStart, "MMMM yyyy")}</p>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {WEEK.map((w, i) => <span key={i} className="pb-1 text-muted">{w}</span>)}
                {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: days }, (_, d) => {
                  const iso = toIso(new Date(monthStart.getFullYear(), monthStart.getMonth(), d + 1));
                  const past = iso <= today;
                  const taken = !past && isBooked(iso);
                  return (
                    <span key={iso}
                      className={`rounded-md py-1.5 ${past ? "text-muted/40" : taken ? "bg-booked text-ink/60 line-through" : "bg-white"}`}
                      aria-label={taken ? `${iso} ${t("booked")}` : undefined}>
                      {d + 1}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-line bg-white" />{t("available")}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-booked" />{t("booked")}</span>
      </div>
    </div>
  );
}
