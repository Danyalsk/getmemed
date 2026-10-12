import type { Milestone } from "@contracts/campaign";

import { formatRupees, formatViews } from "@/lib/format";

const RUNG_COLORS = ["bg-wl-green", "bg-wl-purple", "bg-wl-pink", "bg-wl-yellow"];

export function MilestoneLadder({ milestones }: { milestones: readonly Milestone[] }) {
  return (
    <ol aria-label="Payout ladder" className="flex flex-wrap gap-2">
      {milestones.map((rung, index) => (
        <li
          key={rung.views}
          className={`${RUNG_COLORS[index % RUNG_COLORS.length]} rounded-md border-2 border-ink px-2 py-1 text-xs font-bold`}
        >
          {formatViews(rung.views)} views → {formatRupees(rung.payout)}
        </li>
      ))}
    </ol>
  );
}
