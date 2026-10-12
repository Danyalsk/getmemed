"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { CampaignCard, CARD_LINK_CLASS } from "@/components/campaign-card";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { queries } from "@/lib/queries";

import { CampaignActions } from "./campaign-actions";

export function BrandCampaignCard({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  const primeCampaignPage = () => queryClient.setQueryData(queries.campaign(campaign._id).queryKey, campaign);

  return (
    <CampaignCard
      campaign={campaign}
      title={
        <Link
          href={`/brand/campaigns/${campaign._id}`}
          transitionTypes={TRANSITION_TYPES.forward}
          onClick={primeCampaignPage}
          className={CARD_LINK_CLASS}
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
