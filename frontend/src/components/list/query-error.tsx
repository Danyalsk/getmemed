import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QueryError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
      <TriangleAlertIcon className="size-4 text-destructive" />
      <span className="flex-1">{error.message}</span>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
