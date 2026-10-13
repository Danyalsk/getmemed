"use client";

import { useQuery } from "@tanstack/react-query";

import type { CampaignSort } from "@contracts/campaign";

import { CampaignCardSkeleton } from "@/components/campaign-card";
import { ScrollRow } from "@/components/scroll-row";
import { queries } from "@/lib/queries";

import { CreatorCampaignCard } from "../creator-campaign-card";

const ROW_SIZE = 10;

interface CampaignRowProps {
  title: string;
  description: string;
  sort: CampaignSort;
}

export function CampaignRow({ title, description, sort }: CampaignRowProps) {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: ROW_SIZE, sort }));
  if (data?.total === 0) return null;

  return (
    <ScrollRow title={title} description={description}>
      {(data?.items ?? Array.from({ length: 4 }, () => null)).map((campaign, index) => (
        <div key={campaign?._id ?? index} className="w-[290px] shrink-0 snap-start sm:w-[340px]">
          {campaign ? <CreatorCampaignCard campaign={campaign} /> : <CampaignCardSkeleton />}
        </div>
      ))}
    </ScrollRow>
  );
}
