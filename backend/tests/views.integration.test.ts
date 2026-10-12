import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { createApp } from "../src/app";
import { authResponseSchema } from "../src/contracts/auth";
import { campaignSchema, type CreateCampaignInput } from "../src/contracts/campaign";
import { submissionSchema, updateViewsResponseSchema } from "../src/contracts/submission";
import { CampaignModel } from "../src/models/campaign.model";
import { SubmissionModel } from "../src/models/submission.model";

jest.setTimeout(60_000);

const app = createApp();
let replSet: MongoMemoryReplSet;

const ladder: CreateCampaignInput["milestones"] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
];

async function signup(role: "brand" | "creator"): Promise<string> {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ name: `${role} user`, email: `${role}-${crypto.randomUUID()}@test.dev`, password: "password123", role });
  return authResponseSchema.parse(res.body).token;
}

async function createCampaign(budget: number): Promise<string> {
  const token = await signup("brand");
  const input: CreateCampaignInput = { name: "Launch", platform: "instagram", budget, milestones: ladder };
  const res = await request(app).post("/api/campaigns").auth(token, { type: "bearer" }).send(input);
  return campaignSchema.parse(res.body)._id;
}

async function submitPosts(campaignId: string, count: number): Promise<string[]> {
  const token = await signup("creator");
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const res = await request(app)
      .post(`/api/campaigns/${campaignId}/submissions`)
      .auth(token, { type: "bearer" })
      .send({ postUrl: `https://www.instagram.com/p/post${i}${crypto.randomUUID().slice(0, 6)}/` });
    ids.push(submissionSchema.parse(res.body)._id);
  }
  return ids;
}

function patchViews(submissionId: string, views: number) {
  return request(app).patch(`/api/submissions/${submissionId}/views`).send({ views });
}

async function totals(campaignId: string): Promise<{ spent: number; paid: number }> {
  const campaign = await CampaignModel.findById(campaignId).lean();
  const submissions = await SubmissionModel.find({ campaign: campaignId }).lean();
  return {
    spent: campaign?.spent ?? Number.NaN,
    paid: submissions.reduce((sum, s) => sum + s.paidAmount, 0),
  };
}

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  await mongoose.connect(replSet.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

describe("PATCH /api/submissions/:id/views", () => {
  it("never overspends when many posts are paid at the same time", async () => {
    const budget = 5_000;
    const campaignId = await createCampaign(budget);
    const submissionIds = await submitPosts(campaignId, 20);

    // 20 posts each owed ₹2,000 against a ₹5,000 budget.
    const responses = await Promise.all(submissionIds.map((id) => patchViews(id, 60_000)));

    expect(responses.every((res) => res.status === 200)).toBe(true);
    const paidNow = responses.map((res) => updateViewsResponseSchema.parse(res.body).paidNow);
    expect(paidNow.reduce((sum, amount) => sum + amount, 0)).toBe(budget);
    await expect(totals(campaignId)).resolves.toEqual({ spent: budget, paid: budget });
  });

  it("pays a milestone only once under concurrent duplicate updates", async () => {
    const campaignId = await createCampaign(10_000);
    const [submissionId = ""] = await submitPosts(campaignId, 1);

    await Promise.all(Array.from({ length: 10 }, () => patchViews(submissionId, 12_000)));
    await patchViews(submissionId, 12_000);

    await expect(totals(campaignId)).resolves.toEqual({ spent: 500, paid: 500 });
  });

  it("pays only the difference when climbing the ladder and ignores lower counts", async () => {
    const campaignId = await createCampaign(10_000);
    const [submissionId = ""] = await submitPosts(campaignId, 1);

    const climb = [12_000, 60_000, 30_000];
    const results = [];
    for (const views of climb) {
      results.push(updateViewsResponseSchema.parse((await patchViews(submissionId, views)).body));
    }

    expect(results.map((r) => r.paidNow)).toEqual([500, 1_500, 0]);
    expect(results.at(-1)?.submission.views).toBe(60_000);
    await expect(totals(campaignId)).resolves.toEqual({ spent: 2_000, paid: 2_000 });
  });

  it("pays the remainder when the budget runs out mid-payout", async () => {
    const campaignId = await createCampaign(2_300);
    const [first = "", second = ""] = await submitPosts(campaignId, 2);

    await patchViews(first, 60_000);
    const res = updateViewsResponseSchema.parse((await patchViews(second, 60_000)).body);

    expect(res.paidNow).toBe(300);
    expect(res.submission.entitledAmount).toBe(2_000);
    expect(res.submission.paidAmount).toBe(300);
    await expect(totals(campaignId)).resolves.toEqual({ spent: 2_300, paid: 2_300 });
  });

  it("stops paying once the brand closes the campaign", async () => {
    const campaignId = await createCampaign(10_000);
    const [submissionId = ""] = await submitPosts(campaignId, 1);
    await CampaignModel.updateOne({ _id: campaignId }, { status: "closed" });

    const res = updateViewsResponseSchema.parse((await patchViews(submissionId, 60_000)).body);

    expect(res.paidNow).toBe(0);
    expect(res.submission.views).toBe(60_000);
  });

  it("rejects invalid input", async () => {
    expect((await patchViews("not-an-id", 10)).status).toBe(400);
    expect((await patchViews(new mongoose.Types.ObjectId().toString(), 10)).status).toBe(404);
  });
});
