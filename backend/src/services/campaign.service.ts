import type { CreateCampaignInput } from "../contracts/campaign";
import { cachedJson, invalidate } from "../lib/cache";
import { AppError } from "../lib/errors";
import { CampaignModel } from "../models/campaign.model";

const BRAND_FIELDS = "name";
const LIVE_CAMPAIGNS_KEY = "campaigns:live";
const LIVE_CAMPAIGNS_TTL_SECONDS = 30;

/** Call whenever a campaign is created, closed or its spend changes. */
export function invalidateLiveCampaigns(): Promise<void> {
  return invalidate(LIVE_CAMPAIGNS_KEY);
}

export async function createCampaign(brandId: string, input: CreateCampaignInput) {
  const campaign = await CampaignModel.create({ ...input, brand: brandId });
  await Promise.all([campaign.populate("brand", BRAND_FIELDS), invalidateLiveCampaigns()]);
  return campaign;
}

export function listBrandCampaigns(brandId: string) {
  return CampaignModel.find({ brand: brandId }).sort({ createdAt: -1 }).populate("brand", BRAND_FIELDS);
}

/** Live = still active and with budget left. Returns the serialised list so cache hits skip Mongo entirely. */
export function listLiveCampaignsJson(): Promise<string> {
  return cachedJson(LIVE_CAMPAIGNS_KEY, LIVE_CAMPAIGNS_TTL_SECONDS, async () => {
    const campaigns = await CampaignModel.find({
      status: "active",
      $expr: { $lt: ["$spent", "$budget"] },
    })
      .sort({ createdAt: -1 })
      .populate("brand", BRAND_FIELDS);
    return JSON.stringify(campaigns);
  });
}

/** Throws not found for missing campaigns and for other brands' campaigns alike. */
export async function assertOwnsCampaign(brandId: string, campaignId: string): Promise<void> {
  const owned = await CampaignModel.exists({ _id: campaignId, brand: brandId });
  if (!owned) {
    throw AppError.notFound("Campaign");
  }
}

export async function closeCampaign(brandId: string, campaignId: string) {
  const campaign = await CampaignModel.findOneAndUpdate(
    { _id: campaignId, brand: brandId },
    { status: "closed" },
    { new: true },
  ).populate("brand", BRAND_FIELDS);
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  await invalidateLiveCampaigns();
  return campaign;
}
