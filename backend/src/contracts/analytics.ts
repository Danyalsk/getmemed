import { z } from "zod";

import { participationSchema } from "./campaign";
import { objectIdSchema, platformSchema, rupeesSchema } from "./common";
import { submissionSchema } from "./submission";

const campaignRefSchema = z.object({ _id: objectIdSchema, name: z.string(), platform: platformSchema });
const creatorRefSchema = z.object({ _id: objectIdSchema, name: z.string() });

const campaignBreakdownSchema = participationSchema.extend({ campaign: campaignRefSchema });
const platformBreakdownSchema = participationSchema.extend({ platform: platformSchema });
const creatorBreakdownSchema = participationSchema.extend({ creator: creatorRefSchema });

export const creatorAnalyticsSchema = z.object({
  totals: participationSchema.extend({
    entitled: rupeesSchema,
    campaigns: z.number().int().nonnegative(),
    flagged: z.number().int().nonnegative(),
  }),
  byCampaign: z.array(campaignBreakdownSchema),
  byPlatform: z.array(platformBreakdownSchema),
  topPosts: z.array(submissionSchema),
});
export type CreatorAnalytics = z.infer<typeof creatorAnalyticsSchema>;

export const brandAnalyticsSchema = z.object({
  totals: participationSchema.extend({
    campaigns: z.number().int().nonnegative(),
    activeCampaigns: z.number().int().nonnegative(),
    budget: rupeesSchema,
    creators: z.number().int().nonnegative(),
    flagged: z.number().int().nonnegative(),
  }),
  byCampaign: z.array(campaignBreakdownSchema),
  byPlatform: z.array(platformBreakdownSchema),
  topCreators: z.array(creatorBreakdownSchema),
});
export type BrandAnalytics = z.infer<typeof brandAnalyticsSchema>;
