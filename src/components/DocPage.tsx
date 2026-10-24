// 글 위주 안내 화면(처리방침·약관·FAQ) 공통 틀. 내용은 messages/en.json에 있다.
import { getTranslations } from "next-intl/server";

interface Section {
  h: string;
  p: string[];
}

/** {contact} 자리에 문의 메일(설정값)을 넣는다. 없으면 "예약 메일에 답장" 안내 */
export async function contactText() {
  const t = await getTranslations("Docs");
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return email ? t("contactEmail", { email }) : t("contactReply");
}

export async function DocPage({ namespace }: { namespace: "Privacy" | "Terms" | "Faq" }) {
  const t = await getTranslations(namespace);
  const td = await getTranslations("Docs");
  const contact = await contactText();
  const sections = t.raw("sections") as Section[];
  const fill = (s: string) => s.replaceAll("{contact}", contact);
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{td("updated", { date: t("updated") })}</p>
      <p className="mt-4 leading-relaxed">{fill(t("intro"))}</p>
      {sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-lg font-semibold">{s.h}</h2>
          {s.p.map((para, i) => (
            <p key={i} className="mt-2 leading-relaxed text-ink/85">{fill(para)}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
