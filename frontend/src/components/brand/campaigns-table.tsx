"use client";

import Link from "next/link";

import type { Campaign } from "@contracts/campaign";

import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { TableSkeleton } from "@/components/list/table-skeleton";
import { PlatformLabel } from "@/components/platform-label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRupees } from "@/lib/format";

import { BudgetUsage } from "./budget-usage";
import { CampaignActions } from "./campaign-actions";

const COLUMNS = 6;

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] | undefined }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Top payout</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns === undefined ? (
            <TableSkeleton rows={5} columns={COLUMNS} />
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign._id}>
                <TableCell className="pl-4">
                  <Link href={`/brand/campaigns/${campaign._id}`} className="flex flex-col gap-0.5 hover:underline">
                    <span className="font-medium">{campaign.name}</span>
                    <PlatformLabel platform={campaign.platform} />
                  </Link>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge campaign={campaign} />
                </TableCell>
                <TableCell>
                  <BudgetUsage campaign={campaign} />
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatRupees(campaign.milestones.at(-1)?.payout ?? 0)}
                  <span className="block text-xs text-muted-foreground">
                    {campaign.milestones.length} milestone{campaign.milestones.length === 1 ? "" : "s"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(campaign.createdAt)}</TableCell>
                <TableCell className="pr-4 text-right">
                  <CampaignActions campaign={campaign} layout="menu" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
