"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRightIcon, CompassIcon } from "lucide-react";
import Link from "next/link";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SharedCampaignCover, TRANSITION_TYPES } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { budgetBarClass, formatRupees, formatRupeesCompact, formatTimeLeft } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";
import type { DiscoverFilterState } from "./discover-filters";

function CampaignListRow({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const firstPayout = campaign.milestones[0]?.payout ?? 0;
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;
  const leftPercent = Math.round((campaign.remaining / campaign.budget) * 100);

  return (
    <Link
      href={campaignHref(campaign._id)}
      transitionTypes={TRANSITION_TYPES.forward}
      onClick={() => queryClient.setQueryData(queries.campaign(campaign._id).queryKey, campaign)}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-3 transition-colors hover:bg-card sm:grid-cols-[auto_minmax(0,1fr)_9rem_11rem_auto]"
    >
      <span className="relative aspect-video w-28 overflow-hidden rounded-xl bg-muted sm:w-36">
        <SharedCampaignCover id={campaign._id}>
          <span className="absolute inset-0">
            <CampaignCover campaign={campaign} sizes="144px" />
          </span>
        </SharedCampaignCover>
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-semibold group-hover:underline">{campaign.name}</span>
        <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <PlatformIcon aria-label={PLATFORM_LABELS[campaign.platform]} className="size-3.5 shrink-0" />
          {campaign.brand.name} · {formatTimeLeft(campaign.endsAt)}
        </span>
        <span className="text-xs text-muted-foreground sm:hidden">
          <span className="text-success">{formatRupees(topPayout)}</span> max · {formatRupeesCompact(campaign.remaining)}{" "}
          left
        </span>
      </span>
      <span className="hidden flex-col gap-0.5 sm:flex">
        <span className="text-sm font-medium tabular-nums">
          {formatRupees(firstPayout)} → <span className="text-success">{formatRupees(topPayout)}</span>
        </span>
        <span className="text-xs text-muted-foreground">per post</span>
      </span>
      <span className="hidden flex-col gap-1.5 sm:flex">
        <span className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatRupeesCompact(campaign.remaining)} left</span>
          <span>{leftPercent}%</span>
        </span>
        <span className="h-1.5 overflow-hidden rounded-full bg-muted">
          <span className={`block h-full rounded-full ${budgetBarClass(100 - leftPercent)}`} style={{ width: `${leftPercent}%` }} />
        </span>
      </span>
      <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function AllCampaignsSection({ list, platform, sort }: Pick<DiscoverFilterState, "list" | "platform" | "sort">) {
  const { data, error, refetch, isPlaceholderData } = useQuery(
    queries.liveCampaigns({ ...list.query, platform, sort }),
  );
  const filtered = Boolean(list.query.search ?? platform);

  return (
    <section aria-labelledby="all-campaigns-heading" className="flex flex-col gap-4">
      <h2 id="all-campaigns-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
        {filtered ? "Results" : "All campaigns"}{" "}
        {data && <span className="text-muted-foreground tabular-nums">({data.total})</span>}
      </h2>

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      {data?.total === 0 ? (
        <EmptyState
          icon={CompassIcon}
          title={filtered ? "No matching campaigns" : "No live campaigns right now"}
          description={
            filtered ? "Try a different search term or platform." : "New campaigns show up here as soon as brands launch them."
          }
        />
      ) : (
        <ul
          className={`flex flex-col divide-y overflow-hidden rounded-2xl border bg-card/40 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          {data
            ? data.items.map((campaign) => (
                <li key={campaign._id}>
                  <CampaignListRow campaign={campaign} />
                </li>
              ))
            : Array.from({ length: 6 }, (_, index) => (
                <li key={index} className="p-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                </li>
              ))}
        </ul>
      )}

      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        />
      )}
    </section>
  );
}
