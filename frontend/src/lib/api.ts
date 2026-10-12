import type { z } from "zod";

import { authResponseSchema, type LoginInput, type SignupInput } from "@contracts/auth";
import {
  brandCampaignsSchema,
  campaignPageSchema,
  campaignSchema,
  type BrandCampaignsQuery,
  type CreateCampaignInput,
  type LiveCampaignsQuery,
} from "@contracts/campaign";
import {
  apiErrorSchema,
  type CampaignStatus,
  type ErrorCode,
  type ListQuery,
} from "@contracts/common";
import { uploadedImageSchema } from "@contracts/image";
import {
  creatorSubmissionsSchema,
  submissionPageSchema,
  submissionSchema,
  updateViewsResponseSchema,
  type PostSubmissionInput,
  type UpdateViewsInput,
} from "@contracts/submission";

import { clearSession, getToken } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type Method = "GET" | "POST" | "PATCH";

/** Appends defined, non-empty params as a query string. */
function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  method: Method = "GET",
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  const isFile = body instanceof Blob;
  if (body !== undefined) headers.set("Content-Type", isFile ? body.type : "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? null : isFile ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(0, "INTERNAL_ERROR", "Can't reach the server. Please try again.");
  }

  const json: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) clearSession();
    const parsed = apiErrorSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiRequestError(response.status, "INTERNAL_ERROR", "Something went wrong");
    }
    const { code, message, fields } = parsed.data.error;
    // Field errors are rare since forms validate with the same schemas; surface the first one.
    const detail = fields ? Object.values(fields)[0] : undefined;
    throw new ApiRequestError(response.status, code, detail ?? message);
  }

  return schema.parse(json);
}

/** Public URL of an uploaded image. */
export const imageUrl = (imageId: string): string => `${API_URL}/api/images/${imageId}`;

export const api = {
  uploadImage: (file: Blob) => request("/api/images", uploadedImageSchema, "POST", file),
  signup: (input: SignupInput) => request("/api/auth/signup", authResponseSchema, "POST", input),
  login: (input: LoginInput) => request("/api/auth/login", authResponseSchema, "POST", input),

  createCampaign: (input: CreateCampaignInput) =>
    request("/api/campaigns", campaignSchema, "POST", input),
  myCampaigns: (query: BrandCampaignsQuery) =>
    request(withQuery("/api/campaigns/mine", query), brandCampaignsSchema),
  campaign: (id: string) => request(`/api/campaigns/${id}`, campaignSchema),
  liveCampaigns: (query: LiveCampaignsQuery) =>
    request(withQuery("/api/campaigns/live", query), campaignPageSchema),
  setCampaignStatus: (id: string, status: CampaignStatus) =>
    request(`/api/campaigns/${id}/status`, campaignSchema, "PATCH", { status }),
  campaignSubmissions: (id: string, query: ListQuery) =>
    request(withQuery(`/api/campaigns/${id}/submissions`, query), submissionPageSchema),

  submitPost: (campaignId: string, input: PostSubmissionInput) =>
    request(`/api/campaigns/${campaignId}/submissions`, submissionSchema, "POST", input),
  mySubmissions: (query: ListQuery) =>
    request(withQuery("/api/submissions/mine", query), creatorSubmissionsSchema),
  updateViews: (submissionId: string, input: UpdateViewsInput) =>
    request(`/api/submissions/${submissionId}/views`, updateViewsResponseSchema, "PATCH", input),
};
