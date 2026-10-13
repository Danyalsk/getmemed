import type { Milestone } from "@contracts/campaign";

import { formatRupees, formatViews } from "@/lib/format";

function connectorClass(index: number, last: number): string {
  if (last === 0) return "hidden";
  if (index === 0) return "left-1/2 right-0";
  if (index === last) return "left-0 right-1/2";
  return "inset-x-0";
}

export function PayoutTrack({ milestones }: { milestones: readonly Milestone[] }) {
  const last = milestones.length - 1;
  return (
    <ol aria-label="Payout milestones" className="flex overflow-x-auto pb-1">
      {milestones.map((rung, index) => (
        <li key={rung.views} className="flex min-w-24 flex-1 flex-col items-center gap-3 text-center">
          <span className="text-base font-semibold text-wl-lime tabular-nums sm:text-lg">{formatRupees(rung.payout)}</span>
          <span className="relative flex h-3 w-full items-center justify-center">
            <span aria-hidden className={`absolute h-0.5 bg-wl-lime/30 ${connectorClass(index, last)}`} />
            <span className="relative size-3 rounded-full bg-wl-lime ring-4 ring-card" />
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{formatViews(rung.views)} views</span>
        </li>
      ))}
    </ol>
  );
}
