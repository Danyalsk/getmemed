import { readFile } from "node:fs/promises";
import path from "node:path";

import bcrypt from "bcryptjs";
import type { Types } from "mongoose";

import { env } from "../src/config/env";
import type { Milestone } from "../src/contracts/campaign";
import type { CampaignStatus, Platform } from "../src/contracts/common";
import { connectMongo, disconnectMongo } from "../src/db/mongo";
import { disconnectRedis } from "../src/lib/cache";
import { CampaignModel } from "../src/models/campaign.model";
import { ImageModel } from "../src/models/image.model";
import { SubmissionModel } from "../src/models/submission.model";
import { UserModel } from "../src/models/user.model";
import { invalidateLiveCampaigns } from "../src/services/campaign.service";
import { recordViewsAndPayout } from "../src/services/submission.service";

const SEED_EMAIL_DOMAIN = "seed.memed.app";
const SEED_PASSWORD = "password123";
const COVERS_DIR = path.join(__dirname, "seed", "covers");
const DAY_MS = 24 * 60 * 60 * 1000;

interface SeedCampaign {
  brand: string;
  cover: string;
  name: string;
  description: string;
  platform: Platform;
  budget: number;
  milestones: Milestone[];
  ageDays: number;
  posts: number;
  status?: CampaignStatus;
}

const CREATORS = [
  "Daily Meme Dose",
  "Clip Kartel",
  "Desi Hype House",
  "Sarcasm Sutra",
  "Reel Rajas",
  "Bollywood Banter",
  "Gamer Ghar",
  "Fit Memes India",
];

const STANDARD_LADDER: Milestone[] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
  { views: 100_000, payout: 5_000 },
];

