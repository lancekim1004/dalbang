"use server";
// 사진 올리기·지우기·순서·설명. 관리자 확인 후 처리한다.
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { PHOTO_BUCKET } from "@/lib/photo-url";
import { getAdminClient } from "@/lib/supabase/admin-client";
import { getSessionClient } from "@/lib/supabase/session-client";

export type PhotoResult = { ok: true } | { error: "invalid" | "tooBig" | "badType" | "server" };

const MAX_BYTES = 2.5 * 1024 * 1024;
// 파일 이름이 아니라 파일 앞부분 글자(서명)로 진짜 사진인지 확인
const SIGNATURES: { type: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { type: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", ext: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: "image/webp", ext: "webp", test: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP" },
];

const uploadSchema = z.object({
  ownerKind: z.enum(["listing", "room"]),
  ownerId: z.uuid(),
  alt: z.string().trim().min(1).max(200),
});

function refresh() {
  revalidatePath("/", "layout");
}

export async function uploadPhoto(formData: FormData): Promise<PhotoResult> {
  await requireAdmin();
  const parsed = uploadSchema.safeParse(Object.fromEntries(formData));
  const file = formData.get("file");
  if (!parsed.success || !(file instanceof File)) return { error: "invalid" };
  if (file.size > MAX_BYTES) return { error: "tooBig" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = SIGNATURES.find((s) => s.test(bytes));
  if (!kind) return { error: "badType" };

  const { ownerKind, ownerId, alt } = parsed.data;
  const ownerColumn = ownerKind === "listing" ? "listing_id" : "room_id";
  const path = `${ownerKind}s/${ownerId}/${randomUUID()}.${kind.ext}`;
  const storage = getAdminClient().storage.from(PHOTO_BUCKET);
  const up = await storage.upload(path, bytes, { contentType: kind.type, upsert: false });
  if (up.error) {
    console.error(`[photo-actions] upload: ${up.error.message}`);
    return { error: "server" };
  }
  const db = await getSessionClient();
  const { data: last } = await db.from("photos").select("sort_order").eq(ownerColumn, ownerId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const owner = ownerKind === "listing" ? { listing_id: ownerId } : { room_id: ownerId };
  const ins = await db.from("photos").insert({ ...owner, storage_path: path, alt_text: alt, sort_order: (last?.sort_order ?? -1) + 1 });
  if (ins.error) {
    console.error(`[photo-actions] insert: ${ins.error.message}`);
    await storage.remove([path]); // 기록 저장이 실패하면 올린 파일도 지운다
    return { error: "server" };
  }
  refresh();
  return { ok: true };
}

export async function deletePhoto(id: string): Promise<PhotoResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { error: "invalid" };
  const db = await getSessionClient();
  const { data, error } = await db.from("photos").delete().eq("id", id).select("storage_path").maybeSingle();
  if (error || !data) return { error: "server" };
  // 예시 자료(외부 주소)는 창고에 파일이 없다
  if (!/^https?:\/\//.test(data.storage_path)) await getAdminClient().storage.from(PHOTO_BUCKET).remove([data.storage_path]);
  refresh();
  return { ok: true };
}

/** 사진 순서 바꾸기: 바로 앞(또는 뒤) 사진과 자리를 맞바꾼다 */
export async function movePhoto(id: string, direction: "up" | "down"): Promise<PhotoResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { error: "invalid" };
  const db = await getSessionClient();
  const { data: me } = await db.from("photos").select("id, listing_id, room_id, sort_order").eq("id", id).maybeSingle();
  if (!me) return { error: "invalid" };
  const ownerColumn = me.listing_id ? "listing_id" : "room_id";
  const ownerId = (me.listing_id ?? me.room_id)!;
  const { data: all } = await db.from("photos").select("id, sort_order").eq(ownerColumn, ownerId).order("sort_order");
  const list = all ?? [];
  const i = list.findIndex((p) => p.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return { ok: true };
  [list[i], list[j]] = [list[j], list[i]];
  // 순서를 0,1,2…로 다시 매긴다
  const results = await Promise.all(list.map((p, idx) => db.from("photos").update({ sort_order: idx }).eq("id", p.id)));
  if (results.some((r) => r.error)) return { error: "server" };
  refresh();
  return { ok: true };
}

export async function updatePhotoAlt(id: string, alt: string): Promise<PhotoResult> {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), alt: z.string().trim().min(1).max(200) }).safeParse({ id, alt });
  if (!parsed.success) return { error: "invalid" };
  const db = await getSessionClient();
  const { error } = await db.from("photos").update({ alt_text: parsed.data.alt }).eq("id", parsed.data.id);
  if (error) return { error: "server" };
  refresh();
  return { ok: true };
}
