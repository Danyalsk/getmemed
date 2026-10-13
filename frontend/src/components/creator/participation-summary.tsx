import type { Participation } from "@contracts/campaign";

import { formatRupees, formatViews } from "@/lib/format";

export function ParticipationSummary({ participation }: { participation: Participation }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-center text-xs">
      <div className="flex flex-col">
        <span className="text-muted-foreground">Your posts</span>
        <span className="font-semibold tabular-nums">{participation.posts}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-muted-foreground">Views</span>
        <span className="font-semibold tabular-nums">{formatViews(participation.views)}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-muted-foreground">Earned</span>
        <span className="font-semibold text-wl-lime tabular-nums">{formatRupees(participation.earned)}</span>
      </div>
    </div>
  );
}
