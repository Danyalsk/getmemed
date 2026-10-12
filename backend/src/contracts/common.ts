import { z } from "zod";

export const roleSchema = z.enum(["brand", "creator"]);
export type Role = z.infer<typeof roleSchema>;

export const platformSchema = z.enum(["instagram", "youtube"]);
export type Platform = z.infer<typeof platformSchema>;

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
};

/** active ⇄ paused, and either can be closed. Closed is final. */
export const campaignStatusSchema = z.enum(["active", "paused", "closed"]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  closed: "Closed",
};

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

/** Route params for `/:id` endpoints. */
export const idParamsSchema = z.object({ id: objectIdSchema });

/** Whole rupees. Paise are out of scope, so money is always an integer. */
export const rupeesSchema = z.number().int().nonnegative();

export const isoDateSchema = z.iso.datetime();

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** Query-string pagination + free-text search shared by every list endpoint. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
});
export type ListQuery = z.output<typeof listQuerySchema>;

export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
}

export const errorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
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
