import type { Campaign } from "@contracts/campaign";

import { MilestoneLadder } from "@/components/milestone-ladder";
import { PlatformLabel } from "@/components/platform-label";
import { formatRupees } from "@/lib/format";

import { SubmitPostDialog } from "./submit-post-dialog";

export function LiveCampaignCard({ campaign }: { campaign: Campaign }) {
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;
  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-wl-lime/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">{campaign.name}</h3>
          <span className="text-sm text-muted-foreground">by {campaign.brand.name}</span>
        </div>
        <PlatformLabel platform={campaign.platform} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-wl-lime tabular-nums">{formatRupees(topPayout)}</span>
        <span className="text-sm text-muted-foreground">top payout per post</span>
      </div>
      <MilestoneLadder milestones={campaign.milestones} />
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <span className="text-xs text-muted-foreground tabular-nums">{formatRupees(campaign.remaining)} budget left</span>
        <SubmitPostDialog campaign={campaign} />
      </div>
    </article>
  );
}
