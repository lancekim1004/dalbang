"use client";
import { startTransition, useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveListing, type SaveState } from "@/app/admin/listing-actions";
import { AMENITIES } from "@/lib/admin-schemas";
import type { AdminListing } from "@/lib/repo-admin-listings";
import { CheckList, Field, inputClass, SaveBar } from "./FormBits";

interface Props {
  listing?: AdminListing;
  districts: { id: string; name_en: string }[];
}

export function ListingForm({ listing, districts }: Props) {
  const t = useTranslations("Admin.listingForm");
  const tf = useTranslations("Admin.form");
  const ta = useTranslations("Amenity");
  const tl = useTranslations("ListingType");
  const [state, action, pending] = useActionState<SaveState, FormData>(saveListing, null);
  const bad = (f: string) => state?.invalidFields?.includes(f) ?? false;
  const err = (f: string) => (bad(f) ? tf("invalid") : undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4 rounded-2xl border border-line bg-white p-5"
    >
      {listing && <input type="hidden" name="id" value={listing.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("title")} error={err("title")}>
          <input name="title" required maxLength={120} defaultValue={listing?.title} className={inputClass(bad("title"))} />
        </Field>
        <Field label={t("type")} error={err("type")}>
          <select name="type" defaultValue={listing?.type ?? "sharehouse"} className={inputClass(bad("type"))}>
            {(["sharehouse", "studio", "apartment"] as const).map((v) => <option key={v} value={v}>{tl(v)}</option>)}
          </select>
        </Field>
        <Field label={t("district")} error={err("districtId")}>
          <select name="districtId" defaultValue={listing?.district_id} className={inputClass(bad("districtId"))}>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
          </select>
        </Field>
        <Field label={t("station")} error={err("nearestStation")}>
          <input name="nearestStation" maxLength={120} defaultValue={listing?.nearest_station} placeholder={t("stationPlaceholder")} className={inputClass(bad("nearestStation"))} />
        </Field>
      </div>
      <Field label={t("description")} error={err("description")}>
        <textarea name="description" rows={5} maxLength={3000} defaultValue={listing?.description} className={inputClass(bad("description"))} />
      </Field>
      <Field label={t("address")} hint={t("addressHint")} error={err("addressEn")}>
        <input name="addressEn" maxLength={200} defaultValue={listing?.address_en} className={inputClass(bad("addressEn"))} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("lat")} error={err("lat")}>
          <input name="lat" inputMode="decimal" required defaultValue={listing?.lat} placeholder="37.5546" className={inputClass(bad("lat"))} />
        </Field>
        <Field label={t("lng")} error={err("lng")}>
          <input name="lng" inputMode="decimal" required defaultValue={listing?.lng} placeholder="126.9203" className={inputClass(bad("lng"))} />
        </Field>
      </div>
      <p className="text-xs text-muted">{t("coordsHint")}</p>
      <CheckList name="amenities" label={t("amenities")} checked={listing?.amenities ?? []} options={AMENITIES.map((a) => ({ value: a, label: ta(a) }))} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="isPublished" defaultChecked={listing?.is_published ?? false} className="h-4 w-4 accent-ink" />
        {t("published")}
      </label>
      <SaveBar pending={pending} saveLabel={tf("save")} savingLabel={tf("saving")}
        message={state?.error ? tf("serverError") : state?.invalidFields?.length ? tf("fixFields") : undefined} />
    </form>
  );
}
