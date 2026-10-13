"use client";

import { useQuery } from "@tanstack/react-query";
import { FlameIcon } from "lucide-react";
import Link from "next/link";

import { CampaignCover } from "@/components/campaign-cover";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { ScrollRow } from "@/components/scroll-row";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCENT_BACKGROUNDS } from "@/lib/accents";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const TOP_COUNT = 10;

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
              className="group flex w-[280px] shrink-0 snap-start flex-col gap-3 sm:w-[320px]"
            >
              <span className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
                <CampaignCover campaign={campaign} sizes="320px" />
                <span
                  className={`absolute top-3 left-3 -rotate-6 rounded-lg px-2 py-0.5 text-sm font-extrabold text-ink shadow-[0.1em_0.12em_0_rgb(0_0_0/0.65)] ${ACCENT_BACKGROUNDS[index % ACCENT_BACKGROUNDS.length]}`}
                >
                  #{index + 1}
                </span>
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="truncate font-medium group-hover:underline">{campaign.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FlameIcon aria-hidden className="size-3.5 shrink-0 text-pop-orange" />
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-linear-to-r from-brand to-pop-orange"
                      style={{ width: `${(campaign.submissionCount / hottest) * 100}%` }}
                    />
                  </span>
                  <span className="tabular-nums">
                    {campaign.submissionCount} {campaign.submissionCount === 1 ? "post" : "posts"}
                  </span>
                </span>
              </span>
            </Link>
          ))
        : Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-video w-[300px] shrink-0 rounded-2xl" />
          ))}
    </ScrollRow>
  );
}
