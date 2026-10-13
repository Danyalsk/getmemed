"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { AVAILABILITY_LABELS, getCampaignAvailability } from "@/components/campaign-availability";
import { CampaignView } from "@/components/campaign/campaign-view";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queries } from "@/lib/queries";

import { SubmitPostSheet } from "./submit-post-sheet";

function SubmitAction({ campaign }: { campaign: Campaign }) {
  const availability = getCampaignAvailability(campaign);
  if (availability !== "open") {
    return (
      <Button size="lg" disabled>
        {AVAILABILITY_LABELS[availability]}
      </Button>
    );
  }
  return (
    <SubmitPostSheet
      campaign={campaign}
      trigger={
        <Button size="lg">
          Submit a post <ArrowUpRightIcon />
        </Button>
      }
    />
  );
}

export function CampaignOverview({ campaignId }: { campaignId: string }) {
  const { data: campaign, error, refetch } = useQuery(queries.campaign(campaignId));

  return (
    <>
      <Link
        href="/creator/discover"
        transitionTypes={TRANSITION_TYPES.back}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> Discover
      </Link>
      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}
      {campaign ? (
        <CampaignView campaign={campaign} actions={<SubmitAction campaign={campaign} />} />
      ) : (
        !error && <Skeleton className="h-96 w-full rounded-3xl" />
      )}
    </>
  );
}
