import { Check } from "lucide-react";

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
      {items.map((label) => (
        <li key={label} className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
