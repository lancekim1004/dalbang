import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// 검색 엔진 안내: 관리자·예약 조회·서버 주소는 수집하지 말 것
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/booking", "/api", "/rooms/*/request"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
