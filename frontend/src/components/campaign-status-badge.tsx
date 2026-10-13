import type { Campaign } from "@contracts/campaign";

import { getCampaignAvailability, type CampaignAvailability } from "@/components/campaign-availability";
import { Badge } from "@/components/ui/badge";

const BADGES: Record<CampaignAvailability, { label: string; variant: "success" | "warning" | "secondary" | "destructive" }> = {
  open: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  closed: { label: "Closed", variant: "secondary" },
  ended: { label: "Ended", variant: "secondary" },
  spent: { label: "Budget spent", variant: "destructive" },
};

export function CampaignStatusBadge({ campaign }: { campaign: Pick<Campaign, "status" | "remaining" | "endsAt"> }) {
  const { label, variant } = BADGES[getCampaignAvailability(campaign)];
  return <Badge variant={variant}>{label}</Badge>;
}
