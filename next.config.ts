import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// 다국어 설정 파일(src/i18n/request.ts)을 연결
const withNextIntl = createNextIntlPlugin();

// 3-4. 보안 헤더: 브라우저가 이 사이트에서 허용할 것만 정해 둔다
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  // Next.js 화면 조립용 인라인 스크립트 + 스팸 방지(Turnstile). 개발 모드는 빠른 새로고침에 eval 필요
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
