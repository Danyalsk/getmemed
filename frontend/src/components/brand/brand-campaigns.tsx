"use client";

import { useQuery } from "@tanstack/react-query";
import { ChartPieIcon, MegaphoneIcon, PiggyBankIcon, WalletIcon } from "lucide-react";
import { useState } from "react";

import { CAMPAIGN_STATUS_LABELS, campaignStatusSchema, type CampaignStatus } from "@contracts/common";

import { CampaignCardSkeleton } from "@/components/campaign-card";
import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListState } from "@/hooks/use-list-state";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

import { BrandCampaignCard } from "./brand-campaign-card";
import { CreateCampaignDialog } from "./create-campaign-dialog";

const ALL_STATUSES = "all";

export function BrandCampaigns() {
  const list = useListState();
  const [status, setStatus] = useState<CampaignStatus>();
  const { data, error, refetch, isPlaceholderData } = useQuery(queries.myCampaigns({ ...list.query, status }));
  const summary = data?.summary;
  const filtered = Boolean(list.query.search ?? status);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Launch campaigns, track spend against budget and review creator posts."
        actions={<CreateCampaignDialog />}
      />

      <section aria-label="Budget overview" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Campaigns" value={summary && String(summary.campaigns)} icon={MegaphoneIcon} accent="text-wl-lavender" />
        <StatCard label="Total budget" value={summary && formatRupees(summary.budget)} icon={WalletIcon} accent="text-wl-yellow" />
        <StatCard label="Paid out" value={summary && formatRupees(summary.spent)} icon={ChartPieIcon} accent="text-wl-red" />
        <StatCard label="Remaining" value={summary && formatRupees(summary.remaining)} icon={PiggyBankIcon} accent="text-wl-lime" />
      </section>

      <section aria-label="Campaign list" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search campaigns" />
          <Select
            value={status ?? ALL_STATUSES}
            onValueChange={(value) => {
              const parsed = campaignStatusSchema.safeParse(value);
              setStatus(parsed.success ? parsed.data : undefined);
              list.resetPage();
            }}
          >
            <SelectTrigger aria-label="Filter by status" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {campaignStatusSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {CAMPAIGN_STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

        {data?.total === 0 ? (
          <EmptyState
            icon={MegaphoneIcon}
            title={filtered ? "No matching campaigns" : "No campaigns yet"}
            description={
              filtered
                ? "Try a different search term or status filter."
                : "Create your first campaign to start paying creators for the reach they drive."
            }
            action={filtered ? undefined : <CreateCampaignDialog />}
          />
        ) : (
          <div
            className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
          >
            {data
              ? data.items.map((campaign) => <BrandCampaignCard key={campaign._id} campaign={campaign} morphCover />)
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
    </>
  );
}
