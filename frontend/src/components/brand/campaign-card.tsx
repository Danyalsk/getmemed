"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { MilestoneLadder } from "@/components/milestone-ladder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { queryKeys } from "@/lib/queries";

import { CampaignSubmissions } from "./campaign-submissions";

function CampaignStatus({ campaign }: { campaign: Campaign }) {
  if (campaign.status === "closed") return <Badge variant="secondary">Closed</Badge>;
  if (campaign.remaining === 0) return <Badge variant="destructive">Budget used up</Badge>;
  return <Badge variant="green">Live</Badge>;
}

function CloseCampaignButton({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  const close = useMutation({
    mutationFn: () => api.closeCampaign(campaign._id),
    onSuccess: () => {
      toast.success(`"${campaign.name}" closed`);
      return queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Close campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close “{campaign.name}”?</DialogTitle>
          <DialogDescription>
            Creators can no longer submit posts and no further payouts are made. The remaining{" "}
            {formatRupees(campaign.remaining)} stays unspent. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep it running</Button>
          </DialogClose>
          <Button variant="destructive" disabled={close.isPending} onClick={() => close.mutate()}>
            {close.isPending ? "Closing…" : "Close campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [showSubmissions, setShowSubmissions] = useState(false);
  const spentPercent = Math.round((campaign.spent / campaign.budget) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline">{PLATFORM_LABELS[campaign.platform]}</Badge>
          <CampaignStatus campaign={campaign} />
        </CardDescription>
        {campaign.status === "active" && (
          <CardAction>
            <CloseCampaignButton campaign={campaign} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span>
              <strong className="tabular-nums">{formatRupees(campaign.spent)}</strong> spent
            </span>
            <span>
              <strong className="tabular-nums">{formatRupees(campaign.remaining)}</strong> remaining of{" "}
              {formatRupees(campaign.budget)}
            </span>
          </div>
          <Progress value={spentPercent} aria-label={`${spentPercent}% of budget spent`} />
        </div>
        <MilestoneLadder milestones={campaign.milestones} />
        {showSubmissions && <CampaignSubmissions campaignId={campaign._id} />}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => setShowSubmissions((shown) => !shown)}>
          {showSubmissions ? "Hide submissions" : "View submissions"}
        </Button>
      </CardFooter>
    </Card>
  );
}
