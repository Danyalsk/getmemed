import { model, Schema } from "mongoose";

import { campaignStatusSchema, platformSchema } from "../contracts/common";

const milestoneSchema = new Schema(
  {
    views: { type: Number, required: true, min: 1 },
    payout: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const campaignSchema = new Schema(
  {
    brand: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    platform: { type: String, enum: platformSchema.options, required: true },
    budget: { type: Number, required: true, min: 1 },
    spent: { type: Number, required: true, default: 0, min: 0 },
    milestones: { type: [milestoneSchema], required: true },
    coverImage: { type: Schema.Types.ObjectId, ref: "Image", default: null },
    submissionCount: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: campaignStatusSchema.options,
      required: true,
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    virtuals: {
      remaining: {
        get(this: { budget: number; spent: number }) {
          return this.budget - this.spent;
        },
      },
    },
  },
);

campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ brand: 1, createdAt: -1 });

export const CampaignModel = model("Campaign", campaignSchema);
