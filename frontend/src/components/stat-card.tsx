import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | undefined;
  icon: LucideIcon;
  accent: string;
}

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className={`size-4 ${accent}`} />
      </div>
      {value === undefined ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
      )}
    </div>
  );
}
