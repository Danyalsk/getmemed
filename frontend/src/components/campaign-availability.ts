import type { Campaign } from "@contracts/campaign";

export type CampaignAvailability = "open" | "paused" | "closed" | "ended" | "spent";

export function getCampaignAvailability(
  campaign: Pick<Campaign, "status" | "remaining" | "endsAt">,
): CampaignAvailability {
  if (campaign.status === "closed") return "closed";
  if (new Date(campaign.endsAt).getTime() <= Date.now()) return "ended";
  if (campaign.status === "paused") return "paused";
  return campaign.remaining > 0 ? "open" : "spent";
}

export const AVAILABILITY_LABELS: Record<CampaignAvailability, string> = {
  open: "Accepting posts",
  paused: "Paused by brand",
  closed: "Closed",
  ended: "Campaign ended",
  spent: "Budget used up",
};
