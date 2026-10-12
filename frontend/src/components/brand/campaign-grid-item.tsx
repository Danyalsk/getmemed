"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { CampaignCard, CARD_TARGET_CLASS } from "@/components/campaign-card";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { TRANSITION } from "@/components/page-transition";
import { queries } from "@/lib/queries";

import { CampaignActions } from "./campaign-actions";

/** Brand's campaign card: opens the campaign page, with status and actions on the photo. */
export function CampaignGridItem({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  // The campaign page renders straight from this data, so its hero exists in the
  // same view transition and the cover photo can morph into it.
  const primeCampaignPage = () => queryClient.setQueryData(queries.campaign(campaign._id).queryKey, campaign);

  return (
    <CampaignCard
      campaign={campaign}
      title={
        <Link
          href={`/brand/campaigns/${campaign._id}`}
          transitionTypes={TRANSITION.forward}
          onClick={primeCampaignPage}
          className={CARD_TARGET_CLASS}
        >
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
