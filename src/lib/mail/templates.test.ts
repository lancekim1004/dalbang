import { describe, expect, it } from "vitest";
import { buildMail, type MailBooking } from "./templates";

const b: MailBooking = {
  id: "11111111-1111-4111-8111-111111111111", code: "DB-7K3Q9P", guestName: "Alex <script>", guestEmail: "alex@example.com",
  checkIn: "2027-03-15", checkOut: "2027-05-20", guests: 1, totalAmount: 2_650_000, roomName: "Room A",
  listingTitle: "Hongdae Garden House", addressEn: "Seogyo-dong, Mapo-gu", districtSlug: "mapo", rejectReason: "Room under repair", message: "Hello",
};

describe("메일 내용", () => {
  it("접수 메일: 손님에게, 예약 번호·금액·조회 링크 포함", () => {
    const m = buildMail("received", b);
    expect(m.to).toBe("alex@example.com");
    expect(m.subject).toContain("DB-7K3Q9P");
    expect(m.text).toContain("₩2,650,000");
    expect(m.text).toContain("Mar 15, 2027");
    expect(m.text).toContain("/booking/lookup?code=DB-7K3Q9P");
  });
  it("손님이 넣은 글자는 HTML에서 무력화(escape)", () => {
    const m = buildMail("received", b);
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain("&lt;script&gt;");
  });
  it("거절 메일: 사유와 같은 동네 방 링크", () => {
    const m = buildMail("rejected", b);
    expect(m.text).toContain("Room under repair");
    expect(m.text).toContain("/rooms?district=mapo");
  });
  it("관리자 알림: 관리자에게, 관리자 화면 링크", () => {
    const m = buildMail("admin_new_request", b, "owner@example.com");
    expect(m.to).toBe("owner@example.com");
    expect(m.text).toContain(`/admin/bookings/${b.id}`);
  });
});
