import type { Campaign, CreateCampaignInput } from "../contracts/campaign";
import { AppError } from "../lib/errors";
import { CampaignModel, type CampaignWithBrand } from "../models/campaign.model";

const BRAND_FIELDS = "name";

export function toCampaign(campaign: CampaignWithBrand): Campaign {
  return {
    id: campaign._id.toString(),
    brand: { id: campaign.brand._id.toString(), name: campaign.brand.name },
    name: campaign.name,
    platform: campaign.platform,
    budget: campaign.budget,
    spent: campaign.spent,
    remaining: campaign.budget - campaign.spent,
    milestones: campaign.milestones.map(({ views, payout }) => ({ views, payout })),
    status: campaign.status,
    createdAt: campaign.createdAt.toISOString(),
  };
}

async function findCampaignWithBrand(id: string): Promise<CampaignWithBrand> {
  const campaign = await CampaignModel.findById(id)
    .populate<Pick<CampaignWithBrand, "brand">>("brand", BRAND_FIELDS)
    .lean();
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  return campaign;
}

export async function createCampaign(brandId: string, input: CreateCampaignInput): Promise<Campaign> {
  const campaign = await CampaignModel.create({ ...input, brand: brandId });
  return toCampaign(await findCampaignWithBrand(campaign.id));
}

export async function listBrandCampaigns(brandId: string): Promise<Campaign[]> {
  const campaigns = await CampaignModel.find({ brand: brandId })
    .sort({ createdAt: -1 })
    .populate<Pick<CampaignWithBrand, "brand">>("brand", BRAND_FIELDS)
    .lean();
  return campaigns.map(toCampaign);
}

/** Live = still active and with budget left to pay out. */
export async function listLiveCampaigns(): Promise<Campaign[]> {
  const campaigns = await CampaignModel.find({
    status: "active",
    $expr: { $lt: ["$spent", "$budget"] },
  })
    .sort({ createdAt: -1 })
    .populate<Pick<CampaignWithBrand, "brand">>("brand", BRAND_FIELDS)
    .lean();
  return campaigns.map(toCampaign);
}

/** Loads a campaign owned by the brand; other brands' campaigns read as not found. */
export async function getOwnedCampaign(brandId: string, campaignId: string): Promise<CampaignWithBrand> {
  const campaign = await findCampaignWithBrand(campaignId);
  if (!campaign.brand._id.equals(brandId)) {
    throw AppError.notFound("Campaign");
  }
  return campaign;
}

export async function closeCampaign(brandId: string, campaignId: string): Promise<Campaign> {
  await getOwnedCampaign(brandId, campaignId);
  await CampaignModel.updateOne({ _id: campaignId }, { status: "closed" });
  return toCampaign(await findCampaignWithBrand(campaignId));
}
