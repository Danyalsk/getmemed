import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { BrandCampaignsQuery, LiveCampaignsQuery } from "@contracts/campaign";
import type { ListQuery } from "@contracts/common";

import { api } from "./api";

export const queryKeys = {
  campaigns: ["campaigns"] as const,
  submissions: ["submissions"] as const,
};

export const queries = {
  myCampaigns: (query: BrandCampaignsQuery) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, "mine", query],
      queryFn: () => api.myCampaigns(query),
      placeholderData: keepPreviousData,
    }),
  campaign: (id: string) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, id],
      queryFn: () => api.campaign(id),
    }),
  liveCampaigns: (query: LiveCampaignsQuery) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, "live", query],
      queryFn: () => api.liveCampaigns(query),
      placeholderData: keepPreviousData,
    }),
  campaignSubmissions: (campaignId: string, query: ListQuery) =>
    queryOptions({
      queryKey: [...queryKeys.submissions, "campaign", campaignId, query],
      queryFn: () => api.campaignSubmissions(campaignId, query),
      placeholderData: keepPreviousData,
    }),
  mySubmissions: (query: ListQuery) =>
    queryOptions({
      queryKey: [...queryKeys.submissions, "mine", query],
      queryFn: () => api.mySubmissions(query),
      placeholderData: keepPreviousData,
    }),
};
