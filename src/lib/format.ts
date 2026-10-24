// 금액·날짜 표시는 이 함수들로만 (CLAUDE.md 규칙)
import { parseDate } from "./dates";

export function formatKRW(amount: number): string {
  return `₩${Math.round(amount).toLocaleString("en-US")}`;
}

/** "2026-03-15" → "Mar 15, 2026" */
export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** 지도 핀용 짧은 금액: 750000 → "₩750k", 1290000 → "₩1.29M" */
export function formatKRWShort(amount: number): string {
  if (amount >= 1_000_000) return `₩${Number((amount / 1_000_000).toFixed(2))}M`;
  return `₩${Math.round(amount / 1000)}k`;
}
