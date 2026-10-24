// 사이트 주소 (메일 링크·검색엔진용 절대 주소). 설정값이 없으면 Vercel 무료 주소.
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dalbang.vercel.app").replace(/\/$/, "");
}
