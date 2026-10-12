"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, InboxIcon } from "lucide-react";
import Link from "next/link";

import { CampaignCover } from "@/components/campaign-cover";
import { SharedCover, TRANSITION } from "@/components/page-transition";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryError } from "@/components/list/query-error";
import { SearchInput } from "@/components/list/search-input";
import { MilestoneLadder } from "@/components/milestone-ladder";
import { PlatformLabel } from "@/components/platform-label";
import { SubmissionsTable } from "@/components/submissions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useListState } from "@/hooks/use-list-state";
import { formatDate, formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

import { BudgetUsage } from "./budget-usage";
import { CampaignActions } from "./campaign-actions";

function CampaignSubmissions({ campaignId }: { campaignId: string }) {
  const list = useListState();
  const { data, error, refetch, isPlaceholderData } = useQuery(queries.campaignSubmissions(campaignId, list.query));

  return (
    <section aria-labelledby="submissions-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="submissions-heading" className="text-lg font-semibold">
          Submissions {data && <span className="text-muted-foreground tabular-nums">({data.total})</span>}
        </h2>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search by creator or link" />
      </div>

      {error && <QueryError error={error} onRetry={() => void refetch()} />}

      {data?.total === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={list.query.search ? "No matching submissions" : "No submissions yet"}
          description={
            list.query.search
              ? "Try searching by a different creator name or post link."
              : "Posts appear here as soon as creators submit them to this campaign."
          }
        />
      ) : (
        <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <SubmissionsTable submissions={data?.items} viewer="brand" />
        </div>
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

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const { data: campaign, error, refetch } = useQuery(queries.campaign(campaignId));

  return (
    <>
      <Link
        href="/brand"
        transitionTypes={TRANSITION.back}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> All campaigns
      </Link>

      {error && <QueryError error={error} onRetry={() => void refetch()} />}

      {campaign ? (
        <section className="group flex flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="relative aspect-video md:aspect-[3/1]">
            <SharedCover id={campaign._id}>
              <div className="absolute inset-0">
                <CampaignCover campaign={campaign} sizes="(min-width: 1152px) 1152px, 100vw" priority />
              </div>
            </SharedCover>
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-card via-card/30 to-transparent" />
          </div>
          <div className="-mt-12 flex flex-col gap-6 p-6 pt-0">
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
                  <CampaignStatusBadge campaign={campaign} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <PlatformLabel platform={campaign.platform} />
                  <span>Created {formatDate(campaign.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <CampaignActions campaign={campaign} layout="buttons" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">
                  Budget · <span className="text-foreground tabular-nums">{formatRupees(campaign.budget)}</span>
                </span>
                <BudgetUsage campaign={campaign} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Payout milestones</span>
                <MilestoneLadder milestones={campaign.milestones} />
              </div>
            </div>
          </div>
        </section>
      ) : (
        !error && <Skeleton className="h-96 w-full rounded-2xl" />
      )}

      <CampaignSubmissions campaignId={campaignId} />
    </>
  );
}
