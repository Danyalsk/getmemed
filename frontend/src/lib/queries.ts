import { queryOptions } from "@tanstack/react-query";

import { api } from "./api";

/** Every query key lives here so mutations can invalidate by prefix. */
export const queryKeys = {
  campaigns: ["campaigns"] as const,
  submissions: ["submissions"] as const,
};

export const queries = {
  myCampaigns: queryOptions({
    queryKey: [...queryKeys.campaigns, "mine"],
    queryFn: api.myCampaigns,
  }),
  liveCampaigns: queryOptions({
    queryKey: [...queryKeys.campaigns, "live"],
    queryFn: api.liveCampaigns,
  }),
  campaignSubmissions: (campaignId: string) =>
    queryOptions({
      queryKey: [...queryKeys.campaigns, campaignId, "submissions"],
      queryFn: () => api.campaignSubmissions(campaignId),
    }),
  mySubmissions: queryOptions({
    queryKey: [...queryKeys.submissions, "mine"],
    queryFn: api.mySubmissions,
  }),
};
