"use client";

import type { Campaign } from "@contracts/campaign";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatRupees } from "@/lib/format";

interface CloseCampaignDialogProps {
  campaign: Pick<Campaign, "name" | "remaining">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CloseCampaignDialog({ campaign, open, onOpenChange, onConfirm }: CloseCampaignDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close {campaign.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Creators can no longer submit posts and no further payouts are made. The remaining{" "}
            {formatRupees(campaign.remaining)} stays unspent. Closing is permanent. Pause instead if you
            might resume later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Close campaign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
