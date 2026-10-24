"use server";
// 예약 요청 접수·조회. 누구나 직접 호출할 수 있으므로 화면에서 검사했더라도 여기서 전부 다시 검사한다.
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { bookingCodeSchema, bookingRequestSchema, evaluateRequest, type RequestError, type RequestField } from "@/lib/booking-rules";
import { sendBookingEmail } from "@/lib/mail/send-booking-email";
import { allowRequest, verifyTurnstile } from "@/lib/rate-limit";
import { createBookingRequest, findBooking, getBookedRanges, getMyPendingRanges, getRoom, type BookingSummary } from "@/lib/repo";

export type RequestState = { error?: RequestError | "server" | "tooMany" | "captcha"; invalidFields?: RequestField[] } | null;

export async function submitBookingRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const parsed = bookingRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const invalidFields = [...new Set(parsed.error.issues.map((i) => i.path[0] as RequestField))];
    return { invalidFields };
  }
  const input = parsed.data;
  // 스팸 방지: 로봇 확인(설정된 경우) → 같은 접속지 횟수 제한
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) return { error: "captcha" };
  if (!(await allowRequest("request"))) return { error: "tooMany" };

  let code: string;
  try {
    const [room, booked, myPending] = await Promise.all([
      getRoom(input.roomId),
      getBookedRanges(input.roomId),
      getMyPendingRanges(input.roomId, input.email),
    ]);
    const result = evaluateRequest({ input, room, booked, myPending });
    if ("error" in result) return { error: result.error };
    // 금액은 화면에서 보낸 값이 아니라 서버가 방금 계산한 값으로 저장
    const saved = await createBookingRequest(input, result.price, room!);
    code = saved.code;
    // 메일은 화면 응답을 보낸 뒤에 보낸다. 실패해도 요청은 이미 저장됨 (기록 후 관리자가 다시 보내기)
    after(async () => {
      await sendBookingEmail(saved.id, "received");
      await sendBookingEmail(saved.id, "admin_new_request");
    });
  } catch {
    return { error: "server" };
  }
  redirect(`/booking/submitted?code=${code}`);
}

export type LookupState = { booking?: BookingSummary; error?: "invalid" | "notFound" | "server" | "tooMany" } | null;

const lookupSchema = z.object({
  code: bookingCodeSchema,
  email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email()),
});

export async function lookupBooking(_prev: LookupState, formData: FormData): Promise<LookupState> {
  // 번호를 마구 넣어 보는 것을 막기 위해 시도할 때마다 센다
  if (!(await allowRequest("lookup"))) return { error: "tooMany" };
  const parsed = lookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };
  try {
    const booking = await findBooking(parsed.data.code, parsed.data.email);
    return booking ? { booking } : { error: "notFound" };
  } catch {
    return { error: "server" };
  }
}
