import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { CampaignCard, CARD_TARGET_CLASS } from "@/components/campaign-card";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";

import { CampaignActions } from "./campaign-actions";

/** Brand's campaign card: opens the campaign page, with status and actions on the photo. */
export function CampaignGridItem({ campaign }: { campaign: Campaign }) {
  return (
    <CampaignCard
      campaign={campaign}
      title={
        <Link href={`/brand/campaigns/${campaign._id}`} className={CARD_TARGET_CLASS}>
          {campaign.name}
        </Link>
      }
      topLeft={<CampaignStatusBadge campaign={campaign} />}
      topRight={
        <div className="rounded-md bg-background/70 backdrop-blur">
          <CampaignActions campaign={campaign} layout="menu" />
        </div>
      }
    />
  );
}
