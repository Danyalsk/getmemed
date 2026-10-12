import request from "supertest";

import { createApp } from "../../src/app";
import { authResponseSchema } from "../../src/contracts/auth";
import { campaignSchema, type CreateCampaignInput } from "../../src/contracts/campaign";
import type { Role } from "../../src/contracts/common";
import { uploadedImageSchema } from "../../src/contracts/image";
import { submissionSchema } from "../../src/contracts/submission";

export const app = createApp();

export const LADDER: CreateCampaignInput["milestones"] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
];

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

export async function signup(role: Role, name = `${role} user`): Promise<string> {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ name, email: `${role}-${crypto.randomUUID()}@test.dev`, password: "password123", role });
  return authResponseSchema.parse(res.body).token;
}

export async function uploadCover(brandToken: string): Promise<string> {
  const res = await request(app)
    .post("/api/images")
    .auth(brandToken, { type: "bearer" })
    .set("Content-Type", "image/png")
    .send(PNG);
  return uploadedImageSchema.parse(res.body)._id;
}

export async function createCampaign(
  budget: number,
  overrides: Partial<CreateCampaignInput> = {},
  existingBrandToken?: string,
): Promise<{ campaignId: string; brandToken: string }> {
  const brandToken = existingBrandToken ?? (await signup("brand"));
  const input: CreateCampaignInput = {
    name: "Launch",
    description: "Post a reel about the launch and tag the brand.",
    platform: "instagram",
    budget,
    milestones: LADDER,
    coverImage: await uploadCover(brandToken),
    ...overrides,
  };
  const res = await request(app).post("/api/campaigns").auth(brandToken, { type: "bearer" }).send(input);
  return { campaignId: campaignSchema.parse(res.body)._id, brandToken };
}

export async function submitPosts(campaignId: string, count: number, creatorToken?: string): Promise<string[]> {
  const token = creatorToken ?? (await signup("creator"));
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const res = await request(app)
      .post(`/api/campaigns/${campaignId}/submissions`)
      .auth(token, { type: "bearer" })
      .send({ postUrl: `https://www.instagram.com/p/post-${i}-${crypto.randomUUID().slice(0, 6)}/` });
    ids.push(submissionSchema.parse(res.body)._id);
  }
  return ids;
}

export function patchViews(submissionId: string, views: number) {
  return request(app).patch(`/api/submissions/${submissionId}/views`).send({ views });
}
