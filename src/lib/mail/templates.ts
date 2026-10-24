// 메일 내용 만들기. 문구는 messages/en.json의 Email 아래에 있다.
import "server-only";
import { createTranslator } from "next-intl";
import messages from "../../../messages/en.json";
import { formatDate, formatKRW } from "../format";
import { siteUrl } from "../site";
import type { EmailType } from "./types";

export interface MailBooking {
  code: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  roomName: string;
  listingTitle: string;
  addressEn: string;
  districtSlug: string;
  rejectReason: string | null;
  message: string | null;
  id: string;
}


const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** 문단 목록 → 글자 메일 + 간단한 HTML 메일 */
function render(paragraphs: string[], link?: { href: string; label: string }) {
  const text = [...paragraphs, ...(link ? [`${link.label}: ${link.href}`] : []), "", "— Dalbang"].join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1b2340;max-width:560px">
${paragraphs.map((p) => `<p>${escape(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
${link ? `<p><a href="${escape(link.href)}" style="display:inline-block;background:#1b2340;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${escape(link.label)}</a></p>` : ""}
<p style="color:#6b7280;font-size:13px">— Dalbang · ${escape(messages.Demo.banner)}</p></div>`;
  return { text, html };
}

export function buildMail(type: EmailType, b: MailBooking, adminEmail?: string) {
  const t = createTranslator({ locale: "en", messages, namespace: "Email" });
  const vars = {
    name: b.guestName, code: b.code, room: b.roomName, listing: b.listingTitle,
    checkIn: formatDate(b.checkIn), checkOut: formatDate(b.checkOut), total: formatKRW(b.totalAmount), guests: b.guests,
  };
  const summary = t("summary", vars);
  const lookup = { href: `${siteUrl()}/booking/lookup?code=${b.code}`, label: t("lookupLink") };

  switch (type) {
    case "received":
      return { to: b.guestEmail, subject: t("received.subject", vars), ...render([t("hello", vars), t("received.body"), summary, t("received.next")], lookup) };
    case "approved":
      return { to: b.guestEmail, subject: t("approved.subject", vars), ...render([t("hello", vars), t("approved.body"), summary, t("approved.address", { address: b.addressEn }), t("approved.next")], lookup) };
    case "rejected":
      return {
        to: b.guestEmail, subject: t("rejected.subject", vars),
        ...render([t("hello", vars), t("rejected.body"), summary, ...(b.rejectReason ? [t("reason", { reason: b.rejectReason })] : []), t("rejected.next")],
          { href: `${siteUrl()}/rooms?district=${b.districtSlug}`, label: t("rejected.link") }),
      };
    case "cancelled":
      return { to: b.guestEmail, subject: t("cancelled.subject", vars), ...render([t("hello", vars), t("cancelled.body"), summary, ...(b.rejectReason ? [t("reason", { reason: b.rejectReason })] : [])], lookup) };
    case "admin_new_request":
      return {
        to: adminEmail!, subject: t("admin.subject", vars),
        ...render([t("admin.body", vars), summary, t("admin.guest", { name: b.guestName, email: b.guestEmail }), ...(b.message ? [t("admin.message", { message: b.message })] : [])],
          { href: `${siteUrl()}/admin/bookings/${b.id}`, label: t("admin.link") }),
      };
  }
}
