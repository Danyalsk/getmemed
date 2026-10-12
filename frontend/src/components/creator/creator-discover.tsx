"use client";

import { useQuery } from "@tanstack/react-query";
import { CompassIcon } from "lucide-react";
import { useState } from "react";

import { PLATFORM_LABELS, platformSchema, type Platform } from "@contracts/common";

import { CampaignCard, CampaignCardSkeleton, CARD_LINK_CLASS } from "@/components/campaign-card";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { PageHeader } from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListState } from "@/hooks/use-list-state";
import { queries } from "@/lib/queries";

import { SubmitPostDialog } from "./submit-post-dialog";

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
        <div
          className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          {data
            ? data.items.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  title={
                    <SubmitPostDialog
                      campaign={campaign}
                      trigger={<button type="button" className={CARD_LINK_CLASS}>{campaign.name}</button>}
                    />
                  }
                />
              ))
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
    </>
  );
}
