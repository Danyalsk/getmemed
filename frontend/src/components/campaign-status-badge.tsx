import type { Campaign } from "@contracts/campaign";
import { CAMPAIGN_STATUS_LABELS } from "@contracts/common";

import { Badge } from "@/components/ui/badge";

export function CampaignStatusBadge({ campaign }: { campaign: Pick<Campaign, "status" | "remaining"> }) {
  if (campaign.status === "active" && campaign.remaining === 0) {
    return <Badge variant="destructive">Budget spent</Badge>;
  }
  const variant = { active: "success", paused: "warning", closed: "secondary" } as const;
  return <Badge variant={variant[campaign.status]}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>;
}
