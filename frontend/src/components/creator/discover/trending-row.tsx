"use client";

import { useQuery } from "@tanstack/react-query";
import { FlameIcon } from "lucide-react";
import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { TRANSITION_TYPES } from "@/components/page-transition";
import { ScrollRow } from "@/components/scroll-row";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const TOP_COUNT = 10;
const FALLBACK_FILL = "linear-gradient(135deg, var(--color-brand), var(--color-pop-orange))";

function rankFill(campaign: Campaign): string {
  return campaign.coverImage ? `url(${getImageUrl(campaign.coverImage)})` : FALLBACK_FILL;
}

export function TrendingRow() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: TOP_COUNT, sort: "trending" }));
  if (data?.total === 0) return null;
  const hottest = Math.max(1, ...(data?.items.map((campaign) => campaign.submissionCount) ?? []));

  return (
    <ScrollRow title="Trending this week" description="Where creators are posting the most right now.">
      {data
        ? data.items.map((campaign, index) => (
            <Link
              key={campaign._id}
              href={campaignHref(campaign._id)}
              transitionTypes={TRANSITION_TYPES.forward}
              className="group flex w-[320px] shrink-0 snap-start items-center gap-4 border-l pl-5 first:border-l-0 first:pl-0 sm:w-[370px]"
            >
              <span
                aria-hidden
                style={{ backgroundImage: rankFill(campaign) }}
                className="bg-[length:260%] bg-center bg-clip-text text-[150px] leading-[0.82] font-extrabold tracking-tighter text-transparent transition-transform duration-500 ease-out select-none [-webkit-text-stroke:1.5px_rgb(255_255_255/0.35)] group-hover:scale-105 group-hover:-rotate-3 motion-reduce:transition-none sm:text-[180px]"
              >
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-xs text-muted-foreground">#{index + 1} trending</span>
                <span className="line-clamp-2 text-base leading-snug font-semibold group-hover:underline">
                  {campaign.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {campaign.brand.name} · up to{" "}
                  <span className="text-brand">{formatRupees(campaign.milestones.at(-1)?.payout ?? 0)}</span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FlameIcon aria-hidden className="size-3.5 shrink-0 text-pop-orange" />
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-linear-to-r from-brand to-pop-orange"
                      style={{ width: `${(campaign.submissionCount / hottest) * 100}%` }}
                    />
                  </span>
                  <span className="tabular-nums">{campaign.submissionCount}</span>
                </span>
              </span>
            </Link>
          ))
        : Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36 w-[300px] shrink-0 rounded-2xl" />
          ))}
    </ScrollRow>
  );
}