const CAMPAIGNS: SeedCampaign[] = [
  {
    brand: "Zing Beverages",
    cover: "zing-cola",
    name: "Zing Cola Summer Fizz Memes",
    description:
      "Make a meme or reel about the first sip on a hot day. Show a can of Zing Cola on screen for at least two seconds and tag @zingcola. Relatable office, college and family humour does best.",
    platform: "instagram",
    budget: 150_000,
    milestones: STANDARD_LADDER,
    ageDays: 1,
    posts: 9,
  },
  {
    brand: "Nimbus Audio",
    cover: "nimbus-audio",
    name: "Nimbus Bass Drop Reels",
    description:
      "Edit a beat-drop transition reel using the Nimbus X2 earbuds as the reveal. Use any trending audio, keep it under 30 seconds, and mention the 40-hour battery in the caption.",
    platform: "instagram",
    budget: 80_000,
    milestones: [
      { views: 25_000, payout: 1_000 },
      { views: 100_000, payout: 4_000 },
      { views: 250_000, payout: 9_000 },
    ],
    ageDays: 3,
    posts: 6,
  },
  {
    brand: "Kraft Arena Games",
    cover: "kraft-arena",
    name: "Season 4 Clash Clips",
    description:
      "Clip your best Kraft Arena Season 4 plays: clutches, fails or funny moments. Add captions, keep the in-game HUD visible and link the season trailer in the description.",
    platform: "youtube",
    budget: 200_000,
    milestones: [
      { views: 20_000, payout: 800 },
      { views: 100_000, payout: 3_500 },
      { views: 500_000, payout: 12_000 },
    ],
    ageDays: 6,
    posts: 12,
  },
  {
    brand: "Masala Monk Foods",
    cover: "masala-monk",
    name: "The Spice Level 5 Challenge",
    description:
      "Film yourself or a friend trying Masala Monk Level 5 chips. Reactions only, no dubbing. Show the pack front-on and use #SpiceLevel5.",
    platform: "instagram",
    budget: 60_000,
    milestones: STANDARD_LADDER,
    ageDays: 10,
    posts: 10,
  },
  {
    brand: "Pulse Fitness",
    cover: "pulse-fitness",
    name: "30 Day Glow Up Shorts",
    description:
      "Share a short about your Pulse app workout streak: before and after, a funny gym moment, or a meme about leg day. Keep the Pulse logo visible in the first five seconds.",
    platform: "youtube",
    budget: 120_000,
    milestones: STANDARD_LADDER,
    ageDays: 2,
    posts: 4,
  },
  {
    brand: "Byteside Media",
    cover: "byteside",
    name: "Gadget Roast Shorts",
    description:
      "Roast a phone, laptop or gadget launch in under 60 seconds. Fair game: specs, prices and launch-event cringe. Credit Byteside in the caption.",
    platform: "youtube",
    budget: 45_000,
    milestones: [
      { views: 15_000, payout: 600 },
      { views: 75_000, payout: 2_500 },
    ],
    ageDays: 14,
    posts: 8,
  },
  {
    brand: "Kadak Chai Co.",
    cover: "kadak-chai",
    name: "Monday Chai Memes",
    description:
      "Monday mood, office chai breaks, that one colleague who drinks five cups. Post a meme or reel featuring Kadak Chai and tag @kadakchaico.",
    platform: "instagram",
    budget: 35_000,
    milestones: [
      { views: 10_000, payout: 400 },
      { views: 40_000, payout: 1_500 },
    ],
    ageDays: 20,
    posts: 11,
  },
  {
    brand: "Orbit Wallet",
    cover: "orbit-wallet",
    name: "Payday Mood",
    description:
      "Memes about salary day, splitting bills and the end-of-month struggle. Mention Orbit's instant split feature and avoid any investment advice.",
    platform: "instagram",
    budget: 100_000,
    milestones: STANDARD_LADDER,
    ageDays: 5,
    posts: 5,
  },
  {
    brand: "Neon Nights Festival",
    cover: "neon-nights",
    name: "Festival Hype Clips",
    description:
      "Build hype for Neon Nights Goa: lineup reactions, outfit ideas, or 'POV: your squad at the main stage'. Link the ticket page in the description.",
    platform: "youtube",
    budget: 250_000,
    milestones: [
      { views: 50_000, payout: 2_000 },
      { views: 200_000, payout: 7_500 },
      { views: 500_000, payout: 15_000 },
    ],
    ageDays: 0,
    posts: 2,
  },
  {
    brand: "StreetKicks",
    cover: "streetkicks",
    name: "AF-9 Drop Day Hype",
    description:
      "Countdown content for the AF-9 drop on Friday: unboxings, fit checks, or memes about missing out on drops. Show the shoe clearly and tag @streetkicks.",
    platform: "instagram",
    budget: 75_000,
    milestones: STANDARD_LADDER,
    ageDays: 8,
    posts: 7,
    status: "paused",
  },
  {
    brand: "Lumen Skincare",
    cover: "lumen-skin",
    name: "Glass Skin Routine",
    description:
      "Show your three-step Lumen routine or a funny take on skincare trends. Natural lighting, no filters on the product shots.",
    platform: "instagram",
    budget: 90_000,
    milestones: STANDARD_LADDER,
    ageDays: 4,
    posts: 6,
  },
  {
    brand: "Kraft Arena Games",
    cover: "pixel-pals",
    name: "Pixel Pals Speedrun Showdown",
    description:
      "Speedrun any Pixel Pals world and post the run with a timer on screen. Fastest verified clips get pinned on the official channel.",
    platform: "youtube",
    budget: 50_000,
    milestones: [
      { views: 10_000, payout: 500 },
      { views: 60_000, payout: 2_500 },
    ],
    ageDays: 12,
    posts: 9,
  },
];

const email = (name: string) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@${SEED_EMAIL_DOMAIN}`;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

let randomState = 42;
function random(): number {
  randomState = (randomState * 1_103_515_245 + 12_345) % 2_147_483_648;
  return randomState / 2_147_483_648;
}

function postUrl(platform: Platform, index: number, campaignIndex: number): string {
  const code = `S${campaignIndex}x${index}${Math.floor(random() * 1e6).toString(36)}`;
  return platform === "instagram"
    ? `https://www.instagram.com/p/${code}/`
    : `https://www.youtube.com/watch?v=${code.padEnd(11, "x").slice(0, 11)}`;
}

