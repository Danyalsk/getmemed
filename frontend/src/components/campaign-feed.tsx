"use client";

import { useQuery } from "@tanstack/react-query";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees, formatRupeesCompact } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { queries } from "@/lib/queries";

const MIN_ROWS = 8;
const SECONDS_PER_ROW = 4;

function FeedRow({ campaign }: { campaign: Campaign }) {
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;

  return (
    <div className="flex items-center gap-4 border-b border-white/10 py-4">
      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        <CampaignCover campaign={campaign} sizes="56px" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-lg leading-tight font-semibold tracking-tight">{campaign.name}</span>
        <span className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
          <PlatformIcon className="size-3.5 shrink-0" aria-hidden />
          {campaign.brand.name} · {PLATFORM_LABELS[campaign.platform]} · {formatRupeesCompact(campaign.remaining)} left
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-lg font-semibold text-brand tabular-nums">{formatRupees(topPayout)}</span>
        <span className="text-xs text-muted-foreground">max per post</span>
      </div>
    </div>
  );
}

export function CampaignFeed() {
  const { data } = useQuery(queries.featuredCampaigns);

  if (!data) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden mask-b-from-60%">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  const campaigns = data.items;
  if (campaigns.length === 0) return <div className="flex-1" />;

  const repeats = Math.ceil(MIN_ROWS / campaigns.length);
  const loop = Array.from({ length: repeats * 2 }, () => campaigns).flat();
  const duration = (loop.length / 2) * SECONDS_PER_ROW;

  return (
    <section
      aria-label="Campaigns running on Meme'd right now"
      className="group flex min-h-0 flex-1 flex-col overflow-hidden mask-y-from-75%"
    >
      <ul
        className="animate-[marquee-y_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((campaign, index) => (
          <li key={`${campaign._id}-${index}`} aria-hidden={index >= campaigns.length}>
            <FeedRow campaign={campaign} />
          </li>
        ))}
      </ul>
    </section>
  );
}
