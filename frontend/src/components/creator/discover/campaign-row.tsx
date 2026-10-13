"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import type { CampaignSort } from "@contracts/campaign";

import { CampaignCardSkeleton } from "@/components/campaign-card";
import { ScrollRow } from "@/components/scroll-row";
import { Button } from "@/components/ui/button";
import { queries } from "@/lib/queries";

import { CreatorCampaignCard } from "../creator-campaign-card";

const ROW_SIZE = 10;

interface CampaignRowProps {
  title: string;
  description: string;
  sort: CampaignSort;
  seeAllHref?: string;
}

export function CampaignRow({ title, description, sort, seeAllHref }: CampaignRowProps) {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: ROW_SIZE, sort }));
  if (data?.total === 0) return null;

  return (
    <ScrollRow
      title={title}
      description={description}
      action={
        seeAllHref && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={seeAllHref}>See all</Link>
          </Button>
        )
      }
    >
      {(data?.items ?? Array.from({ length: 4 }, () => null)).map((campaign, index) => (
        <div key={campaign?._id ?? index} className="w-[290px] shrink-0 snap-start sm:w-[340px]">
          {campaign ? <CreatorCampaignCard campaign={campaign} /> : <CampaignCardSkeleton />}
        </div>
      ))}
    </ScrollRow>
  );
}
