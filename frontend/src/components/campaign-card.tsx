import { UsersRoundIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { SharedCampaignCover } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, formatRupees, formatRupeesCompact, formatViews, getInitials } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";

export const CARD_LINK_CLASS =
  "text-left outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring";

const AVATAR_COLORS = ["bg-wl-lavender", "bg-wl-yellow", "bg-wl-red", "bg-wl-blue", "bg-wl-lime"];

function getAvatarColor(name: string): string {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? "bg-wl-lavender";
}

interface CampaignCardProps {
  campaign: Campaign;
  title: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  footer?: ReactNode;
  morphCover?: boolean;
}

export function CampaignCard({ campaign, title, topLeft, topRight, footer, morphCover = false }: CampaignCardProps) {
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const firstRung = campaign.milestones[0];
  const cover = (
    <div className="absolute inset-0">
      <CampaignCover campaign={campaign} sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw" />
    </div>
  );
  const spentPercent = Math.min(100, (campaign.spent / campaign.budget) * 100);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-[translate,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_40px_-16px_rgb(150_255_67_/_0.25)] motion-reduce:hover:translate-y-0">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {morphCover ? <SharedCampaignCover id={campaign._id}>{cover}</SharedCampaignCover> : cover}
        {topLeft && <div className="absolute top-3 left-3 rounded-full bg-black/75 backdrop-blur">{topLeft}</div>}
        {topRight && <div className="absolute top-2 right-2 z-10">{topRight}</div>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-wl-ink ${getAvatarColor(campaign.brand.name)}`}
            >
              {getInitials(campaign.brand.name)}
            </span>
            <span className="truncate font-medium">{campaign.brand.name}</span>
            <span className="shrink-0 text-muted-foreground">· {formatRelativeTime(campaign.createdAt)}</span>
          </div>
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted"
            title={PLATFORM_LABELS[campaign.platform]}
          >
            <PlatformIcon className="size-3.5" />
            <span className="sr-only">{PLATFORM_LABELS[campaign.platform]}</span>
          </span>
        </div>
        <h3 className="truncate text-lg font-semibold">{title}</h3>
        <div className="mt-auto flex items-center justify-between gap-3 text-sm">
          <span className="tabular-nums">
            {formatRupeesCompact(campaign.spent)}
            <span className="text-muted-foreground">/{formatRupeesCompact(campaign.budget)}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums"
              title="Posts submitted"
            >
              <UsersRoundIcon className="size-3" /> {campaign.submissionCount}
            </span>
            {firstRung && (
              <span className="rounded-full bg-wl-lime/15 px-2 py-0.5 text-xs font-medium text-wl-lime tabular-nums">
                {formatRupees(firstRung.payout)}/{formatViews(firstRung.views)}
              </span>
            )}
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Budget spent"
          aria-valuenow={Math.round(spentPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-wl-red transition-[width]" style={{ width: `${spentPercent}%` }} />
        </div>
        {footer}
      </div>
    </article>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-video rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-1.5 w-full" />
      </div>
    </div>
  );
}
