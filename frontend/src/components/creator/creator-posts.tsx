"use client";

import { useQuery } from "@tanstack/react-query";
import { FileVideoIcon, IndianRupeeIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/list/empty-state";
import { PaginationBar } from "@/components/list/pagination-bar";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SearchInput } from "@/components/list/search-input";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SubmissionsTable } from "@/components/submissions-table";
import { Button } from "@/components/ui/button";
import { useListState } from "@/hooks/use-list-state";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

export function CreatorPosts() {
  const list = useListState();
  const { data, error, refetch, isPlaceholderData } = useQuery(queries.mySubmissions(list.query));

  return (
    <>
      <PageHeader title="My posts" description="Track views and earnings for every post you've submitted." />

      <section aria-label="Earnings overview" className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total earned"
          value={data && formatRupees(data.totalEarnings)}
          icon={IndianRupeeIcon}
          accent="text-wl-lime"
        />
        <StatCard
          label={list.query.search ? "Matching posts" : "Posts submitted"}
          value={data && String(data.total)}
          icon={FileVideoIcon}
          accent="text-wl-lavender"
        />
      </section>

      <section aria-label="Post list" className="flex flex-col gap-4">
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search by campaign or link" />

        {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}

        {data?.total === 0 ? (
          <EmptyState
            icon={FileVideoIcon}
            title={list.query.search ? "No matching posts" : "No posts yet"}
            description={
              list.query.search
                ? "Try a different campaign name or link."
                : "Submit a post to a live campaign and its earnings will show up here."
            }
            action={
              list.query.search ? undefined : (
                <Button asChild>
                  <Link href="/creator">Discover campaigns</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <SubmissionsTable submissions={data?.items} viewer="creator" />
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
