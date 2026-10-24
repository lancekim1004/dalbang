// 사이트가 켜져 있을 때 주요 화면·보안 설정을 확인한다
import { describe, expect, it } from "vitest";

const BASE = (process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const get = (path: string) => fetch(BASE + path, { redirect: "manual" });

describe(`사이트 점검 (${BASE})`, () => {
  it.each(["/", "/rooms", "/rooms?district=mapo", "/booking/lookup", "/faq", "/terms", "/privacy", "/robots.txt", "/sitemap.xml"])(
    "%s 열림",
    async (path) => {
      expect((await get(path)).status).toBe(200);
    },
  );

  it("방 목록에 방이 있고, 방 상세·숙소 상세·요청 화면이 열림", async () => {
    const html = await (await get("/rooms")).text();
    const roomPath = html.match(/href="(\/rooms\/[0-9a-f-]{36})"/)?.[1];
    expect(roomPath).toBeTruthy();
    const roomHtml = await (await get(roomPath!)).text();
    const listingPath = roomHtml.match(/href="(\/listings\/[0-9a-f-]{36})"/)?.[1];
    expect((await get(listingPath!)).status).toBe(200);
    expect((await get(`${roomPath}/request`)).status).toBe(200);
  });

  it("없는 주소는 404", async () => {
    expect((await get("/no-such-page")).status).toBe(404);
    expect((await get("/rooms/not-a-room")).status).toBe(404);
  });

  it("로그인 안 하면 관리자 화면 → 로그인 화면으로", async () => {
    for (const path of ["/admin", "/admin/bookings", "/admin/listings"]) {
      const r = await get(path);
      expect(r.status).toBe(307);
      expect(r.headers.get("location")).toContain("/admin/login");
    }
  });

  it("자동 작업 주소는 비밀 값 없이 거부", async () => {
    expect((await get("/api/cron/daily")).status).toBe(401);
  });

  it("보안 헤더가 붙어 있음", async () => {
    const h = (await get("/")).headers;
    expect(h.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(h.get("x-content-type-options")).toBe("nosniff");
    expect(h.get("x-powered-by")).toBeNull();
  });
});
