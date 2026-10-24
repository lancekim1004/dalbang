import { useTranslations } from "next-intl";
import type { BookingStatus } from "@/lib/types";

const STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  cancelled: "bg-zinc-200 text-zinc-800",
  expired: "bg-zinc-200 text-zinc-800",
  awaiting_payment: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations("Status");
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLE[status]}`}>{t(`${status}.label`)}</span>;
}
