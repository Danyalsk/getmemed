"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, FileTextIcon, LayersIcon, TrophyIcon, UsersRoundIcon, WalletIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { AVAILABILITY_LABELS, getCampaignAvailability } from "@/components/campaign-availability";
import { CampaignCover } from "@/components/campaign-cover";
import { QueryErrorAlert } from "@/components/list/query-error-alert";
import { SharedCampaignCover, TRANSITION_TYPES } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, formatRupees, formatViews, getInitials } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { queries } from "@/lib/queries";

import { SubmitPostDialog } from "./submit-post-dialog";

const RANK_STYLES = ["bg-wl-yellow text-wl-ink", "bg-zinc-300 text-wl-ink", "bg-amber-700 text-white"];

function Card({ icon: Icon, title, aside, children }: { icon: LucideIcon; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border bg-card">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" /> {title}
        </h2>
        {aside}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm">{children}</span>;
}

function JoinButton({ campaign }: { campaign: Campaign }) {
  const availability = getCampaignAvailability(campaign);
  if (availability !== "open") {
    return (
      <Button size="lg" disabled>
        {AVAILABILITY_LABELS[availability]}
      </Button>
    );
  }
  return (
    <SubmitPostDialog
      campaign={campaign}
      trigger={
        <Button size="lg" className="rounded-full px-6">
          Join campaign
        </Button>
      }
    />
  );
}

function Leaderboard({ campaignId }: { campaignId: string }) {
  const { data } = useQuery(queries.campaignLeaderboard(campaignId));

  if (!data) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (data.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No payouts yet. Be the first creator on the board.</p>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {data.map((entry, index) => (
        <li key={entry.creator._id} className="flex items-center gap-3">
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${RANK_STYLES[index] ?? "bg-muted"}`}
          >
            {index + 1}
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wl-lavender text-[11px] font-semibold text-wl-ink">
            {getInitials(entry.creator.name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{entry.creator.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {entry.posts} {entry.posts === 1 ? "post" : "posts"} · {formatViews(entry.views)} views
            </span>
          </div>
          <span className="text-sm font-semibold text-wl-lime tabular-nums">{formatRupees(entry.earned)}</span>
        </li>
      ))}
    </ol>
  );
}

function CampaignBody({ campaign }: { campaign: Campaign }) {
  const availability = getCampaignAvailability(campaign);
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const spentPercent = Math.min(100, (campaign.spent / campaign.budget) * 100);
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;

  return (
    <>
      <section className="group relative aspect-video overflow-hidden rounded-3xl border bg-muted md:aspect-[21/8]">
        <SharedCampaignCover id={campaign._id}>
          <div className="absolute inset-0">
            <CampaignCover campaign={campaign} sizes="(min-width: 1280px) 1200px, 100vw" priority />
          </div>
        </SharedCampaignCover>
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3 text-white sm:inset-x-8 sm:bottom-7">
          <span className="flex w-fit items-center gap-2 rounded-full bg-black/45 py-1 pr-3 pl-1 text-sm backdrop-blur">
            <span className="flex size-6 items-center justify-center rounded-full bg-wl-yellow text-[10px] font-bold text-wl-ink">
              {getInitials(campaign.brand.name)}
            </span>
            {campaign.brand.name} · {formatRelativeTime(campaign.createdAt)}
          </span>
          <h1 className="max-w-3xl text-2xl leading-tight font-semibold tracking-tight sm:text-4xl">{campaign.name}</h1>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip>
            <span className={`size-2 rounded-full ${availability === "open" ? "bg-wl-lime" : "bg-wl-yellow"}`} />
            {AVAILABILITY_LABELS[availability]}
          </Chip>
          <Chip>
            <PlatformIcon className="size-4" /> {PLATFORM_LABELS[campaign.platform]}
          </Chip>
          <Chip>
            <UsersRoundIcon className="size-4" /> {campaign.submissionCount} posts
          </Chip>
          <Chip>
            <LayersIcon className="size-4" /> {campaign.milestones.length}-step payout
          </Chip>
        </div>
        <JoinButton campaign={campaign} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5">
          <Card icon={LayersIcon} title="Payout milestones" aside={<span className="text-xs text-muted-foreground">Up to {formatRupees(topPayout)} per post</span>}>
            <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
              {campaign.milestones.map((rung, index) => (
                <div key={rung.views} className="flex flex-col gap-1 bg-card p-4">
                  <span className="text-xs text-muted-foreground">Milestone {index + 1}</span>
                  <span className="text-sm">{formatViews(rung.views)} views</span>
                  <span className="text-xl font-semibold text-wl-lime tabular-nums">{formatRupees(rung.payout)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Each post earns the highest milestone it reaches, paid as its views grow. Milestones don&apos;t stack.
            </p>
          </Card>

          <Card icon={FileTextIcon} title="Brief">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {campaign.description || "The brand hasn't added a brief for this campaign."}
            </p>
            <ul className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground">
              <li>• Post publicly on {PLATFORM_LABELS[campaign.platform]}, then submit the link here.</li>
              <li>• Each post can be submitted once, to one campaign.</li>
              <li>• Payouts stop when the campaign budget runs out.</li>
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card icon={WalletIcon} title="Budget">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-2xl font-semibold tabular-nums">{formatRupees(campaign.spent)}</span>
              <span className="text-sm text-muted-foreground tabular-nums">{formatRupees(campaign.remaining)} remaining</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-wl-lime" style={{ width: `${spentPercent}%` }} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {campaign.remaining > 0 ? (
                <>
                  <span className="font-medium text-wl-lime">{formatRupees(campaign.remaining)}</span> still up for grabs out of{" "}
                  {formatRupees(campaign.budget)}.
                </>
              ) : (
                "This campaign's budget has been fully paid out."
              )}
            </p>
          </Card>

          <Card icon={TrophyIcon} title="Top creators">
            <Leaderboard campaignId={campaign._id} />
          </Card>
        </div>
      </div>
    </>
  );
}

export function CampaignOverview({ campaignId }: { campaignId: string }) {
  const { data: campaign, error, refetch } = useQuery(queries.campaign(campaignId));

  return (
    <>
      <Link
        href="/creator/discover"
        transitionTypes={TRANSITION_TYPES.back}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> Discover
      </Link>
      {error && <QueryErrorAlert error={error} onRetry={() => void refetch()} />}
      {campaign ? <CampaignBody campaign={campaign} /> : !error && <Skeleton className="aspect-[21/8] w-full rounded-3xl" />}
    </>
  );
}
