import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// 다국어 설정 파일(src/i18n/request.ts)을 연결
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // 새 캐시 기능은 끄고, 관리하기 쉬운 기존 방식 사용 (PLAN.md 참고)
  cacheComponents: false,
  experimental: {
    // 관리자 사진 올리기용. 사진은 브라우저에서 줄여 보내고 서버가 2.5MB 넘으면 거절 (여유분 포함 3MB)
    serverActions: { bodySizeLimit: "3mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // 예시 사진(Unsplash)과 나중에 쓸 Supabase 사진 창고만 허용
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default withNextIntl(nextConfig);
