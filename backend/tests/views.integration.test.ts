import mongoose from "mongoose";
import request from "supertest";

import { campaignSchema } from "../src/contracts/campaign";
import { submissionPageSchema, updateViewsResponseSchema } from "../src/contracts/submission";
import { CampaignModel } from "../src/models/campaign.model";
import { SubmissionModel } from "../src/models/submission.model";
import { app, createCampaign, patchViews, signup, submitPosts } from "./support/api";
import { useTestDatabase } from "./support/database";

jest.setTimeout(60_000);
useTestDatabase();

async function totals(campaignId: string): Promise<{ spent: number; paid: number }> {
  const campaign = await CampaignModel.findById(campaignId).lean();
  const submissions = await SubmissionModel.find({ campaign: campaignId }).lean();
  return {
    spent: campaign?.spent ?? Number.NaN,
    paid: submissions.reduce((sum, s) => sum + s.paidAmount, 0),
  };
}

describe("PATCH /api/submissions/:id/views", () => {
  it("never overspends when many posts are paid at the same time", async () => {
    const budget = 5_000;
    const { campaignId } = await createCampaign(budget);
    const submissionIds = await submitPosts(campaignId, 20);

    const responses = await Promise.all(submissionIds.map((id) => patchViews(id, 60_000)));

    expect(responses.every((res) => res.status === 200)).toBe(true);
    const paidNow = responses.map((res) => updateViewsResponseSchema.parse(res.body).paidNow);
    expect(paidNow.reduce((sum, amount) => sum + amount, 0)).toBe(budget);
    await expect(totals(campaignId)).resolves.toEqual({ spent: budget, paid: budget });
  });

  it("pays a milestone only once under concurrent duplicate updates", async () => {
    const { campaignId } = await createCampaign(10_000);
    const [submissionId = ""] = await submitPosts(campaignId, 1);

    await Promise.all(Array.from({ length: 10 }, () => patchViews(submissionId, 12_000)));
    await patchViews(submissionId, 12_000);

    await expect(totals(campaignId)).resolves.toEqual({ spent: 500, paid: 500 });
  });

  it("pays only the difference when climbing the ladder and ignores lower counts", async () => {
    const { campaignId } = await createCampaign(10_000);
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
    const { campaignId } = await createCampaign(2_300);
    const [first = "", second = ""] = await submitPosts(campaignId, 2);

    await patchViews(first, 60_000);
    const res = updateViewsResponseSchema.parse((await patchViews(second, 60_000)).body);

    expect(res.paidNow).toBe(300);
    expect(res.submission.entitledAmount).toBe(2_000);
    expect(res.submission.paidAmount).toBe(300);
    await expect(totals(campaignId)).resolves.toEqual({ spent: 2_300, paid: 2_300 });
  });

  it("stops paying once the brand closes the campaign", async () => {
    const { campaignId } = await createCampaign(10_000);
    const [submissionId = ""] = await submitPosts(campaignId, 1);
    await CampaignModel.updateOne({ _id: campaignId }, { status: "closed" });

    const res = updateViewsResponseSchema.parse((await patchViews(submissionId, 60_000)).body);

    expect(res.paidNow).toBe(0);
    expect(res.submission.views).toBe(60_000);
  });

  it("holds payouts while paused and catches up on resume", async () => {
    const { campaignId, brandToken } = await createCampaign(10_000);
    const [submissionId = ""] = await submitPosts(campaignId, 1);
    const setStatus = (status: string) =>
      request(app)
        .patch(`/api/campaigns/${campaignId}/status`)
        .auth(brandToken, { type: "bearer" })
        .send({ status });

    expect((await setStatus("paused")).status).toBe(200);
    const whilePaused = updateViewsResponseSchema.parse((await patchViews(submissionId, 60_000)).body);
    expect(whilePaused.paidNow).toBe(0);

    expect((await setStatus("active")).status).toBe(200);
    const afterResume = updateViewsResponseSchema.parse((await patchViews(submissionId, 60_000)).body);
    expect(afterResume.paidNow).toBe(2_000);

    expect((await setStatus("closed")).status).toBe(200);
    expect((await setStatus("active")).status).toBe(409);
  });

  it("paginates and searches a campaign's submissions", async () => {
    const { campaignId, brandToken } = await createCampaign(10_000);
    await submitPosts(campaignId, 12);
    const list = (query: string) =>
      request(app).get(`/api/campaigns/${campaignId}/submissions?${query}`).auth(brandToken, { type: "bearer" });

    const second = submissionPageSchema.parse((await list("page=2&pageSize=5")).body);
    expect(second).toMatchObject({ total: 12, page: 2, pageSize: 5, totalPages: 3 });
    expect(second.items).toHaveLength(5);

    const found = submissionPageSchema.parse((await list("search=post-11-")).body);
    expect(found.total).toBe(1);

    const byCreator = submissionPageSchema.parse((await list("search=CREATOR")).body);
    expect(byCreator.total).toBe(12);
  });

  it("counts submissions on the campaign and serves its cover", async () => {
    const { campaignId, brandToken } = await createCampaign(10_000);
    await submitPosts(campaignId, 3);
    const campaign = campaignSchema.parse(
      (await request(app).get(`/api/campaigns/${campaignId}`).auth(brandToken, { type: "bearer" })).body,
    );
    expect(campaign.submissionCount).toBe(3);

    const cover = await request(app).get(`/api/images/${campaign.coverImage ?? ""}`);
    expect(cover.status).toBe(200);
    expect(cover.headers["content-type"]).toBe("image/png");
  });

  it("rejects non-image uploads", async () => {
    const token = await signup("brand");
    const res = await request(app)
      .post("/api/images")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "image/png")
      .send(Buffer.from("<script>alert(1)</script>"));
    expect(res.status).toBe(400);
  });

  it("rejects invalid input", async () => {
    expect((await patchViews("not-an-id", 10)).status).toBe(400);
    expect((await patchViews(new mongoose.Types.ObjectId().toString(), 10)).status).toBe(404);
  });
});
