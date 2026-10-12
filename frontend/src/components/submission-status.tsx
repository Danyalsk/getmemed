import { TriangleAlertIcon } from "lucide-react";

import type { Submission } from "@contracts/submission";

import { Badge } from "@/components/ui/badge";
import { formatRupees } from "@/lib/format";

/** Paid amount, noting when the campaign budget ran out before the full milestone. */
export function Earnings({ submission }: { submission: Submission }) {
  const capped = submission.paidAmount < submission.entitledAmount;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium tabular-nums">{formatRupees(submission.paidAmount)}</span>
      {capped && (
        <span className="text-xs text-wl-yellow">
          Capped · earned {formatRupees(submission.entitledAmount)}
        </span>
      )}
    </div>
  );
}

export function SpikeFlag({ submission }: { submission: Submission }) {
  if (!submission.flagged) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex max-w-56 flex-col gap-1">
      <Badge variant="destructive">
        <TriangleAlertIcon /> View spike
      </Badge>
      {submission.flagReason && <span className="text-xs text-muted-foreground">{submission.flagReason}</span>}
    </div>
  );
}
