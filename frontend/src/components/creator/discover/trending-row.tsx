"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { CampaignCover } from "@/components/campaign-cover";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { ScrollRow } from "@/components/scroll-row";
import { Skeleton } from "@/components/ui/skeleton";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const TOP_COUNT = 10;

export function TrendingRow() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: TOP_COUNT, sort: "trending" }));
  if (data?.total === 0) return null;

  return (
    <ScrollRow title="Trending this week" description="Where creators are posting the most right now.">
      {data
        ? data.items.map((campaign, index) => (
            <Link
              key={campaign._id}
              href={campaignHref(campaign._id)}
              transitionTypes={TRANSITION_TYPES.forward}
              className="group flex shrink-0 snap-start items-end"
            >
              <span
                aria-hidden
                className="-mr-5 text-[150px] leading-[0.8] font-black text-transparent [-webkit-text-stroke:3px_var(--color-wl-yellow)] select-none sm:text-[190px]"
              >
                {index + 1}
              </span>
              <span className="relative flex w-[260px] flex-col gap-2 sm:w-[320px]">
                <span className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
                  <CampaignCover campaign={campaign} sizes="320px" />
                </span>
                <span className="truncate text-sm font-medium group-hover:underline">{campaign.name}</span>
              </span>
            </Link>
          ))
        : Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-video w-[300px] shrink-0 rounded-2xl" />
          ))}
    </ScrollRow>
  );
}
