import { model, Schema, type HydratedDocument, type InferSchemaType, type Types } from "mongoose";

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
    brand: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    platform: { type: String, enum: platformSchema.options, required: true },
    budget: { type: Number, required: true, min: 1 },
    spent: { type: Number, required: true, default: 0, min: 0 },
    milestones: { type: [milestoneSchema], required: true },
    status: {
      type: String,
      enum: campaignStatusSchema.options,
      required: true,
      default: "active",
    },
  },
  { timestamps: true },
);

campaignSchema.index({ status: 1, createdAt: -1 });

export type CampaignFields = InferSchemaType<typeof campaignSchema>;
export type CampaignDocument = HydratedDocument<CampaignFields>;

/** A campaign with its brand populated to `{ _id, name }`. */
export type CampaignWithBrand = Omit<CampaignFields, "brand"> & {
  _id: Types.ObjectId;
  brand: { _id: Types.ObjectId; name: string };
};

export const CampaignModel = model("Campaign", campaignSchema);
