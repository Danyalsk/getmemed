"use client";

import { ExternalLinkIcon } from "lucide-react";

import type { Submission } from "@contracts/submission";

import { SimulateViewsForm } from "@/components/creator/simulate-views-form";
import { TableSkeleton } from "@/components/list/table-skeleton";
import { PlatformLabel } from "@/components/platform-label";
import { Earnings, SpikeFlag } from "@/components/submission-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatViews } from "@/lib/format";

interface SubmissionsTableProps {
  submissions: Submission[] | undefined;
  /** Brands see who posted; creators see which campaign and can simulate views. */
  viewer: "brand" | "creator";
}

export function SubmissionsTable({ submissions, viewer }: SubmissionsTableProps) {
  const columns = viewer === "creator" ? 7 : 6;
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{viewer === "brand" ? "Creator" : "Campaign"}</TableHead>
            <TableHead>Post</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead>Earned</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>Submitted</TableHead>
            {viewer === "creator" && <TableHead className="pr-4">Simulate views</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions === undefined ? (
            <TableSkeleton rows={5} columns={columns} />
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell className="pl-4">
                  {viewer === "brand" ? (
                    <span className="font-medium">{submission.creator.name}</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{submission.campaign.name}</span>
                      <PlatformLabel platform={submission.campaign.platform} />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <a
                    href={submission.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm hover:underline"
                  >
                    Open <ExternalLinkIcon className="size-3.5" />
                  </a>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatViews(submission.views)}</TableCell>
                <TableCell>
                  <Earnings submission={submission} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <SpikeFlag submission={submission} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(submission.createdAt)}</TableCell>
                {viewer === "creator" && (
                  <TableCell className="pr-4">
                    <SimulateViewsForm key={submission.views} submission={submission} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
