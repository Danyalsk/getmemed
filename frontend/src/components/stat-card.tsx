import { cn } from "cn";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-xl border-2 border-ink p-4 shadow-brutal", className)}>
      <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
      <span className="font-heading text-2xl tabular-nums sm:text-3xl">{value}</span>
    </div>
  );
}
