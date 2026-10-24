"use client";
import { startTransition, useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, type LoginState } from "@/app/admin/auth-actions";

export function LoginForm() {
  const t = useTranslations("Admin.login");
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, null);
  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base focus:border-ink focus:outline-none sm:text-sm";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-3 rounded-2xl border border-line bg-white p-5"
    >
      <label className="block text-sm font-medium">
        {t("email")}
        <input type="email" name="email" required autoComplete="username" className={field} />
      </label>
      <label className="block text-sm font-medium">
        {t("password")}
        <input type="password" name="password" required autoComplete="current-password" className={field} />
      </label>
      {state?.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t(`error.${state.error}`)}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white disabled:bg-ink/50">
        <span key={String(pending)}>{pending ? t("signingIn") : t("submit")}</span>
      </button>
    </form>
  );
}
