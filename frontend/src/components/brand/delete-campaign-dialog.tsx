"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { api } from "@/lib/api";
import { invalidateQueryRoots } from "@/lib/queries";

interface DeleteCampaignDialogProps {
  campaign: Pick<Campaign, "_id" | "name">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}

export function DeleteCampaignDialog({ campaign, open, onOpenChange, redirectTo }: DeleteCampaignDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const remove = useMutation({
    mutationFn: () => api.deleteCampaign(campaign._id),
    onSuccess: () => {
      toast.success(`${campaign.name} deleted`);
      if (redirectTo) router.replace(redirectTo);
      return invalidateQueryRoots(queryClient, "campaigns", "analytics");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {campaign.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            The campaign is removed for good and creators will no longer see it. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>
            Delete campaign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
