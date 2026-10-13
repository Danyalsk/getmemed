import type { ReactNode } from "react";

import type { Campaign } from "@contracts/campaign";

import { CampaignCover } from "@/components/campaign-cover";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { SharedCampaignCover } from "@/components/page-transition";
import { PlatformLabel } from "@/components/platform-label";
import { accentBackground } from "@/lib/accents";
import { formatRelativeTime, formatRupees, getDeadline, getInitials } from "@/lib/format";

interface CampaignHeroProps {
  campaign: Campaign;
  actions: ReactNode;
}

export function CampaignHero({ campaign, actions }: CampaignHeroProps) {
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;
  const deadline = getDeadline(campaign.endsAt);
  const stats = [
    { label: "Top payout per post", value: formatRupees(topPayout), tone: "text-success" },
    { label: "Budget left", value: formatRupees(campaign.remaining), tone: "" },
    { label: "Posts submitted", value: campaign.submissionCount.toLocaleString("en-IN"), tone: "" },
    deadline.ended
      ? { label: "Ended on", value: deadline.date, tone: "text-muted-foreground" }
      : {
          label: `Ends ${deadline.date}`,
          value: `${deadline.countdown} left`,
          tone: deadline.urgent ? "text-warning" : "",
        },
  ];

  return (
    <section className="grid items-center gap-8 rounded-3xl border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 text-foreground">
            <span
              className={`flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-ink ${accentBackground(campaign.brand.name)}`}
            >
              {getInitials(campaign.brand.name)}
            </span>
            {campaign.brand.name}
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelativeTime(campaign.createdAt)}</span>
          <PlatformLabel platform={campaign.platform} />
          <CampaignStatusBadge campaign={campaign} />
        </div>

        <h1 className="text-3xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">{campaign.name}</h1>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4 lg:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 bg-card px-4 py-3">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className={`text-lg font-semibold tabular-nums sm:text-xl ${stat.tone}`}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>

      <div className="relative order-first lg:order-none">
        <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-foreground/10" />
        <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
          <SharedCampaignCover id={campaign._id}>
            <div className="absolute inset-0">
              <CampaignCover campaign={campaign} sizes="(min-width: 1024px) 416px, 100vw" priority />
            </div>
          </SharedCampaignCover>
        </div>
      </div>
    </section>
  );
}
