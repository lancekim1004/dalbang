"use client";
// Cloudflare Turnstile("로봇이 아닙니다" 확인). 사이트 키가 설정됐을 때만 보인다.
// 위젯이 양식 안에 'cf-turnstile-response' 칸을 자동으로 넣어 준다.
import Script from "next/script";

export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
