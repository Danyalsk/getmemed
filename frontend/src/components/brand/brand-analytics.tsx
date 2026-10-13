"use client";

import { useQuery } from "@tanstack/react-query";
import { ChartPieIcon, FlagIcon, TrendingUpIcon, UsersRoundIcon } from "lucide-react";

import { BarList } from "@/components/analytics/bar-list";
import { Panel } from "@/components/analytics/panel";
import { PlatformSplit } from "@/components/analytics/platform-split";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatRupees, formatViews, getInitials } from "@/lib/format";
import { queries } from "@/lib/queries";

export function BrandAnalytics() {
  const { data, error, refetch } = useQuery(queries.brandAnalytics);
  const totals = data?.totals;
  const costPerThousand = totals && totals.views ? Math.round((totals.earned / totals.views) * 1000) : 0;

  return (
    <>
      <PageHeader title="Analytics" description="Reach, spend and top creators across all your campaigns." />

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={totals && formatViews(totals.views)} icon={TrendingUpIcon} accent="text-wl-yellow" />
        <StatCard
          label="Paid out"
          value={totals && `${formatRupees(totals.earned)} of ${formatRupees(totals.budget)}`}
          icon={ChartPieIcon}
          accent="text-wl-red"
        />
        <StatCard label="Cost per 1K views" value={totals && formatRupees(costPerThousand)} icon={ChartPieIcon} accent="text-wl-lime" />
        <StatCard
          label="Creators · flagged posts"
          value={totals && `${totals.creators} · ${totals.flagged}`}
          icon={totals?.flagged ? FlagIcon : UsersRoundIcon}
          accent="text-wl-lavender"
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Spend by campaign" description="What each campaign has paid creators.">
          <BarList
            emptyMessage="Spend appears here once posts cross their first milestone."
            barClassName="bg-wl-red"
            items={(data?.byCampaign ?? []).map((row) => ({
              key: row.campaign._id,
              label: row.campaign.name,
              value: row.earned,
              display: formatRupees(row.earned),
              detail: `${row.posts} ${row.posts === 1 ? "post" : "posts"} · ${formatViews(row.views)} views`,
            }))}
          />
        </Panel>
        <Panel title="Platforms" description="Share of views by platform.">
          <PlatformSplit rows={data?.byPlatform ?? []} earnedLabel="paid" />
        </Panel>
      </div>

      <Panel title="Top creators" description="Creators who have earned the most from your campaigns.">
        <BarList
          emptyMessage="No creator has earned from your campaigns yet."
          barClassName="bg-wl-lavender"
          items={(data?.topCreators ?? []).map((row) => ({
            key: row.creator._id,
            label: (
              <span className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-wl-lavender text-[10px] font-semibold text-wl-ink">
                  {getInitials(row.creator.name)}
                </span>
                {row.creator.name}
              </span>
            ),
            value: row.earned,
            display: formatRupees(row.earned),
            detail: `${row.posts} ${row.posts === 1 ? "post" : "posts"} · ${formatViews(row.views)} views`,
          }))}
        />
      </Panel>
    </>
  );
}
