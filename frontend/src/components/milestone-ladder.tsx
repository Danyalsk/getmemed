import type { Milestone } from "@contracts/campaign";

import { formatRupees, formatViews } from "@/lib/format";

export function MilestoneLadder({ milestones }: { milestones: readonly Milestone[] }) {
  return (
    <ol aria-label="Payout milestones" className="flex flex-wrap gap-2">
      {milestones.map((rung) => (
        <li key={rung.views} className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-xs">
          <span className="text-muted-foreground">{formatViews(rung.views)} views</span>
          <span aria-hidden className="text-muted-foreground">→</span>
          <span className="font-semibold text-wl-lime">{formatRupees(rung.payout)}</span>
        </li>
      ))}
    </ol>
  );
}
