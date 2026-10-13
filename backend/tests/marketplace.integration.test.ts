import request from "supertest";

import { brandAnalyticsSchema, campaignPerformanceSchema, creatorAnalyticsSchema } from "../src/contracts/analytics";
import { authResponseSchema } from "../src/contracts/auth";
import {
  campaignPageSchema,
  campaignSchema,
  joinedCampaignPageSchema,
  leaderboardSchema,
} from "../src/contracts/campaign";
import { submissionPageSchema } from "../src/contracts/submission";
import { CampaignModel } from "../src/models/campaign.model";
import { app, createCampaign, daysFromNow, LADDER, patchViews, signup, submitPosts, uploadCover } from "./support/api";
import { useTestDatabase } from "./support/database";

jest.setTimeout(60_000);
useTestDatabase();

const get = (path: string, token: string) => request(app).get(path).auth(token, { type: "bearer" });

describe("campaign pages", () => {
  it("lets any creator open a campaign but hides it from other brands", async () => {
    const { campaignId } = await createCampaign(10_000);
    const creator = await signup("creator");
    const otherBrand = await signup("brand");

    const asCreator = await get(`/api/campaigns/${campaignId}`, creator);
    expect(campaignSchema.parse(asCreator.body).description).toContain("reel");
    expect((await get(`/api/campaigns/${campaignId}`, otherBrand)).status).toBe(404);
  });

  it("ranks creators on the leaderboard by earnings", async () => {
    const { campaignId } = await createCampaign(10_000);
    const [small = ""] = await submitPosts(campaignId, 1, await signup("creator", "Small Creator"));
    const [big = ""] = await submitPosts(campaignId, 1, await signup("creator", "Big Creator"));
    await patchViews(small, 12_000);
    await patchViews(big, 60_000);

    const viewer = await signup("creator");
    const leaderboard = leaderboardSchema.parse((await get(`/api/campaigns/${campaignId}/leaderboard`, viewer)).body);

    expect(leaderboard.map((entry) => [entry.creator.name, entry.earned])).toEqual([
      ["Big Creator", 2_000],
      ["Small Creator", 500],
    ]);
  });

  it("sorts live campaigns by number of posts when trending", async () => {
    const quiet = await createCampaign(10_000, { name: "Quiet campaign" });
    const busy = await createCampaign(10_000, { name: "Busy campaign" });
    await submitPosts(busy.campaignId, 3);
    await submitPosts(quiet.campaignId, 1);

    const creator = await signup("creator");
    const page = campaignPageSchema.parse((await get("/api/campaigns/live?sort=trending&pageSize=50", creator)).body);
    const order = page.items.map((campaign) => campaign._id);

    expect(order.indexOf(busy.campaignId)).toBeLessThan(order.indexOf(quiet.campaignId));
  });

  it("shows live campaigns publicly on the featured list, without paused ones", async () => {
    const live = await createCampaign(10_000, { name: "Featured live" });
    const paused = await createCampaign(10_000, { name: "Featured paused" });
    await request(app)
      .patch(`/api/campaigns/${paused.campaignId}/status`)
      .auth(paused.brandToken, { type: "bearer" })
      .send({ status: "paused" });

    const page = campaignPageSchema.parse((await request(app).get("/api/campaigns/featured")).body);
    const ids = page.items.map((campaign) => campaign._id);

    expect(ids).toContain(live.campaignId);
    expect(ids).not.toContain(paused.campaignId);
  });
});

describe("creator workspace", () => {
  it("lists joined campaigns with the creator's own totals and analytics", async () => {
    const creator = await signup("creator");
    const first = await createCampaign(10_000);
    const second = await createCampaign(10_000, { platform: "youtube" });
    const [post = ""] = await submitPosts(first.campaignId, 2, creator);
    await request(app)
      .post(`/api/campaigns/${second.campaignId}/submissions`)
      .auth(creator, { type: "bearer" })
      .send({ postUrl: "https://youtu.be/dQw4w9WgXcQ" });
    await patchViews(post, 60_000);

    const joined = joinedCampaignPageSchema.parse((await get("/api/campaigns/joined", creator)).body);
    const firstEntry = joined.items.find((campaign) => campaign._id === first.campaignId);
    expect(joined.total).toBe(2);
    expect(firstEntry?.participation).toEqual({ posts: 2, views: 60_000, earned: 2_000 });

    const analytics = creatorAnalyticsSchema.parse((await get("/api/analytics/creator", creator)).body);
    expect(analytics.totals).toMatchObject({ posts: 3, campaigns: 2, earned: 2_000, views: 60_000 });
    expect(analytics.byPlatform.map((row) => row.platform).sort()).toEqual(["instagram", "youtube"]);
    expect(analytics.topPosts[0]?.views).toBe(60_000);
  });
});

