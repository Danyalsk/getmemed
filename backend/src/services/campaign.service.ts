import { Types } from "mongoose";

import type { BrandCampaignsQuery, CampaignSort, CreateCampaignInput, LiveCampaignsQuery } from "../contracts/campaign";
import type { CampaignStatus } from "../contracts/common";
import type { AuthUser } from "../lib/jwt";
import { getOrSetJson, invalidate } from "../lib/cache";
import { AppError } from "../lib/errors";
import { toSkipLimit, toSearchRegex, toPageResult } from "../lib/list";
import { CampaignModel } from "../models/campaign.model";
import { assertBrandOwnsImage } from "./image.service";

const BRAND_FIELDS = "name";
const LIVE_CAMPAIGNS = "campaigns:live";
const LIVE_CAMPAIGNS_TTL_SECONDS = 30;

const LIVE_SORTS: Record<CampaignSort, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  trending: { submissionCount: -1, createdAt: -1 },
  budget: { budget: -1, createdAt: -1 },
};

const NEXT_STATUSES: Record<CampaignStatus, readonly CampaignStatus[]> = {
  active: ["paused", "closed"],
  paused: ["active", "closed"],
  closed: [],
};

export function invalidateLiveCampaigns(): Promise<void> {
  return invalidate(LIVE_CAMPAIGNS);
}

export async function createCampaign(brandId: string, input: CreateCampaignInput) {
  await assertBrandOwnsImage(input.coverImage, brandId);
  const campaign = await CampaignModel.create({ ...input, brand: brandId });
  await Promise.all([campaign.populate("brand", BRAND_FIELDS), invalidateLiveCampaigns()]);
  return campaign;
}

async function getBudgetSummary(brandId: string) {
  const [totals] = await CampaignModel.aggregate<{ campaigns: number; budget: number; spent: number }>([
    { $match: { brand: new Types.ObjectId(brandId) } },
    { $group: { _id: null, campaigns: { $sum: 1 }, budget: { $sum: "$budget" }, spent: { $sum: "$spent" } } },
  ]);
  const { campaigns = 0, budget = 0, spent = 0 } = totals ?? {};
  return { campaigns, budget, spent, remaining: budget - spent };
}

export async function listBrandCampaigns(
  brandId: string,
  query: BrandCampaignsQuery,
) {
  const filter = {
    brand: brandId,
    ...(query.status && { status: query.status }),
    ...(query.search && { name: toSearchRegex(query.search) }),
  };
  const { skip, limit } = toSkipLimit(query);

  const [campaigns, total, summary] = await Promise.all([
    CampaignModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("brand", BRAND_FIELDS),
    CampaignModel.countDocuments(filter),
    getBudgetSummary(brandId),
  ]);
  return { ...toPageResult(campaigns, total, query), summary };
}

export function listLiveCampaignsJson(query: LiveCampaignsQuery): Promise<string> {
  return getOrSetJson(LIVE_CAMPAIGNS, JSON.stringify(query), LIVE_CAMPAIGNS_TTL_SECONDS, async () => {
    const filter = {
      status: "active" as const,
      $expr: { $lt: ["$spent", "$budget"] },
      ...(query.platform && { platform: query.platform }),
      ...(query.search && { name: toSearchRegex(query.search) }),
    };
    const { skip, limit } = toSkipLimit(query);

    const [campaigns, total] = await Promise.all([
      CampaignModel.find(filter).sort(LIVE_SORTS[query.sort]).skip(skip).limit(limit).populate("brand", BRAND_FIELDS),
      CampaignModel.countDocuments(filter),
    ]);
    return JSON.stringify(toPageResult(campaigns, total, query));
  });
}

export async function findBrandCampaign(brandId: string, campaignId: string) {
  const campaign = await CampaignModel.findOne({ _id: campaignId, brand: brandId }).populate(
    "brand",
    BRAND_FIELDS,
  );
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  return campaign;
}

export async function findCampaignForViewer(viewer: AuthUser, campaignId: string) {
  if (viewer.role === "brand") {
    return findBrandCampaign(viewer._id, campaignId);
  }
  const campaign = await CampaignModel.findById(campaignId).populate("brand", BRAND_FIELDS);
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  return campaign;
}

export async function listBrandCampaignIds(brandId: string) {
  return CampaignModel.find({ brand: brandId }).distinct("_id");
}

export async function updateCampaignStatus(brandId: string, campaignId: string, status: CampaignStatus) {
  const campaign = await findBrandCampaign(brandId, campaignId);
  if (campaign.status === status) {
    return campaign;
  }
  if (!NEXT_STATUSES[campaign.status].includes(status)) {
    throw AppError.conflict(`A ${campaign.status} campaign can't be moved to ${status}`);
  }

  campaign.status = status;
  await campaign.save();
  await invalidateLiveCampaigns();
  return campaign;
}
