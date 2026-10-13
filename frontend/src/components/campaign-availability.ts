import type { Campaign } from "@contracts/campaign";

export type CampaignAvailability = "open" | "paused" | "closed" | "spent";

export function getCampaignAvailability(campaign: Pick<Campaign, "status" | "remaining">): CampaignAvailability {
  if (campaign.status === "closed") return "closed";
  if (campaign.status === "paused") return "paused";
  return campaign.remaining > 0 ? "open" : "spent";
}

export const AVAILABILITY_LABELS: Record<CampaignAvailability, string> = {
  open: "Accepting posts",
  paused: "Paused by brand",
  closed: "Closed",
  spent: "Budget used up",
};
