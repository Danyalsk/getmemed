"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Campaign } from "@contracts/campaign";
import type { CampaignStatus } from "@contracts/common";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries";

const SUCCESS_MESSAGES: Record<CampaignStatus, (name: string) => string> = {
  active: (name) => `${name} resumed`,
  paused: (name) => `${name} paused`,
  closed: (name) => `${name} closed`,
};

export function useUpdateCampaignStatus(campaign: Pick<Campaign, "_id" | "name">) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: CampaignStatus) => api.setCampaignStatus(campaign._id, status),
    onSuccess: (updated) => {
      toast.success(SUCCESS_MESSAGES[updated.status](campaign.name));
      return queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
    onError: (error) => toast.error(error.message),
  });
}
