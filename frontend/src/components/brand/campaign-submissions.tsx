"use client";

import { useCallback } from "react";

import { Earnings, SpikeFlag } from "@/components/submission-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatViews } from "@/lib/format";
import { useApiData } from "@/lib/use-api-data";

export function CampaignSubmissions({ campaignId }: { campaignId: string }) {
  const load = useCallback(() => api.campaignSubmissions(campaignId), [campaignId]);
  const { data: submissions, error } = useApiData(load);

  if (error) return <p className="text-sm font-semibold text-red-700">{error}</p>;
  if (!submissions) return <p className="text-sm">Loading submissions…</p>;
  if (submissions.length === 0) return <p className="text-sm text-muted-foreground">No posts submitted yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Post</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Flag</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell className="font-semibold">{submission.creator.name}</TableCell>
            <TableCell>
              <a href={submission.postUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                View post
              </a>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatViews(submission.views)}</TableCell>
            <TableCell>
              <Earnings submission={submission} />
            </TableCell>
            <TableCell className="whitespace-normal">
              <SpikeFlag submission={submission} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
