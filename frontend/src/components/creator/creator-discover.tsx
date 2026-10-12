"use client";

import { useQuery } from "@tanstack/react-query";
import { CompassIcon } from "lucide-react";
import { useState } from "react";

import { PLATFORM_LABELS, platformSchema, type Platform } from "@contracts/common";

import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryError } from "@/components/list/query-error";
import { SearchInput } from "@/components/list/search-input";
import { PageHeader } from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListState } from "@/hooks/use-list-state";
import { queries } from "@/lib/queries";

import { LiveCampaignCard } from "./live-campaign-card";

const ALL_PLATFORMS = "all";

export function CreatorDiscover() {
  const list = useListState();
  const [platform, setPlatform] = useState<Platform>();
  const { data, error, refetch, isPlaceholderData } = useQuery(queries.liveCampaigns({ ...list.query, platform }));
  const filtered = Boolean(list.query.search ?? platform);

  return (
    <>
      <PageHeader
        title="Discover campaigns"
        description="Pick a live campaign, post on the platform, then submit your link to start earning."
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search campaigns" />
        <Select
          value={platform ?? ALL_PLATFORMS}
          onValueChange={(value) => {
            const parsed = platformSchema.safeParse(value);
            setPlatform(parsed.success ? parsed.data : undefined);
            list.resetPage();
          }}
        >
          <SelectTrigger aria-label="Filter by platform" className="w-40">
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
      </div>

      {error && <QueryError error={error} onRetry={() => void refetch()} />}

      {data?.total === 0 ? (
        <EmptyState
          icon={CompassIcon}
          title={filtered ? "No matching campaigns" : "No live campaigns right now"}
          description={
            filtered ? "Try a different search term or platform." : "New campaigns show up here as soon as brands launch them."
          }
        />
      ) : (
        <div
          className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${isPlaceholderData ? "opacity-60" : ""} transition-opacity`}
        >
          {data
            ? data.items.map((campaign) => <LiveCampaignCard key={campaign._id} campaign={campaign} />)
            : Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-64 rounded-xl" />)}
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
