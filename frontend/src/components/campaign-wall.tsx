"use client";

import { useQuery } from "@tanstack/react-query";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees, formatRupeesCompact } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { queries } from "@/lib/queries";

const MIN_CARDS_PER_COLUMN = 4;

function WallCard({ campaign }: { campaign: Campaign }) {
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;
  const remainingPercent = (campaign.remaining / campaign.budget) * 100;

  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-video bg-muted">
        <CampaignCover campaign={campaign} sizes="320px" />
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{campaign.brand.name}</span>
          <PlatformIcon className="size-3.5 shrink-0" aria-label={PLATFORM_LABELS[campaign.platform]} />
        </div>
        <h3 className="truncate text-sm font-medium">{campaign.name}</h3>
        <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
          <span className="font-medium text-wl-lime">Up to {formatRupees(topPayout)}</span>
          <span className="text-muted-foreground">{formatRupeesCompact(campaign.remaining)} left</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-wl-lime" style={{ width: `${remainingPercent}%` }} />
        </div>
      </div>
    </article>
  );
}

function WallColumn({ campaigns, reverse }: { campaigns: readonly Campaign[]; reverse: boolean }) {
  const repeats = Math.ceil(MIN_CARDS_PER_COLUMN / campaigns.length);
  const loop = Array.from({ length: repeats * 2 }, () => campaigns).flat();

  return (
    <ul
      className={`flex flex-col gap-4 pb-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none ${reverse ? "animate-[marquee-y_60s_linear_infinite_reverse]" : "animate-[marquee-y_48s_linear_infinite]"}`}
    >
      {loop.map((campaign, index) => (
        <li key={`${campaign._id}-${index}`} aria-hidden={index >= campaigns.length}>
          <WallCard campaign={campaign} />
        </li>
      ))}
    </ul>
  );
}

export function CampaignWall() {
  const { data } = useQuery(queries.featuredCampaigns);
  const campaigns = data?.items ?? [];

  if (!data) {
    return (
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-hidden mask-b-from-70%">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (campaigns.length === 0) return <div className="flex-1" />;

  const columns = [campaigns.filter((_, index) => index % 2 === 0), campaigns.filter((_, index) => index % 2 === 1)];

  return (
    <section
      aria-label="Campaigns running on Meme'd right now"
      className="group grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-hidden mask-y-from-80%"
    >
      {columns.map((column, index) =>
        column.length > 0 ? <WallColumn key={index} campaigns={column} reverse={index === 1} /> : null,
      )}
    </section>
  );
}
