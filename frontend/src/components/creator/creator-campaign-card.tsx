"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Campaign } from "@contracts/campaign";

import { CampaignCard, CARD_LINK_CLASS } from "@/components/campaign-card";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { queries } from "@/lib/queries";

export function campaignHref(campaignId: string): string {
  return `/creator/campaigns/${campaignId}`;
}

interface CreatorCampaignCardProps {
  campaign: Campaign;
  footer?: ReactNode;
  morphCover?: boolean;
}

export function CreatorCampaignCard({ campaign, footer, morphCover }: CreatorCampaignCardProps) {
  const queryClient = useQueryClient();
  const primeCampaignPage = () => queryClient.setQueryData(queries.campaign(campaign._id).queryKey, campaign);

  return (
    <CampaignCard
      campaign={campaign}
      footer={footer}
      morphCover={morphCover}
      title={
        <Link
          href={campaignHref(campaign._id)}
          transitionTypes={TRANSITION_TYPES.forward}
          onClick={primeCampaignPage}
          className={CARD_LINK_CLASS}
        >
          {campaign.name}
        </Link>
      }
    />
  );
}
