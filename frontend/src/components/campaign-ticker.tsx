"use client";

import { useQuery } from "@tanstack/react-query";

import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

const SECONDS_PER_ITEM = 5;

export function CampaignTicker() {
  const { data } = useQuery(queries.featuredCampaigns);
  const campaigns = data?.items ?? [];
  if (data && campaigns.length === 0) return null;

  const loop = [...campaigns, ...campaigns];

  return (
    <section aria-label="Live campaigns" className="flex h-11 items-stretch border-t bg-[#0e0e0e] text-sm">
      <span className="flex shrink-0 items-center gap-2 bg-brand px-4 font-pixel text-xs text-ink">
        <span className="size-1.5 animate-pulse bg-ink" /> Live
      </span>
      <div className="flex min-w-0 flex-1 overflow-hidden mask-x-from-90%">
        <ul
          className="flex shrink-0 animate-[marquee_linear_infinite] items-center hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: `${campaigns.length * SECONDS_PER_ITEM}s` }}
        >
          {loop.map((campaign, index) => (
            <li
              key={`${campaign._id}-${index}`}
              aria-hidden={index >= campaigns.length}
              className="flex items-center gap-3 px-6 whitespace-nowrap"
            >
              <span aria-hidden className="size-1.5 bg-brand" />
              <span>{campaign.name}</span>
              <span className="text-muted-foreground">{campaign.brand.name}</span>
              <span className="font-medium text-brand tabular-nums">
                up to {formatRupees(campaign.milestones.at(-1)?.payout ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
