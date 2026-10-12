import type { Campaign } from "@contracts/campaign";

import { Progress } from "@/components/ui/progress";
import { formatRupees } from "@/lib/format";

export function BudgetUsage({ campaign }: { campaign: Pick<Campaign, "budget" | "spent" | "remaining"> }) {
  const percent = Math.round((campaign.spent / campaign.budget) * 100);
  return (
    <div className="flex min-w-48 flex-col gap-1.5">
      <Progress value={percent} aria-label={`${percent}% of budget spent`} />
      <div className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
        <span>
          <span className="font-medium text-foreground">{formatRupees(campaign.spent)}</span> spent
        </span>
        <span>{formatRupees(campaign.remaining)} left</span>
      </div>
    </div>
  );
}
