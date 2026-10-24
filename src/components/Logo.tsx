/** 달(초승달) 모양 로고 + 글자 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7">
        <circle cx="16" cy="16" r="15" className="fill-ink" />
        <path d="M20.5 8.5a8.5 8.5 0 1 0 3 12.6A7 7 0 0 1 20.5 8.5Z" className="fill-moon" />
      </svg>
      <span className="text-lg">Dalbang</span>
    </span>
  );
}
