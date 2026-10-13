import type { ReactNode } from "react";

export interface BarListItem {
  key: string;
  label: ReactNode;
  value: number;
  display: string;
  detail?: string;
}

interface BarListProps {
  items: BarListItem[];
  emptyMessage: string;
  barClassName?: string;
}

export function BarList({ items, emptyMessage, barClassName = "bg-brand" }: BarListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="shrink-0 font-medium tabular-nums">{item.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          {item.detail && <span className="text-xs text-muted-foreground">{item.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
