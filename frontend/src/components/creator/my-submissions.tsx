import type { Submission } from "@contracts/submission";

import { Earnings, SpikeFlag } from "@/components/submission-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatViews } from "@/lib/format";

import { SimulateViewsForm } from "./simulate-views-form";

export function MySubmissions({ submissions, onUpdated }: { submissions: Submission[]; onUpdated: () => void }) {
  if (submissions.length === 0) {
    return <p className="text-muted-foreground">You haven&apos;t submitted any posts yet. Pick a campaign above.</p>;
  }

  return (
    <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-brutal">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Post</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead>Earned</TableHead>
            <TableHead>Flag</TableHead>
            <TableHead>Simulate views</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-semibold">{submission.campaign.name}</TableCell>
              <TableCell>
                <a href={submission.postUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  View post
                </a>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatViews(submission.views)}</TableCell>
              <TableCell>
                <Earnings submission={submission} />
              </TableCell>
              <TableCell className="max-w-56 whitespace-normal">
                <SpikeFlag submission={submission} />
              </TableCell>
              <TableCell>
                <SimulateViewsForm
                  key={submission.views}
                  submission={submission}
                  onUpdated={onUpdated}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
