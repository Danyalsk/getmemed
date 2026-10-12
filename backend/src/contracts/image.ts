import { z } from "zod";

import { objectIdSchema } from "./common";

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const uploadedImageSchema = z.object({ _id: objectIdSchema });
export type UploadedImage = z.infer<typeof uploadedImageSchema>;
