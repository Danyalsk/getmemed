import { model, Schema } from "mongoose";

import { IMAGE_CONTENT_TYPES } from "../contracts/image";

// Covers are small (compressed in the browser), so they live in Mongo
// rather than a separate object store.
const imageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, enum: IMAGE_CONTENT_TYPES, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false },
);

export const ImageModel = model("Image", imageSchema);
