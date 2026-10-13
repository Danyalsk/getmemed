"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees, formatRupeesCompact, formatViews, getInitials } from "@/lib/format";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const FEATURED_COUNT = 5;

interface SlideProgressProps {
  active: boolean;
  paused: boolean;
  onDone: () => void;
}

function SlideProgress({ active, paused, onDone }: SlideProgressProps) {
  if (!active) return null;
  return (
    <span
      onAnimationEnd={onDone}
      className={`absolute inset-0 origin-left animate-[slide-progress_5s_linear] bg-current ${paused ? "[animation-play-state:paused]" : ""}`}
    />
  );
}

function Slide({ campaign, visible, priority }: { campaign: Campaign; visible: boolean; priority: boolean }) {
  const firstRung = campaign.milestones[0];
  return (
    <div
      aria-hidden={!visible}
      className={`absolute inset-0 transition-opacity duration-500 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="absolute inset-x-0 top-0 aspect-video overflow-hidden sm:inset-0 sm:aspect-auto">
        <div
          className={`absolute inset-0 transition-transform ease-out motion-reduce:transition-none ${visible ? "scale-100 duration-[6000ms]" : "scale-110 delay-500 duration-0"}`}
        >
          <CampaignCover campaign={campaign} sizes="(min-width: 1280px) 1100px, 100vw" priority={priority} />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-card to-transparent to-40% sm:hidden" />
      </div>
      <div className="absolute inset-0 hidden bg-linear-to-r from-black/85 via-black/40 to-transparent sm:block" />
      <div className="absolute inset-0 hidden bg-linear-to-t from-black/70 via-transparent to-transparent sm:block" />
      <div
        className={`absolute inset-x-5 bottom-5 flex flex-col gap-4 sm:text-white transition-[opacity,translate] duration-500 sm:inset-x-10 sm:bottom-10 md:flex-row md:items-end md:justify-between ${visible ? "translate-y-0 opacity-100 delay-150" : "translate-y-4 opacity-0"}`}
      >
        <div className="flex max-w-xl flex-col gap-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-7 items-center justify-center rounded-md bg-wl-yellow text-[10px] font-bold text-wl-ink">
              {getInitials(campaign.brand.name)}
            </span>
            {campaign.brand.name}
          </span>
          <h2 className="text-2xl leading-tight font-semibold tracking-tight sm:text-5xl">{campaign.name}</h2>
          <p className="text-sm text-muted-foreground sm:text-base sm:text-white/85">
            {PLATFORM_LABELS[campaign.platform]}
            {firstRung && ` · ${formatRupees(firstRung.payout)} at ${formatViews(firstRung.views)} views`} ·{" "}
            {formatRupeesCompact(campaign.remaining)} left to earn
          </p>
        </div>
        <Link
          href={campaignHref(campaign._id)}
          transitionTypes={TRANSITION_TYPES.forward}
          tabIndex={visible ? 0 : -1}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-wl-ink transition-transform hover:scale-[1.03]"
        >
          View campaign <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export function FeaturedCarousel() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: FEATURED_COUNT, sort: "budget" }));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = data?.items ?? [];
  const advance = () => setActive((current) => (current + 1) % slides.length);

  if (!data) return <Skeleton className="aspect-[21/9] max-h-[560px] min-h-80 w-full rounded-3xl" />;
  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border bg-card sm:aspect-[21/9] sm:bg-muted sm:max-h-[560px] sm:min-h-80">
        {slides.map((campaign, index) => (
          <Slide key={campaign._id} campaign={campaign} visible={index === active} priority={index === 0} />
        ))}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 backdrop-blur xl:hidden">
          {slides.map((campaign, index) => (
            <button
              key={campaign._id}
              type="button"
              aria-label={`Show ${campaign.name}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`relative h-1.5 overflow-hidden rounded-full bg-white/40 text-white transition-[width] ${index === active ? "w-8" : "w-1.5"}`}
            >
              <SlideProgress active={index === active} paused={paused} onDone={advance} />
            </button>
          ))}
        </div>
      </div>

      <ol aria-label="Up next" className="hidden flex-col gap-2 xl:flex">
        {slides.map((campaign, index) => (
          <li key={campaign._id} className="flex-1">
            <button
              type="button"
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`group relative flex h-full w-full items-center gap-3 overflow-hidden rounded-2xl border p-2 text-left transition-colors ${index === active ? "border-white/20 bg-card" : "border-transparent hover:bg-card/60"}`}
            >
              <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <CampaignCover campaign={campaign} sizes="96px" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{campaign.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {campaign.brand.name} · {formatRupeesCompact(campaign.remaining)} left
                </span>
              </span>
              <span className="absolute inset-x-3 bottom-0 h-0.5 overflow-hidden text-wl-lime">
                <SlideProgress active={index === active} paused={paused} onDone={advance} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
