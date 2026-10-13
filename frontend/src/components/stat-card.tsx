import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | undefined;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
        {label}
        <Icon className="size-4 shrink-0" />
      </div>
      {value === undefined ? (
        <Skeleton className="h-7 w-24 sm:h-8 sm:w-28" />
      ) : (
        <span className="text-xl font-semibold tracking-tight break-words tabular-nums sm:text-2xl">{value}</span>
      )}
    </div>
  );
}
