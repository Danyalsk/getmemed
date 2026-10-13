import { z } from "zod";

import {
  campaignStatusSchema,
  isoDateSchema,
  listQuerySchema,
  objectIdSchema,
  pageSchema,
  platformSchema,
  rupeesSchema,
} from "./common";

export const MAX_MILESTONES = 10;
export const MAX_CAMPAIGN_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

// Campaigns run until the end of the chosen day, India time.
export function campaignEndsAt(date: string): Date {
  return new Date(`${date}T23:59:59.999+05:30`);
}

const positiveIntegerField = (field: string) =>
  z
    .number({ error: `${field} must be a number` })
    .int(`${field} must be a whole number`)
    .positive(`${field} must be above 0`);

export const milestoneSchema = z.object({
  views: positiveIntegerField("Views"),
  payout: positiveIntegerField("Payout"),
});
export type Milestone = z.infer<typeof milestoneSchema>;

const milestoneLadderSchema = z
  .array(milestoneSchema)
  .min(1, "Add at least one milestone")
  .max(MAX_MILESTONES, `At most ${MAX_MILESTONES} milestones`)
  .superRefine((ladder, ctx) => {
    ladder.forEach((rung, index) => {
      const previous = ladder[index - 1];
      if (!previous) return;
      if (rung.views <= previous.views) {
        ctx.addIssue({
          code: "custom",
          path: [index, "views"],
          message: "Views must increase with each milestone",
        });
      }
      if (rung.payout <= previous.payout) {
        ctx.addIssue({
          code: "custom",
          path: [index, "payout"],
          message: "Payout must increase with each milestone",
        });
      }
    });
  });

const campaignFieldsSchema = z.object({
  name: z.string().trim().min(3, "Name is too short").max(100),
  description: z.string().trim().min(20, "Describe the campaign in at least 20 characters").max(2000),
  platform: platformSchema,
  budget: positiveIntegerField("Budget"),
  milestones: milestoneLadderSchema,
  coverImage: z.string({ error: "Add a cover photo" }).pipe(objectIdSchema),
  endsAt: z.iso.date("Pick an end date"),
});

export const createCampaignSchema = campaignFieldsSchema.superRefine((campaign, ctx) => {
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;
  if (topPayout > campaign.budget) {
    ctx.addIssue({
      code: "custom",
      path: ["budget"],
      message: "Budget must cover at least the top milestone payout",
    });
  }
  const runsFor = campaignEndsAt(campaign.endsAt).getTime() - Date.now();
  if (runsFor <= 0 || runsFor > MAX_CAMPAIGN_DAYS * DAY_MS) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: `Pick a date between today and ${MAX_CAMPAIGN_DAYS} days from now`,
    });
  }
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const campaignSchema = campaignFieldsSchema.extend({
  _id: objectIdSchema,
  description: z.string().default(""),
  coverImage: objectIdSchema.nullable().default(null),
  submissionCount: z.number().int().nonnegative().default(0),
  brand: z.object({ _id: objectIdSchema, name: z.string() }),
  status: campaignStatusSchema,
  spent: rupeesSchema,
  remaining: rupeesSchema,
  endsAt: isoDateSchema,
  createdAt: isoDateSchema,
});
export type Campaign = z.infer<typeof campaignSchema>;

export const brandCampaignsQuerySchema = listQuerySchema.extend({
  status: campaignStatusSchema.optional(),
});
export type BrandCampaignsQuery = z.output<typeof brandCampaignsQuerySchema>;

export const campaignSortSchema = z.enum(["newest", "trending", "budget"]);
export type CampaignSort = z.infer<typeof campaignSortSchema>;

export const liveCampaignsQuerySchema = listQuerySchema.extend({
  platform: platformSchema.optional(),
  sort: campaignSortSchema.default("newest"),
});
export type LiveCampaignsQuery = z.output<typeof liveCampaignsQuerySchema>;

export const campaignPageSchema = pageSchema(campaignSchema);

const budgetSummarySchema = z.object({
  campaigns: z.number().int().nonnegative(),
  budget: rupeesSchema,
  spent: rupeesSchema,
  remaining: rupeesSchema,
});

export const brandCampaignsSchema = campaignPageSchema.extend({ summary: budgetSummarySchema });
export type BrandCampaigns = z.infer<typeof brandCampaignsSchema>;

export const participationSchema = z.object({
  posts: z.number().int().nonnegative(),
  views: z.number().int().nonnegative(),
  earned: rupeesSchema,
});
export type Participation = z.infer<typeof participationSchema>;

const joinedCampaignSchema = campaignSchema.extend({ participation: participationSchema });
export const joinedCampaignPageSchema = pageSchema(joinedCampaignSchema);

const leaderboardEntrySchema = participationSchema.extend({
  creator: z.object({ _id: objectIdSchema, name: z.string() }),
});
export const leaderboardSchema = z.array(leaderboardEntrySchema);

export const updateCampaignStatusSchema = z.object({ status: campaignStatusSchema });
