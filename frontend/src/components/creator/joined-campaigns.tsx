"use client";

import { useQuery } from "@tanstack/react-query";
import { MegaphoneIcon } from "lucide-react";
import Link from "next/link";

import { CampaignCardSkeleton } from "@/components/campaign-card";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useListState } from "@/hooks/use-list-state";
import { queries } from "@/lib/queries";

import { CreatorCampaignCard } from "./creator-campaign-card";
import { ParticipationSummary } from "./participation-summary";

export function JoinedCampaigns() {
  const list = useListState();
  const { data, error, refetch, isPlaceholderData } = useQuery(queries.joinedCampaigns(list.query));

  return (
    <>
      <PageHeader title="My campaigns" description="Campaigns you've posted to, with your posts, views and earnings in each." />
      <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search your campaigns" />

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      {data?.total === 0 ? (
        <EmptyState
          icon={MegaphoneIcon}
          title={list.query.search ? "No matching campaigns" : "You haven't joined a campaign yet"}
          description={
            list.query.search
              ? "Try a different campaign name."
              : "Find a campaign you like, post on the platform and submit your link to start earning."
          }
          action={
            list.query.search ? undefined : (
              <Button asChild>
                <Link href="/creator/discover">Discover campaigns</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          {data
            ? data.items.map((campaign) => (
                <CreatorCampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  morphCover
                  footer={<ParticipationSummary participation={campaign.participation} />}
                />
              ))
            : Array.from({ length: 3 }, (_, index) => <CampaignCardSkeleton key={index} />)}
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
    </>
  );
}
