import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { PublishedBadge, SavedNotice } from "@/components/admin/Badge";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { RoomForm } from "@/components/admin/RoomForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminListing, getAdminRoom } from "@/lib/repo";

export async function generateMetadata() {
  return { title: (await getTranslations("Admin.rooms"))("editTitle") };
}

const uuid = z.uuid();

export default async function AdminRoomPage({ params, searchParams }: PageProps<"/admin/rooms/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const t = await getTranslations("Admin.rooms");
  const isNew = id === "new";
  const room = isNew ? null : uuid.safeParse(id).success ? await getAdminRoom(id) : null;
  if (!isNew && !room) notFound();
  // 새 방은 어느 숙소에 넣을지 주소(?listing=)로 받는다
  const listingId = room?.listing_id ?? uuid.safeParse(sp.listing).data;
  const listing = !room && listingId ? await getAdminListing(listingId) : null;
  if (!listingId || (!room && !listing)) notFound();
  const listingTitle = room?.listing.title ?? listing!.title;

  return (
    <div className="space-y-6">
      <Link href={`/admin/listings/${listingId}`} className="text-sm text-muted hover:text-ink">← {listingTitle}</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{room ? room.name : t("new")}</h1>
        {room && <PublishedBadge published={room.is_published} />}
        {room?.is_published && room.listing.is_published && <Link href={`/rooms/${room.id}`} className="text-sm underline underline-offset-2">{t("viewPublic")}</Link>}
      </div>
      {sp.saved && <SavedNotice />}
      {/* 대기 요청이 있는 방을 숨기면 기존 요청은 그대로 남는다 (PLAN 4-6) */}
      {room && !room.is_published && room.pendingCount > 0 && (
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900">{t("hiddenWithPending", { count: room.pendingCount })}</p>
      )}
      <RoomForm room={room ?? undefined} listingId={listingId} />
      {room && <PhotoManager owner={{ kind: "room", id: room.id }} photos={room.photos} />}
    </div>
  );
}
