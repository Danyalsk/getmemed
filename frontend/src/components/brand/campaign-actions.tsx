"use client";

import { CirclePauseIcon, CirclePlayIcon, CircleXIcon, EllipsisIcon, EyeIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { Campaign } from "@contracts/campaign";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TRANSITION_TYPES } from "@/components/page-transition";

import { CloseCampaignDialog } from "./close-campaign-dialog";
import { DeleteCampaignDialog } from "./delete-campaign-dialog";
import { useUpdateCampaignStatus } from "./use-update-campaign-status";

interface CampaignActionsProps {
  campaign: Campaign;
  layout: "menu" | "buttons";
}

export function CampaignActions({ campaign, layout }: CampaignActionsProps) {
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = useUpdateCampaignStatus(campaign);
  const canDelete = campaign.submissionCount === 0;
  const canClose = campaign.status !== "closed" && !canDelete;
  const toggle =
    campaign.status === "active"
      ? { next: "paused" as const, label: "Pause", icon: CirclePauseIcon }
      : campaign.status === "paused"
        ? { next: "active" as const, label: "Resume", icon: CirclePlayIcon }
        : null;

  const dialog = (
    <>
      <CloseCampaignDialog
        campaign={campaign}
        open={confirmClose}
        onOpenChange={setConfirmClose}
        onConfirm={() => status.mutate("closed")}
      />
      <DeleteCampaignDialog
        campaign={campaign}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        redirectTo={layout === "buttons" ? "/brand/campaigns" : undefined}
      />
    </>
  );

  if (layout === "buttons") {
    return (
      <>
        {toggle && (
          <Button variant="outline" disabled={status.isPending} onClick={() => status.mutate(toggle.next)}>
            <toggle.icon /> {toggle.label}
          </Button>
        )}
        {canClose && (
          <Button variant="destructive" disabled={status.isPending} onClick={() => setConfirmClose(true)}>
            <CircleXIcon /> Close
          </Button>
        )}
        {canDelete && (
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2Icon /> Delete
          </Button>
        )}
        {dialog}
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${campaign.name}`}>
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem asChild>
            <Link href={`/brand/campaigns/${campaign._id}`} transitionTypes={TRANSITION_TYPES.forward}>
              <EyeIcon /> View details
            </Link>
          </DropdownMenuItem>
          {toggle && (
            <DropdownMenuItem disabled={status.isPending} onSelect={() => status.mutate(toggle.next)}>
              <toggle.icon /> {toggle.label}
            </DropdownMenuItem>
          )}
          {canClose && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmClose(true)}>
                <CircleXIcon /> Close campaign
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={!canDelete} onSelect={() => setConfirmDelete(true)}>
            <Trash2Icon />
            {canDelete ? "Delete campaign" : "Can't delete, has posts"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  );
}

