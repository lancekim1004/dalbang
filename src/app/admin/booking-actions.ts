"use server";
// 예약 승인·거절·취소, 관리자 메모, 메일 다시 보내기
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { sendBookingEmail } from "@/lib/mail/send-booking-email";
import { getAdminClient } from "@/lib/supabase/admin-client";

export type DecideState = { error?: "invalid" | "needReason" | "overlap" | "invalidState" | "server"; done?: string } | null;

const schema = z.object({
  id: z.uuid(),
  action: z.enum(["approve", "reject", "cancel"]),
  reason: z.string().trim().max(500).optional().transform((v) => v || null),
});

export async function decideBooking(_prev: DecideState, formData: FormData): Promise<DecideState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };
  const { id, action, reason } = parsed.data;
  if (action === "reject" && !reason) return { error: "needReason" };

  const t = await getTranslations("Admin.booking");
  const { data, error } = await getAdminClient().rpc("decide_booking", {
    p_booking_id: id,
    p_action: action,
    p_actor: `admin:${admin.email}`,
    p_reason: reason as string,
    p_auto_reject_reason: t("autoRejectReason"),
    p_decided_by: admin.userId,
  });
  if (error) {
    if (error.code === "23P01") return { error: "overlap" }; // 이미 겹치는 확정 예약이 있음
    if (error.message.includes("invalid_transition")) return { error: "invalidState" };
    console.error(`[booking-actions] decide: ${error.message}`);
    return { error: "server" };
  }
  // 결과 메일은 응답 뒤에 보낸다 (실패해도 처리는 이미 끝남, 기록에 남음)
  after(async () => {
    for (const row of data) {
      const type = row.new_status === "approved" ? "approved" : row.new_status === "cancelled" ? "cancelled" : "rejected";
      await sendBookingEmail(row.booking_id, type);
    }
  });
  revalidatePath("/", "layout"); // 손님 화면의 예약 달력도 바뀐다
  return { done: action };
}

export async function saveAdminNote(id: string, note: string): Promise<boolean> {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), note: z.string().max(2000) }).safeParse({ id, note });
  if (!parsed.success) return false;
  const { error } = await getAdminClient().from("bookings").update({ admin_note: parsed.data.note.trim() || null }).eq("id", parsed.data.id);
  return !error;
}

export async function resendEmail(logId: string): Promise<boolean> {
  await requireAdmin();
  if (!z.uuid().safeParse(logId).success) return false;
  const { data } = await getAdminClient().from("email_logs").select("booking_id, type").eq("id", logId).maybeSingle();
  if (!data?.booking_id) return false;
  const ok = await sendBookingEmail(data.booking_id, data.type);
  revalidatePath(`/admin/bookings/${data.booking_id}`);
  return ok;
}
