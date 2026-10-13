import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { Panel } from "@/components/analytics/panel";

export function CampaignBrief({ campaign }: { campaign: Pick<Campaign, "description" | "platform"> }) {
  const steps = [
    `Post publicly on ${PLATFORM_LABELS[campaign.platform]}.`,
    "Submit the post link here. Each post can join one campaign.",
    "Get paid the highest milestone your post reaches as its views grow.",
    "Payouts stop once the campaign budget runs out.",
  ];

  return (
    <Panel title="Brief">
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {campaign.description || "No brief was added for this campaign."}
      </p>
      <ol className="grid gap-3 border-t pt-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-muted-foreground">
            <span className="font-pixel text-wl-lime">{String(index + 1).padStart(2, "0")}</span>
            {step}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
