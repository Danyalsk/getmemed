"use client";

import { useQuery } from "@tanstack/react-query";
import { ClapperboardIcon, FlagIcon, TrendingUpIcon } from "lucide-react";

import { BarList } from "@/components/analytics/bar-list";
import { Panel } from "@/components/analytics/panel";
import { PlatformSplit } from "@/components/analytics/platform-split";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SubmissionsTable } from "@/components/submissions-table";
import { formatRupees, formatViews } from "@/lib/format";
import { queries } from "@/lib/queries";

export function CreatorAnalytics() {
  const { data, error, refetch } = useQuery(queries.creatorAnalytics);
  const totals = data?.totals;

  return (
    <>
      <PageHeader title="Analytics" description="How your posts perform across campaigns and platforms." />

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={totals && formatViews(totals.views)} icon={TrendingUpIcon} accent="text-wl-yellow" />
        <StatCard label="Posts" value={totals && String(totals.posts)} icon={ClapperboardIcon} accent="text-wl-lavender" />
        <StatCard
          label="Avg. views per post"
          value={totals && formatViews(totals.posts ? Math.round(totals.views / totals.posts) : 0)}
          icon={TrendingUpIcon}
          accent="text-wl-lime"
        />
        <StatCard label="Flagged posts" value={totals && String(totals.flagged)} icon={FlagIcon} accent="text-wl-red" />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Views by campaign" description="Where your posts are getting the most reach.">
          <BarList
            emptyMessage="Submit a post to see campaign performance."
            barClassName="bg-wl-yellow"
            items={(data?.byCampaign ?? []).map((row) => ({
              key: row.campaign._id,
              label: row.campaign.name,
              value: row.views,
              display: `${formatViews(row.views)} views`,
              detail: `${row.posts} ${row.posts === 1 ? "post" : "posts"} · ${formatRupees(row.earned)} earned`,
            }))}
          />
        </Panel>
        <Panel title="Platforms" description="Share of your views on each platform.">
          <PlatformSplit rows={data?.byPlatform ?? []} earnedLabel="earned" />
        </Panel>
      </div>

      <Panel title="Top posts" description="Your five most viewed posts.">
        <SubmissionsTable submissions={data?.topPosts} viewer="creator" readOnly />
      </Panel>
    </>
  );
}
