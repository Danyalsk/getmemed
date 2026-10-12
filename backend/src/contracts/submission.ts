import { z } from "zod";

import {
  isoDateSchema,
  objectIdSchema,
  PLATFORM_LABELS,
  platformSchema,
  rupeesSchema,
  type Platform,
} from "./common";

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]);
const INSTAGRAM_POST_KINDS = new Set(["p", "reel", "reels", "tv"]);
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const YOUTUBE_ID = /^[\w-]{11}$/;
const INSTAGRAM_CODE = /^[\w-]+$/;

function parseUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function youtubeVideoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const [first, second] = url.pathname.split("/").filter(Boolean);
  if (host === "youtu.be") return first ?? null;
  if (!YOUTUBE_HOSTS.has(host)) return null;
  if (first === "watch") return url.searchParams.get("v");
  if (first === "shorts") return second ?? null;
  return null;
}

/**
 * Reduces every accepted form of a post link to one canonical URL, so the same
 * post can't be submitted twice via `?igsh=`, `youtu.be`, `/shorts/` variants.
 * Returns null when the link isn't a post on the given platform.
 */
export function canonicalPostUrl(raw: string, platform: Platform): string | null {
  const url = parseUrl(raw.trim());
  if (!url) return null;

  switch (platform) {
    case "instagram": {
      const [kind, code] = url.pathname.split("/").filter(Boolean);
      const isPost =
        INSTAGRAM_HOSTS.has(url.hostname.toLowerCase()) &&
        kind !== undefined &&
        INSTAGRAM_POST_KINDS.has(kind) &&
        code !== undefined &&
        INSTAGRAM_CODE.test(code);
      // /p/, /reel/ and /tv/ share one shortcode space, so they all collapse to /p/
      return isPost ? `https://www.instagram.com/p/${code}/` : null;
    }
    case "youtube": {
      const id = youtubeVideoId(url);
      return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
    }
  }
}

/** Validates a post link against the campaign's platform and outputs its canonical form. */
export function postSubmissionSchema(platform: Platform) {
  return z.object({
    postUrl: z
      .string()
      .trim()
      .max(500)
      .transform((raw, ctx) => {
        const canonical = canonicalPostUrl(raw, platform);
        if (!canonical) {
          ctx.addIssue({
            code: "custom",
            message: `Enter a valid ${PLATFORM_LABELS[platform]} post link`,
          });
          return z.NEVER;
        }
        return canonical;
      }),
  });
}
export type PostSubmissionInput = z.input<ReturnType<typeof postSubmissionSchema>>;

export const updateViewsSchema = z.object({
  views: z
    .number({ error: "Views must be a number" })
    .int("Views must be a whole number")
    .nonnegative("Views can't be negative")
    .max(Number.MAX_SAFE_INTEGER),
});
export type UpdateViewsInput = z.infer<typeof updateViewsSchema>;

export const submissionSchema = z.object({
  id: objectIdSchema,
  campaign: z.object({ id: objectIdSchema, name: z.string(), platform: platformSchema }),
  creator: z.object({ id: objectIdSchema, name: z.string() }),
  postUrl: z.string(),
  views: z.number().int().nonnegative(),
  /** What the highest crossed milestone is worth. */
  entitledAmount: rupeesSchema,
  /** What was actually paid; lower than entitled when the budget ran out. */
  paidAmount: rupeesSchema,
  flagged: z.boolean(),
  flagReason: z.string().nullable(),
  viewsUpdatedAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
});
export type Submission = z.infer<typeof submissionSchema>;

export const submissionListSchema = z.array(submissionSchema);

export const creatorSubmissionsSchema = z.object({
  submissions: submissionListSchema,
  totalEarnings: rupeesSchema,
});
export type CreatorSubmissions = z.infer<typeof creatorSubmissionsSchema>;

export const updateViewsResponseSchema = z.object({
  submission: submissionSchema,
  paidNow: rupeesSchema,
});
export type UpdateViewsResponse = z.infer<typeof updateViewsResponseSchema>;
