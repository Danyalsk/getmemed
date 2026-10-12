import request from "supertest";

import { brandAnalyticsSchema, creatorAnalyticsSchema } from "../src/contracts/analytics";
import { authResponseSchema } from "../src/contracts/auth";
import {
  campaignPageSchema,
  campaignSchema,
  joinedCampaignPageSchema,
  leaderboardSchema,
} from "../src/contracts/campaign";
import { submissionPageSchema } from "../src/contracts/submission";
import { app, createCampaign, patchViews, signup, submitPosts } from "./support/api";
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
