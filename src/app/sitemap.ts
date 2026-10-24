import type { MetadataRoute } from "next";
import { searchRooms } from "@/lib/repo";
import { siteUrl } from "@/lib/site";

// 검색 엔진용 페이지 목록. 공개된 숙소·방만 들어간다 (숨긴 것은 RLS가 걸러냄)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const rooms = await searchRooms();
  const listingIds = [...new Set(rooms.map((r) => r.listingId))];
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/rooms`, changeFrequency: "daily", priority: 0.9 },
    ...listingIds.map((id) => ({ url: `${base}/listings/${id}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...rooms.map((r) => ({ url: `${base}/rooms/${r.id}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...["faq", "terms", "privacy"].map((p) => ({ url: `${base}/${p}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
