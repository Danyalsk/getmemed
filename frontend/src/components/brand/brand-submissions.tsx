"use client";

import { useQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { PageHeader } from "@/components/page-header";
import { SubmissionsTable } from "@/components/submissions-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListState } from "@/hooks/use-list-state";
import { queries } from "@/lib/queries";

const ALL_CAMPAIGNS = "all";
const CAMPAIGN_OPTIONS_LIMIT = 50;

export function BrandSubmissions() {
  const list = useListState();
  const [campaign, setCampaign] = useState<string>();
  const campaigns = useQuery(queries.myCampaigns({ page: 1, pageSize: CAMPAIGN_OPTIONS_LIMIT }));
  const { data, error, refetch, isPlaceholderData } = useQuery(queries.brandSubmissions({ ...list.query, campaign }));
  const filtered = Boolean(list.query.search ?? campaign);

  return (
    <>
      <PageHeader title="Submissions" description="Every post creators have submitted across your campaigns." />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search by creator, campaign or link" />
        <Select
          value={campaign ?? ALL_CAMPAIGNS}
          onValueChange={(value) => {
            setCampaign(value === ALL_CAMPAIGNS ? undefined : value);
            list.resetPage();
          }}
        >
          <SelectTrigger aria-label="Filter by campaign" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CAMPAIGNS}>All campaigns</SelectItem>
            {campaigns.data?.items.map((option) => (
              <SelectItem key={option._id} value={option._id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

      {data?.total === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={filtered ? "No matching submissions" : "No submissions yet"}
          description={
            filtered
              ? "Try a different search term or campaign."
              : "Posts appear here as soon as creators submit them to any of your campaigns."
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
    </>
  );
}
