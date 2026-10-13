"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, HourglassIcon } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/analytics/panel";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees, formatRupeesCompact, formatViews } from "@/lib/format";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const RUNNING_OUT_COUNT = 5;

function EarningsSnapshot() {
  const { data } = useQuery(queries.creatorAnalytics);
  const totals = data?.totals;

  return (
    <Panel
      title="Your earnings"
      action={
        <Link href="/creator/earnings" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          Details <ArrowRightIcon className="size-3" />
        </Link>
      }
    >
      {totals ? (
        <div className="flex flex-col gap-4">
          <span className="text-3xl font-semibold tracking-tight text-brand tabular-nums">{formatRupees(totals.earned)}</span>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Views", value: formatViews(totals.views) },
              { label: "Posts", value: String(totals.posts) },
              { label: "Campaigns", value: String(totals.campaigns) },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5 rounded-xl bg-muted/60 py-2">
                <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
                <dd className="text-sm font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <Skeleton className="h-24 w-full rounded-xl" />
      )}
    </Panel>
  );
}

function RunningOutSoon() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: 50, sort: "budget" }));
  const runningOut = [...(data?.items ?? [])]
    .sort((a, b) => a.remaining / a.budget - b.remaining / b.budget)
    .slice(0, RUNNING_OUT_COUNT);

  return (
    <Panel title="Running out soon" description="Least budget left. Post before it's gone.">
      {!data ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <ol className="flex flex-col gap-3">
          {runningOut.map((campaign) => {
            const leftPercent = Math.max(1, Math.round((campaign.remaining / campaign.budget) * 100));
            return (
              <li key={campaign._id}>
                <Link
                  href={campaignHref(campaign._id)}
                  transitionTypes={TRANSITION_TYPES.forward}
                  className="group flex flex-col gap-1.5"
                >
                  <span className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium group-hover:underline">{campaign.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-pop-orange tabular-nums">
                      <HourglassIcon className="size-3" /> {leftPercent}%
                    </span>
                  </span>
                  <span className="h-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-pop-orange" style={{ width: `${leftPercent}%` }} />
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatRupeesCompact(campaign.remaining)} of {formatRupeesCompact(campaign.budget)} left
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

export function DiscoverRail() {
  return (
    <aside className="flex flex-col gap-5 xl:sticky xl:top-8 xl:self-start">
      <EarningsSnapshot />
      <RunningOutSoon />
    </aside>
  );
}
