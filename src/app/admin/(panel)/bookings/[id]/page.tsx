import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { NoteEditor, ResendButton } from "@/components/admin/BookingExtras";
import { DecisionPanel } from "@/components/admin/DecisionPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PriceBreakdownList } from "@/components/PriceBreakdownList";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate, formatDateTime, formatKRW } from "@/lib/format";
import { getAdminBookingDetail } from "@/lib/repo";

export async function generateMetadata() {
  return { title: (await getTranslations("Admin.booking"))("title") };
}

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  await requireAdmin();
  const b = await getAdminBookingDetail((await params).id);
  if (!b) notFound();
  const [t, ts] = await Promise.all([getTranslations("Admin.booking"), getTranslations("Status")]);
  const card = "rounded-2xl border border-line bg-white p-5";
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-4 py-1"><dt className="text-muted">{label}</dt><dd className="text-right font-medium">{value}</dd></div>
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/bookings" className="text-sm text-muted hover:text-ink">← {t("back")}</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold">{b.code}</h1>
        <StatusBadge status={b.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-3 font-semibold">{t("request")}</h2>
            <dl className="text-sm">
              {row(t("room"), <Link href={`/admin/rooms/${b.room.id}`} className="underline underline-offset-2">{b.room.name} · {b.room.listing.title}</Link>)}
              {row(t("dates"), `${formatDate(b.check_in)} → ${formatDate(b.check_out)}`)}
              {row(t("guests"), b.guests_count)}
              {row(t("guest"), b.guest_name)}
              {row(t("email"), <a href={`mailto:${b.guest_email}`} className="underline underline-offset-2">{b.guest_email}</a>)}
              {b.guest_phone && row(t("phone"), b.guest_phone)}
              {b.nationality && row(t("nationality"), b.nationality)}
              {row(t("received"), formatDateTime(b.created_at))}
              {b.privacy_consent_at && row(t("consent"), formatDateTime(b.privacy_consent_at))}
            </dl>
            {b.message && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-paper p-3 text-sm">{b.message}</p>}
            {b.reject_reason && <p className="mt-3 text-sm"><span className="font-semibold">{t("reason")}</span> {b.reject_reason}</p>}
          </section>

          <section className={card}>
            <h2 className="mb-3 font-semibold">{t("overlapping")}</h2>
            {b.overlapping.length === 0 ? <p className="text-sm text-muted">{t("noOverlap")}</p> : (
              <ul className="space-y-2 text-sm">
                {b.overlapping.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/bookings/${o.id}`} className="font-mono font-semibold underline underline-offset-2">{o.code}</Link>
                    <StatusBadge status={o.status} />
                    <span className="text-muted">{o.guest_name} · {formatDate(o.check_in)} → {formatDate(o.check_out)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card}>
            <h2 className="mb-3 font-semibold">{t("history")}</h2>
            <ol className="space-y-1.5 text-sm">
              {b.events.map((e) => (
                <li key={e.id} className="flex flex-wrap gap-x-2">
                  <span className="text-muted">{formatDateTime(e.created_at)}</span>
                  <span>{e.from_status ? `${ts(`${e.from_status}.label`)} → ` : ""}{ts(`${e.to_status}.label`)}</span>
                  <span className="text-muted">({e.actor})</span>
                  {e.note && <span className="text-muted">— {e.note}</span>}
                </li>
              ))}
            </ol>
          </section>

          <section className={card}>
            <h2 className="mb-3 font-semibold">{t("emails")}</h2>
            {b.emails.length === 0 ? <p className="text-sm text-muted">{t("noEmails")}</p> : (
              <ul className="space-y-2 text-sm">
                {b.emails.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-2">
                    <span className="text-muted">{formatDateTime(m.created_at)}</span>
                    <span>{t(`emailType.${m.type}`)}</span>
                    <span className={m.status === "sent" ? "text-emerald-700" : "text-red-700"}>{t(`emailStatus.${m.status}`)}</span>
                    {m.error && <span className="text-xs text-muted">({m.error === "not_configured" ? t("notConfigured") : m.error})</span>}
                    {m.status === "failed" && <ResendButton logId={m.id} />}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className={card}>
            <h2 className="mb-3 font-semibold">{t("decision")}</h2>
            <DecisionPanel id={b.id} status={b.status} overlapCount={b.overlapping.filter((o) => o.status === "pending").length} />
          </section>
          <section className={card}>
            <h2 className="mb-3 font-semibold">{t("price")}</h2>
            {b.price ? <PriceBreakdownList price={b.price} /> : <p className="text-sm font-bold">{formatKRW(b.total_amount)}</p>}
          </section>
          <section className={card}>
            <h2 className="mb-1 font-semibold">{t("note")}</h2>
            <p className="mb-2 text-xs text-muted">{t("noteHint")}</p>
            <NoteEditor id={b.id} note={b.admin_note} />
          </section>
        </aside>
      </div>
    </div>
  );
}
