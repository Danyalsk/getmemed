"use client";

import { useQuery } from "@tanstack/react-query";

import { Panel } from "@/components/analytics/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees, formatViews, getInitials } from "@/lib/format";
import { queries } from "@/lib/queries";

export function CampaignLeaderboard({ campaignId }: { campaignId: string }) {
  const { data } = useQuery(queries.campaignLeaderboard(campaignId));

  return (
    <Panel title="Top creators" description="Ranked by earnings on this campaign">
      {!data ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : data.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No payouts yet.</p>
      ) : (
        <ol className="flex flex-col divide-y">
          {data.map((entry, index) => (
            <li key={entry.creator._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-6 font-pixel text-sm text-muted-foreground">{index + 1}</span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                {getInitials(entry.creator.name)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{entry.creator.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {entry.posts} {entry.posts === 1 ? "post" : "posts"} · {formatViews(entry.views)} views
                </span>
              </div>
              <span className="text-sm font-semibold text-brand tabular-nums">{formatRupees(entry.earned)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
