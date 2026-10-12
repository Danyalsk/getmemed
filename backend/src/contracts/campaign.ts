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

export const milestoneLadderSchema = z
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

export const budgetSummarySchema = z.object({
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

export const joinedCampaignSchema = campaignSchema.extend({ participation: participationSchema });
export type JoinedCampaign = z.infer<typeof joinedCampaignSchema>;
export const joinedCampaignPageSchema = pageSchema(joinedCampaignSchema);

export const leaderboardEntrySchema = participationSchema.extend({
  creator: z.object({ _id: objectIdSchema, name: z.string() }),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export const leaderboardSchema = z.array(leaderboardEntrySchema);

export const updateCampaignStatusSchema = z.object({ status: campaignStatusSchema });
export type UpdateCampaignStatusInput = z.infer<typeof updateCampaignStatusSchema>;
