import { z } from "zod";

import {
  campaignStatusSchema,
  isoDateSchema,
  objectIdSchema,
  platformSchema,
  rupeesSchema,
} from "./common";

export const MAX_MILESTONES = 10;

const wholeNumber = (field: string) =>
  z
    .number({ error: `${field} must be a number` })
    .int(`${field} must be a whole number`)
    .positive(`${field} must be above 0`);

export const milestoneSchema = z.object({
  views: wholeNumber("Views"),
  payout: wholeNumber("Payout"),
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
  platform: platformSchema,
  budget: wholeNumber("Budget"),
  milestones: milestoneLadderSchema,
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
  id: objectIdSchema,
  brand: z.object({ id: objectIdSchema, name: z.string() }),
  status: campaignStatusSchema,
  spent: rupeesSchema,
  remaining: rupeesSchema,
  createdAt: isoDateSchema,
});
export type Campaign = z.infer<typeof campaignSchema>;

export const campaignListSchema = z.array(campaignSchema);
