"use client";

import { useQuery } from "@tanstack/react-query";
import { HourglassIcon, IndianRupeeIcon, MegaphoneIcon, ReceiptIndianRupeeIcon } from "lucide-react";

import { BarList } from "@/components/analytics/bar-list";
import { Panel } from "@/components/analytics/panel";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

export function CreatorEarnings() {
  const { data, error, refetch } = useQuery(queries.creatorAnalytics);
  const totals = data?.totals;
  const uncapped = totals ? totals.entitled - totals.earned : undefined;

  return (
    <>
      <PageHeader
        title="Earnings"
        description="Every post earns the highest milestone its views reach, paid until the campaign budget runs out."
      />

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      <section aria-label="Earnings overview" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total earned" value={totals && formatRupees(totals.earned)} icon={IndianRupeeIcon} />
        <StatCard
          label="Avg. per post"
          value={totals && formatRupees(totals.posts ? Math.round(totals.earned / totals.posts) : 0)}
          icon={ReceiptIndianRupeeIcon}
        />
        <StatCard label="Paying campaigns" value={data && String(data.byCampaign.filter((row) => row.earned > 0).length)} icon={MegaphoneIcon} />
        <StatCard label="Lost to budget caps" value={uncapped === undefined ? undefined : formatRupees(uncapped)} icon={HourglassIcon} />
      </section>

      <Panel title="Earnings by campaign" description="What each campaign has paid you so far.">
        <BarList
          emptyMessage="Your earnings will appear here once a post crosses its first milestone."
          items={(data?.byCampaign ?? [])
            .filter((row) => row.earned > 0)
            .map((row) => ({
              key: row.campaign._id,
              label: row.campaign.name,
              value: row.earned,
              display: formatRupees(row.earned),
              detail: `${row.posts} ${row.posts === 1 ? "post" : "posts"}`,
            }))}
        />
      </Panel>
    </>
  );
}
