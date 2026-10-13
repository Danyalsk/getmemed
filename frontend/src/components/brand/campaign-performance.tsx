"use client";

import { useQuery } from "@tanstack/react-query";
import { ChartPieIcon, FlagIcon, TrendingUpIcon, UsersRoundIcon } from "lucide-react";

import type { Campaign } from "@contracts/campaign";

import { StatCard } from "@/components/stat-card";
import { formatRupees, formatViews } from "@/lib/format";
import { queries } from "@/lib/queries";

export function CampaignPerformance({ campaign }: { campaign: Pick<Campaign, "_id" | "budget"> }) {
  const { data } = useQuery(queries.campaignPerformance(campaign._id));
  const costPerThousand = data?.views ? Math.round((data.earned / data.views) * 1000) : 0;

  return (
    <section aria-labelledby="performance-heading" className="flex flex-col gap-3">
      <h2 id="performance-heading" className="text-lg font-semibold">
        Performance
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard accent="text-brand" label="Views" value={data && formatViews(data.views)} icon={TrendingUpIcon} />
        <StatCard
          accent="text-pop-cyan"
          label="Paid out"
          value={data && `${formatRupees(data.earned)} of ${formatRupees(campaign.budget)}`}
          icon={ChartPieIcon}
        />
        <StatCard
          accent="text-pop-violet"
          label="Cost per 1K views"
          value={data && formatRupees(costPerThousand)}
          icon={ChartPieIcon}
        />
        <StatCard
          accent="text-pop-orange"
          label="Creators · flagged"
          value={data && `${data.creators} · ${data.flagged}`}
          icon={data?.flagged ? FlagIcon : UsersRoundIcon}
        />
      </div>
    </section>
  );
}