describe("brand workspace", () => {
  it("lists submissions across all of a brand's campaigns and reports analytics", async () => {
    const first = await createCampaign(10_000);
    const second = await createCampaign(10_000, {}, first.brandToken);
    const [post = ""] = await submitPosts(first.campaignId, 2);
    await submitPosts(second.campaignId, 1);
    await patchViews(post, 12_000);

    const all = submissionPageSchema.parse((await get("/api/submissions/brand", first.brandToken)).body);
    const filtered = submissionPageSchema.parse(
      (await get(`/api/submissions/brand?campaign=${second.campaignId}`, first.brandToken)).body,
    );
    expect(all.total).toBe(3);
    expect(filtered.total).toBe(1);

    const analytics = brandAnalyticsSchema.parse((await get("/api/analytics/brand", first.brandToken)).body);
    expect(analytics.totals).toMatchObject({ campaigns: 2, budget: 20_000, posts: 3, earned: 500, creators: 2 });
    expect(analytics.topCreators[0]?.earned).toBe(500);
  });
});
describe("campaign lifecycle", () => {
  it("rejects an end date in the past", async () => {
    const brandToken = await signup("brand");
    const res = await request(app)
      .post("/api/campaigns")
      .auth(brandToken, { type: "bearer" })
      .send({
        name: "Old news",
        description: "Post a reel about the launch and tag the brand.",
        platform: "instagram",
        budget: 10_000,
        milestones: LADDER,
        coverImage: await uploadCover(brandToken),
        endsAt: daysFromNow(-1),
      });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain("Pick a date between today");
  });

  it("stops taking posts and leaves the live list once the end date passes", async () => {
    const { campaignId } = await createCampaign(10_000);
    await CampaignModel.updateOne({ _id: campaignId }, { endsAt: new Date(Date.now() - 1_000) });
    const creator = await signup("creator");

    const submit = await request(app)
      .post(`/api/campaigns/${campaignId}/submissions`)
      .auth(creator, { type: "bearer" })
      .send({ postUrl: "https://www.instagram.com/p/too-late/" });
    expect(submit.status).toBe(409);

    const page = campaignPageSchema.parse((await get("/api/campaigns/live?pageSize=50", creator)).body);
    expect(page.items.map((campaign) => campaign._id)).not.toContain(campaignId);
  });

  it("deletes a campaign only while it has no posts", async () => {
    const empty = await createCampaign(10_000);
    const busy = await createCampaign(10_000);
    await submitPosts(busy.campaignId, 1);
    const remove = (id: string, token: string) => request(app).delete(`/api/campaigns/${id}`).auth(token, { type: "bearer" });

    expect((await remove(busy.campaignId, busy.brandToken)).status).toBe(409);
    expect((await remove(empty.campaignId, await signup("brand"))).status).toBe(404);
    expect((await remove(empty.campaignId, empty.brandToken)).status).toBe(204);
    expect((await get(`/api/campaigns/${empty.campaignId}`, empty.brandToken)).status).toBe(404);
  });

  it("reports performance for a single campaign", async () => {
    const { campaignId, brandToken } = await createCampaign(10_000);
    const [first = "", second = ""] = await submitPosts(campaignId, 2);
    await patchViews(first, 12_000);
    await patchViews(second, 3_000);

    const performance = campaignPerformanceSchema.parse((await get(`/api/campaigns/${campaignId}/performance`, brandToken)).body);
    expect(performance).toMatchObject({ posts: 2, views: 15_000, earned: 500, creators: 1 });
  });
});

describe("account settings", () => {
  it("updates the name and changes the password", async () => {
    const email = `settings-${crypto.randomUUID()}@test.dev`;
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Old Name", email, password: "password123", role: "creator" });
    const token = authResponseSchema.parse(signupRes.body).token;
    const patch = (path: string, body: object) => request(app).patch(path).auth(token, { type: "bearer" }).send(body);

    const renamed = await patch("/api/auth/me", { name: "New Name" });
    expect(renamed.body).toMatchObject({ name: "New Name" });

    expect((await patch("/api/auth/password", { currentPassword: "wrong-pass", newPassword: "newpassword1" })).status).toBe(400);
    expect((await patch("/api/auth/password", { currentPassword: "password123", newPassword: "newpassword1" })).status).toBe(204);

    const login = await request(app).post("/api/auth/login").send({ email, password: "newpassword1" });
    expect(login.status).toBe(200);
  });
});
