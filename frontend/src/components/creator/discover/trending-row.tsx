"use client";

import { useQuery } from "@tanstack/react-query";
import { FlameIcon } from "lucide-react";
import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { CampaignCover } from "@/components/campaign-cover";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const TOP_COUNT = 10;

const PODIUM_STEPS = [
  { rank: 2, sticker: "bg-zinc-300", placement: "order-2 md:order-1 md:mt-12" },
  { rank: 1, sticker: "bg-warning", placement: "order-1 md:order-2" },
  { rank: 3, sticker: "bg-pop-orange", placement: "order-3 md:mt-20" },
] as const;

function HeatMeter({ posts, hottest }: { posts: number; hottest: number }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <FlameIcon aria-hidden className="size-3.5 shrink-0 text-pop-orange" />
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-linear-to-r from-brand to-pop-orange"
          style={{ width: `${(posts / hottest) * 100}%` }}
        />
      </span>
      <span className="tabular-nums">
        {posts} {posts === 1 ? "post" : "posts"}
      </span>
    </span>
  );
}

const topPayout = (campaign: Campaign): string => formatRupees(campaign.milestones.at(-1)?.payout ?? 0);

function PodiumStep({ campaign, rank, sticker, hottest }: { campaign: Campaign; rank: number; sticker: string; hottest: number }) {
  return (
    <Link
      href={campaignHref(campaign._id)}
      transitionTypes={TRANSITION_TYPES.forward}
      aria-label={`Number ${rank}: ${campaign.name}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none"
    >
      <span className="flex flex-col gap-3 p-3">
        <span className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <CampaignCover campaign={campaign} sizes="(min-width: 768px) 420px, 100vw" />
          <span
            aria-hidden
            className={`absolute top-3 left-3 -rotate-6 rounded-xl px-3 py-0.5 text-3xl font-extrabold text-ink shadow-[0.08em_0.1em_0_rgb(0_0_0/0.65)] transition-transform duration-300 group-hover:-rotate-12 motion-reduce:transition-none ${sticker}`}
          >
            {rank}
          </span>
        </span>
        <span className="flex flex-col gap-1.5 px-1 pb-1">
          <span className="truncate font-semibold group-hover:underline">{campaign.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {campaign.brand.name} · up to <span className="text-success">{topPayout(campaign)}</span>
          </span>
          <HeatMeter posts={campaign.submissionCount} hottest={hottest} />
        </span>
      </span>
    </Link>
  );
}

export function TrendingRow() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: TOP_COUNT, sort: "trending" }));
  if (data?.total === 0) return null;

  const campaigns = data?.items ?? [];
  const hottest = Math.max(1, ...campaigns.map((campaign) => campaign.submissionCount));
  const rest = campaigns.slice(PODIUM_STEPS.length);

  return (
    <section aria-labelledby="trending-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h2 id="trending-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
          Trending this week
        </h2>
        <p className="text-sm text-muted-foreground">Where creators are posting the most right now.</p>
      </div>

      {data ? (
        <>
          <div className="grid items-start gap-4 md:grid-cols-[1fr_1.2fr_1fr]">
            {PODIUM_STEPS.map(({ rank, sticker, placement }) => {
              const campaign = campaigns[rank - 1];
              return campaign ? (
                <div key={rank} className={placement}>
                  <PodiumStep campaign={campaign} rank={rank} sticker={sticker} hottest={hottest} />
                </div>
              ) : null;
            })}
          </div>

          {rest.length > 0 && (
            <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {rest.map((campaign, index) => (
                <li key={campaign._id}>
                  <Link
                    href={campaignHref(campaign._id)}
                    transitionTypes={TRANSITION_TYPES.forward}
                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-card"
                  >
                    <span className="w-7 shrink-0 text-lg font-extrabold text-muted-foreground tabular-nums">
                      {index + PODIUM_STEPS.length + 1}
                    </span>
                    <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <CampaignCover campaign={campaign} sizes="80px" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium group-hover:underline">{campaign.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {campaign.submissionCount} {campaign.submissionCount === 1 ? "post" : "posts"} · up to{" "}
                        {topPayout(campaign)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <div className="grid items-end gap-4 md:grid-cols-[1fr_1.2fr_1fr]">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )}
    </section>
  );
}
