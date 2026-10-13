"use client";

import { useQuery } from "@tanstack/react-query";
import { CompassIcon } from "lucide-react";
import { useState } from "react";

import { campaignSortSchema, type CampaignSort } from "@contracts/campaign";
import { PLATFORM_LABELS, platformSchema, type Platform } from "@contracts/common";

import { CampaignCardSkeleton } from "@/components/campaign-card";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListState } from "@/hooks/use-list-state";
import { queries } from "@/lib/queries";

import { CreatorCampaignCard } from "../creator-campaign-card";

const ALL_PLATFORMS = "all";

const SORT_LABELS: Record<CampaignSort, string> = {
  newest: "Newest",
  trending: "Most posts",
  budget: "Biggest budget",
};

export function AllCampaignsSection() {
  const list = useListState();
  const [platform, setPlatform] = useState<Platform>();
  const [sort, setSort] = useState<CampaignSort>("newest");
  const { data, error, refetch, isPlaceholderData } = useQuery(
    queries.liveCampaigns({ ...list.query, platform, sort }),
  );
  const filtered = Boolean(list.query.search ?? platform);

  return (
    <section aria-labelledby="all-campaigns-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="all-campaigns-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
          All campaigns {data && <span className="text-muted-foreground tabular-nums">({data.total})</span>}
        </h2>
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search campaigns" />
          <Select
            value={platform ?? ALL_PLATFORMS}
            onValueChange={(value) => {
              const parsed = platformSchema.safeParse(value);
              setPlatform(parsed.success ? parsed.data : undefined);
              list.resetPage();
            }}
          >
            <SelectTrigger aria-label="Filter by platform" className="flex-1 sm:w-36 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PLATFORMS}>All platforms</SelectItem>
              {platformSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {PLATFORM_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(campaignSortSchema.parse(value));
              list.resetPage();
            }}
          >
            <SelectTrigger aria-label="Sort campaigns" className="flex-1 sm:w-40 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {campaignSortSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
        <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          {data
            ? data.items.map((campaign) => <CreatorCampaignCard key={campaign._id} campaign={campaign} morphCover />)
            : Array.from({ length: 6 }, (_, index) => <CampaignCardSkeleton key={index} />)}
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
