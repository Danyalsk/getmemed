import { model, Schema } from "mongoose";

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
  { timestamps: true, versionKey: false },
);

export const SubmissionModel = model("Submission", submissionSchema);
