"use client";

import { ExternalLinkIcon } from "lucide-react";

import type { Submission } from "@contracts/submission";

import { SimulateViewsForm } from "@/components/creator/simulate-views-form";
import { TableSkeleton } from "@/components/list/table-skeleton";
import { PlatformLabel } from "@/components/platform-label";
import { SubmissionEarnings, ViewSpikeFlag } from "@/components/submission-status";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatViews } from "@/lib/format";

type Viewer = "brand" | "creator";

interface SubmissionsTableProps {
  submissions: Submission[] | undefined;
  viewer: Viewer;
  readOnly?: boolean;
}

function SubmissionSubject({ submission, viewer }: { submission: Submission; viewer: Viewer }) {
  return viewer === "brand" ? (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">{submission.creator.name}</span>
      <span className="text-xs text-muted-foreground">{submission.campaign.name}</span>
    </div>
  ) : (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">{submission.campaign.name}</span>
      <PlatformLabel platform={submission.campaign.platform} />
    </div>
  );
}

function SubmissionPostLink({ submission }: { submission: Submission }) {
  return (
    <a
      href={submission.postUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm hover:underline"
    >
      Open post <ExternalLinkIcon className="size-3.5" />
    </a>
  );
}

function SubmissionCardList({ submissions, viewer, readOnly }: SubmissionsTableProps) {
  if (submissions === undefined) {
    return Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-36 rounded-xl" />);
  }
  return submissions.map((submission) => (
    <article key={submission._id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <SubmissionSubject submission={submission} viewer={viewer} />
        <div className="text-right">
          <SubmissionEarnings submission={submission} />
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Views</dt>
          <dd className="tabular-nums">{formatViews(submission.views)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Submitted</dt>
          <dd>{formatDate(submission.createdAt)}</dd>
        </div>
      </dl>
      {submission.flagged && <ViewSpikeFlag submission={submission} />}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <SubmissionPostLink submission={submission} />
        {viewer === "creator" && !readOnly && <SimulateViewsForm key={submission.views} submission={submission} />}
      </div>
    </article>
  ));
}

export function SubmissionsTable({ submissions, viewer, readOnly = false }: SubmissionsTableProps) {
  const canSimulate = viewer === "creator" && !readOnly;
  const columns = canSimulate ? 7 : 6;
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        <SubmissionCardList submissions={submissions} viewer={viewer} readOnly={readOnly} />
      </div>
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">{viewer === "brand" ? "Creator" : "Campaign"}</TableHead>
              <TableHead>Post</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Earned</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Submitted</TableHead>
              {canSimulate && <TableHead className="pr-4">Simulate views</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions === undefined ? (
              <TableSkeleton rows={5} columns={columns} />
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission._id}>
                  <TableCell className="pl-4">
                    <SubmissionSubject submission={submission} viewer={viewer} />
                  </TableCell>
                  <TableCell>
                    <SubmissionPostLink submission={submission} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatViews(submission.views)}</TableCell>
                  <TableCell>
                    <SubmissionEarnings submission={submission} />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <ViewSpikeFlag submission={submission} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(submission.createdAt)}</TableCell>
                  {canSimulate && (
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
    </>
  );
}
