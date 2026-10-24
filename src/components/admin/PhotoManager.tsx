"use client";
// 사진 관리: 올리기(자동 축소) · 설명 고치기 · 순서 바꾸기 · 지우기. 첫 번째 사진이 대표 사진.
import { useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { deletePhoto, movePhoto, updatePhotoAlt, uploadPhoto, type PhotoResult } from "@/app/admin/photo-actions";
import { photoUrl } from "@/lib/photo-url";
import { resizeImage } from "@/lib/resize-image";
import type { AdminPhoto } from "@/lib/repo-admin-listings";
import { inputClass } from "./FormBits";

export function PhotoManager({ owner, photos }: { owner: { kind: "listing" | "room"; id: string }; photos: AdminPhoto[] }) {
  const t = useTranslations("Admin.photos");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const run = (fn: () => Promise<PhotoResult>) =>
    start(async () => {
      setMessage(null);
      const r = await fn();
      if ("error" in r) setMessage(t(`error.${r.error}`));
    });

  const onUpload = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) return setMessage(t("error.invalid"));
    run(async () => {
      try {
        const small = await resizeImage(file);
        data.set("file", new File([small], "photo", { type: small.type }));
      } catch {
        return { error: "badType" };
      }
      const r = await uploadPhoto(data);
      if ("ok" in r) form.reset();
      return r;
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="text-sm text-muted">{t("intro")}</p>
      {photos.length === 0 && <p className="text-sm text-muted">{t("none")}</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-[4/3]">
              <Image src={photoUrl(p.storage_path)} alt={p.alt_text} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">{t("cover")}</span>}
            </div>
            <div className="space-y-2 p-3">
              <input defaultValue={p.alt_text} aria-label={t("alt")} maxLength={200} className={inputClass()}
                onBlur={(e) => e.target.value.trim() !== p.alt_text && run(() => updatePhotoAlt(p.id, e.target.value))} />
              <div className="flex flex-wrap gap-2 text-xs">
                <button type="button" disabled={pending || i === 0} onClick={() => run(() => movePhoto(p.id, "up"))} className="rounded-full border border-line px-3 py-1 disabled:opacity-40">{t("moveUp")}</button>
                <button type="button" disabled={pending || i === photos.length - 1} onClick={() => run(() => movePhoto(p.id, "down"))} className="rounded-full border border-line px-3 py-1 disabled:opacity-40">{t("moveDown")}</button>
                {confirmId === p.id ? (
                  <button type="button" disabled={pending} onClick={() => run(() => deletePhoto(p.id))} className="ml-auto rounded-full bg-red-600 px-3 py-1 text-white">{t("confirmDelete")}</button>
                ) : (
                  <button type="button" disabled={pending} onClick={() => setConfirmId(p.id)} className="ml-auto rounded-full border border-red-300 px-3 py-1 text-red-700">{t("delete")}</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpload(e.currentTarget);
        }}
        className="grid gap-3 rounded-2xl border border-dashed border-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <input type="hidden" name="ownerKind" value={owner.kind} />
        <input type="hidden" name="ownerId" value={owner.id} />
        <label className="block text-sm font-medium">
          {t("file")}
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="mt-1 block w-full text-sm" />
        </label>
        <label className="block text-sm font-medium">
          {t("alt")}
          <input name="alt" required maxLength={200} placeholder={t("altPlaceholder")} className={inputClass()} />
        </label>
        <button type="submit" disabled={pending} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:bg-ink/50">
          {pending ? t("working") : t("upload")}
        </button>
      </form>
      {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
    </section>
  );
}