async function removePreviousSeed(): Promise<void> {
  const userIds = await UserModel.find({ email: new RegExp(`@${SEED_EMAIL_DOMAIN.replace(".", "\\.")}$`) }).distinct("_id");
  const campaignIds = await CampaignModel.find({ brand: { $in: userIds } }).distinct("_id");
  await Promise.all([
    SubmissionModel.deleteMany({ $or: [{ campaign: { $in: campaignIds } }, { creator: { $in: userIds } }] }),
    CampaignModel.deleteMany({ _id: { $in: campaignIds } }),
    ImageModel.deleteMany({ uploadedBy: { $in: userIds } }),
  ]);
  await UserModel.deleteMany({ _id: { $in: userIds } });
}

async function createUsers(names: string[], role: "brand" | "creator", passwordHash: string) {
  const users = await UserModel.create(names.map((name) => ({ name, email: email(name), role, passwordHash })));
  return new Map(users.map((user) => [user.name, user._id]));
}

async function seedCampaign(
  campaign: SeedCampaign,
  campaignIndex: number,
  brandId: Types.ObjectId,
  creatorIds: Types.ObjectId[],
): Promise<void> {
  const cover = await ImageModel.create({
    data: await readFile(path.join(COVERS_DIR, `${campaign.cover}.jpg`)),
    contentType: "image/jpeg",
    uploadedBy: brandId,
  });
  const created = await CampaignModel.create({
    brand: brandId,
    name: campaign.name,
    description: campaign.description,
    platform: campaign.platform,
    budget: campaign.budget,
    milestones: campaign.milestones,
    coverImage: cover._id,
    endsAt: new Date(Date.now() + (2 + ((campaignIndex * 5) % 26)) * DAY_MS),
  });
  await CampaignModel.updateOne({ _id: created._id }, { createdAt: daysAgo(campaign.ageDays) }, { timestamps: false, overwriteImmutable: true });

  const topThreshold = campaign.milestones.at(-1)?.views ?? 0;
  for (let index = 0; index < campaign.posts; index++) {
    const creator = creatorIds[(campaignIndex + index) % creatorIds.length];
    if (!creator) throw new Error("Seed needs at least one creator");
    const submission = await SubmissionModel.create({
      campaign: created._id,
      creator,
      postUrl: postUrl(campaign.platform, index, campaignIndex),
    });
    await SubmissionModel.updateOne(
      { _id: submission._id },
      { createdAt: daysAgo(Math.max(campaign.ageDays - random() * campaign.ageDays, 0.5)) },
      { timestamps: false, overwriteImmutable: true },
    );
    const views = Math.round(topThreshold * (0.05 + random() * 1.3));
    await recordViewsAndPayout(submission.id, { views });
  }
  await CampaignModel.updateOne({ _id: created._id }, { submissionCount: campaign.posts, status: campaign.status ?? "active" });
}

async function seed(): Promise<void> {
  await connectMongo(env.MONGODB_URI);
  await removePreviousSeed();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const brandIds = await createUsers([...new Set(CAMPAIGNS.map((campaign) => campaign.brand))], "brand", passwordHash);
  const creatorIds = [...(await createUsers(CREATORS, "creator", passwordHash)).values()];

  for (const [index, campaign] of CAMPAIGNS.entries()) {
    const brandId = brandIds.get(campaign.brand);
    if (!brandId) throw new Error(`Missing brand ${campaign.brand}`);
    await seedCampaign(campaign, index, brandId, creatorIds);
  }
  await invalidateLiveCampaigns();

  console.log(`Seeded ${CAMPAIGNS.length} campaigns, ${brandIds.size} brands and ${CREATORS.length} creators.`);
  console.log(`Log in as ${email(CREATORS[0] ?? "")} or ${email(CAMPAIGNS[0]?.brand ?? "")} with password "${SEED_PASSWORD}".`);
}

seed()
  .catch((error: unknown) => {
    console.error("Seeding failed", error);
    process.exitCode = 1;
  })
  .finally(() => Promise.all([disconnectMongo(), disconnectRedis()]));
