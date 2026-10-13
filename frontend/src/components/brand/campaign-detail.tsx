"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, InboxIcon } from "lucide-react";
import Link from "next/link";

import { CampaignView } from "@/components/campaign/campaign-view";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { SubmissionsTable } from "@/components/submissions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useListState } from "@/hooks/use-list-state";
import { queries } from "@/lib/queries";

import { CampaignActions } from "./campaign-actions";

function CampaignSubmissionsSection({ campaignId }: { campaignId: string }) {
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

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

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
        href="/brand/campaigns"
        transitionTypes={TRANSITION_TYPES.back}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> All campaigns
      </Link>

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      {campaign ? (
        <CampaignView campaign={campaign} actions={<CampaignActions campaign={campaign} layout="buttons" />} />
      ) : (
        !error && <Skeleton className="h-96 w-full rounded-3xl" />
      )}

      <CampaignSubmissionsSection campaignId={campaignId} />
    </>
  );
}
