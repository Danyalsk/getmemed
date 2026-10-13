import type { ReactNode } from "react";

import type { Campaign } from "@contracts/campaign";

import { Panel } from "@/components/analytics/panel";
import { formatRupees } from "@/lib/format";

import { BudgetUsage } from "./budget-usage";
import { CampaignBrief } from "./campaign-brief";
import { CampaignHero } from "./campaign-hero";
import { CampaignLeaderboard } from "./campaign-leaderboard";
import { PayoutTrack } from "./payout-track";

interface CampaignViewProps {
  campaign: Campaign;
  actions: ReactNode;
}

export function CampaignView({ campaign, actions }: CampaignViewProps) {
  return (
    <>
      <CampaignHero campaign={campaign} actions={actions} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-5">
          <Panel title="Payout track" description="Each post earns the highest milestone it reaches. Milestones don't stack.">
            <PayoutTrack milestones={campaign.milestones} />
          </Panel>
          <CampaignBrief campaign={campaign} />
        </div>
        <div className="flex flex-col gap-5">
          <Panel title="Budget" description={`${formatRupees(campaign.budget)} total`}>
            <BudgetUsage campaign={campaign} />
          </Panel>
          <CampaignLeaderboard campaignId={campaign._id} />
        </div>
      </div>
    </>
  );
}
