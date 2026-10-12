import { model, Schema, type InferSchemaType, type Types } from "mongoose";

import type { Platform } from "../contracts/common";

const submissionSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Canonical post URL; unique so one post can't be paid twice.
    postUrl: { type: String, required: true, unique: true },
    views: { type: Number, required: true, default: 0, min: 0 },
    entitledAmount: { type: Number, required: true, default: 0, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    flagged: { type: Boolean, required: true, default: false },
    flagReason: { type: String, default: null },
    viewsUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type SubmissionFields = InferSchemaType<typeof submissionSchema>;

/** A submission with campaign and creator populated for API responses. */
export type SubmissionWithRefs = Omit<SubmissionFields, "campaign" | "creator"> & {
  _id: Types.ObjectId;
  campaign: { _id: Types.ObjectId; name: string; platform: Platform };
  creator: { _id: Types.ObjectId; name: string };
};

export const SubmissionModel = model("Submission", submissionSchema);
