import { keepPreviousData, queryOptions, type QueryClient } from "@tanstack/react-query";

import type { BrandCampaignsQuery, LiveCampaignsQuery } from "@contracts/campaign";
import type { ListQuery } from "@contracts/common";
import type { BrandSubmissionsQuery } from "@contracts/submission";

import { api } from "./api";

const queryKeys = {
  campaigns: ["campaigns"] as const,
  submissions: ["submissions"] as const,
  analytics: ["analytics"] as const,
};

type QueryRoot = keyof typeof queryKeys;

export function invalidateQueryRoots(queryClient: QueryClient, ...roots: QueryRoot[]): Promise<void[]> {
  return Promise.all(roots.map((root) => queryClient.invalidateQueries({ queryKey: queryKeys[root] })));
}

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
  campaignLeaderboard: (id: string) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, id, "leaderboard"],
      queryFn: () => api.campaignLeaderboard(id),
    }),
  campaignPerformance: (id: string) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, id, "performance"],
      queryFn: () => api.campaignPerformance(id),
    }),
  featuredCampaigns: queryOptions({
    queryKey: [...queryKeys.campaigns, "featured"],
    queryFn: api.featuredCampaigns,
  }),
  liveCampaigns: (query: LiveCampaignsQuery) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, "live", query],
      queryFn: () => api.liveCampaigns(query),
      placeholderData: keepPreviousData,
    }),
  joinedCampaigns: (query: ListQuery) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, "joined", query],
      queryFn: () => api.joinedCampaigns(query),
      placeholderData: keepPreviousData,
    }),
  campaignSubmissions: (campaignId: string, query: ListQuery) =>
    queryOptions({
      queryKey: [...queryKeys.submissions, "campaign", campaignId, query],
      queryFn: () => api.campaignSubmissions(campaignId, query),
      placeholderData: keepPreviousData,
    }),
  brandSubmissions: (query: BrandSubmissionsQuery) =>
    queryOptions({
      queryKey: [...queryKeys.submissions, "brand", query],
      queryFn: () => api.brandSubmissions(query),
      placeholderData: keepPreviousData,
    }),
  mySubmissions: (query: ListQuery) =>
    queryOptions({
      queryKey: [...queryKeys.submissions, "mine", query],
      queryFn: () => api.mySubmissions(query),
      placeholderData: keepPreviousData,
    }),
  creatorAnalytics: queryOptions({
    queryKey: [...queryKeys.analytics, "creator"],
    queryFn: api.creatorAnalytics,
  }),
  brandAnalytics: queryOptions({
    queryKey: [...queryKeys.analytics, "brand"],
    queryFn: api.brandAnalytics,
  }),
};
