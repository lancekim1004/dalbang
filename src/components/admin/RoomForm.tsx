"use client";
import { startTransition, useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveRoom, type SaveState } from "@/app/admin/listing-actions";
import { FEATURES } from "@/lib/admin-schemas";
import type { AdminRoom } from "@/lib/repo-admin-listings";
import { CheckList, Field, inputClass, SaveBar } from "./FormBits";

export function RoomForm({ room, listingId }: { room?: AdminRoom; listingId: string }) {
  const t = useTranslations("Admin.roomForm");
  const tf = useTranslations("Admin.form");
  const tfe = useTranslations("Feature");
  const tr = useTranslations("RoomType");
  const [state, action, pending] = useActionState<SaveState, FormData>(saveRoom, null);
  const bad = (f: string) => state?.invalidFields?.includes(f) ?? false;
  const err = (f: string) => (bad(f) ? tf("invalid") : undefined);
  const num = (name: string, label: string, value: number | null | undefined, hint?: string) => (
    <Field label={label} hint={hint} error={err(name)}>
      <input name={name} inputMode="numeric" required defaultValue={value ?? undefined} className={inputClass(bad(name))} />
    </Field>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4 rounded-2xl border border-line bg-white p-5"
    >
      {room && <input type="hidden" name="id" value={room.id} />}
      <input type="hidden" name="listingId" value={listingId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("name")} error={err("name")}>
          <input name="name" required maxLength={120} defaultValue={room?.name} className={inputClass(bad("name"))} />
        </Field>
        <Field label={t("roomType")} error={err("roomType")}>
          <select name="roomType" defaultValue={room?.room_type ?? "private"} className={inputClass(bad("roomType"))}>
            {(["private", "shared", "entire"] as const).map((v) => <option key={v} value={v}>{tr(v)}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {num("monthlyPrice", t("monthlyPrice"), room?.monthly_price, t("wonHint"))}
        {num("deposit", t("deposit"), room?.deposit ?? 0, t("wonHint"))}
        {num("maintenanceFee", t("maintenanceFee"), room?.maintenance_fee ?? 0, t("wonHint"))}
        {num("minNights", t("minNights"), room?.min_nights ?? 30, t("minNightsHint"))}
        {num("maxGuests", t("maxGuests"), room?.max_guests ?? 1)}
        {num("sizeM2", t("size"), room?.size_m2)}
      </div>
      <CheckList name="features" label={t("features")} checked={room?.features ?? []} options={FEATURES.map((f) => ({ value: f, label: tfe(f) }))} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="isPublished" defaultChecked={room?.is_published ?? false} className="h-4 w-4 accent-ink" />
        {t("published")}
      </label>
      <SaveBar pending={pending} saveLabel={tf("save")} savingLabel={tf("saving")}
        message={state?.error ? tf("serverError") : state?.invalidFields?.length ? tf("fixFields") : undefined} />
    </form>
  );
}
