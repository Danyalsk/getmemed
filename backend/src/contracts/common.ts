import { z } from "zod";

export const roleSchema = z.enum(["brand", "creator"]);
export type Role = z.infer<typeof roleSchema>;

export const platformSchema = z.enum(["instagram", "youtube"]);
export type Platform = z.infer<typeof platformSchema>;

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
};

export const campaignStatusSchema = z.enum(["active", "closed"]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

/** Route params for `/:id` endpoints. */
export const idParamsSchema = z.object({ id: objectIdSchema });

/** Whole rupees. Paise are out of scope, so money is always an integer. */
export const rupeesSchema = z.number().int().nonnegative();

export const isoDateSchema = z.iso.datetime();

export const errorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
]);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
