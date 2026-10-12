import type { Submission } from "@contracts/submission";

import { Badge } from "@/components/ui/badge";
import { formatRupees } from "@/lib/format";

/** Paid amount, noting when the campaign budget ran out before the full milestone. */
export function Earnings({ submission }: { submission: Submission }) {
  const capped = submission.paidAmount < submission.entitledAmount;
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-bold tabular-nums">{formatRupees(submission.paidAmount)}</span>
      {capped && (
        <span className="text-xs text-muted-foreground">
          of {formatRupees(submission.entitledAmount)}, capped by budget
        </span>
      )}
    </div>
  );
}

export function SpikeFlag({ submission }: { submission: Submission }) {
  if (!submission.flagged) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant="destructive">View spike</Badge>
      {submission.flagReason && <span className="text-xs text-muted-foreground">{submission.flagReason}</span>}
    </div>
  );
}
