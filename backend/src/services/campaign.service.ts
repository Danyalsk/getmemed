import { Types } from "mongoose";

import type { BrandCampaignsQuery, CreateCampaignInput, LiveCampaignsQuery } from "../contracts/campaign";
import type { CampaignStatus } from "../contracts/common";
import { cachedJson, invalidate } from "../lib/cache";
import { AppError } from "../lib/errors";
import { pageWindow, searchPattern, toPage } from "../lib/list";
import { CampaignModel } from "../models/campaign.model";
import { assertImageOwner } from "./image.service";

const BRAND_FIELDS = "name";
const LIVE_CAMPAIGNS = "campaigns:live";
const LIVE_CAMPAIGNS_TTL_SECONDS = 30;

/** Allowed status changes. Closed is final. */
const NEXT_STATUSES: Record<CampaignStatus, readonly CampaignStatus[]> = {
  active: ["paused", "closed"],
  paused: ["active", "closed"],
  closed: [],
};

/** Call whenever a campaign is created, changes status or its spend changes. */
export function invalidateLiveCampaigns(): Promise<void> {
  return invalidate(LIVE_CAMPAIGNS);
}

export async function createCampaign(brandId: string, input: CreateCampaignInput) {
  await assertImageOwner(input.coverImage, brandId);
  const campaign = await CampaignModel.create({ ...input, brand: brandId });
  await Promise.all([campaign.populate("brand", BRAND_FIELDS), invalidateLiveCampaigns()]);
  return campaign;
}

async function budgetSummary(brandId: string) {
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
    ...(query.search && { name: searchPattern(query.search) }),
  };
  const { skip, limit } = pageWindow(query);

  const [campaigns, total, summary] = await Promise.all([
    CampaignModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("brand", BRAND_FIELDS),
    CampaignModel.countDocuments(filter),
    budgetSummary(brandId),
  ]);
  return { ...toPage(campaigns, total, query), summary };
}

/**
 * Live = active with budget left. Returns the serialised page so cache hits
 * skip Mongo entirely.
 */
export function listLiveCampaignsJson(query: LiveCampaignsQuery): Promise<string> {
  return cachedJson(LIVE_CAMPAIGNS, JSON.stringify(query), LIVE_CAMPAIGNS_TTL_SECONDS, async () => {
    const filter = {
      status: "active" as const,
      $expr: { $lt: ["$spent", "$budget"] },
      ...(query.platform && { platform: query.platform }),
      ...(query.search && { name: searchPattern(query.search) }),
    };
    const { skip, limit } = pageWindow(query);

    const [campaigns, total] = await Promise.all([
      CampaignModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("brand", BRAND_FIELDS),
      CampaignModel.countDocuments(filter),
    ]);
    return JSON.stringify(toPage(campaigns, total, query));
  });
}

/** Throws not found for missing campaigns and for other brands' campaigns alike. */
export async function findOwnedCampaign(brandId: string, campaignId: string) {
  const campaign = await CampaignModel.findOne({ _id: campaignId, brand: brandId }).populate(
    "brand",
    BRAND_FIELDS,
  );
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  return campaign;
}

export async function updateCampaignStatus(brandId: string, campaignId: string, status: CampaignStatus) {
  const campaign = await findOwnedCampaign(brandId, campaignId);
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
