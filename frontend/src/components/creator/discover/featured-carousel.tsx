"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { accentBackground } from "@/lib/accents";
import { formatRupees, formatRupeesCompact, formatViews, getInitials } from "@/lib/format";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const FEATURED_COUNT = 6;
const RESUME_AFTER_MS = 6000;

function Slide({ campaign, active, priority }: { campaign: Campaign; active: boolean; priority: boolean }) {
  const firstRung = campaign.milestones[0];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border bg-card sm:bg-muted">
      <div className="absolute inset-x-0 top-0 aspect-video overflow-hidden sm:inset-0 sm:aspect-auto">
        <div
          className={`absolute inset-0 transition-transform ease-out motion-reduce:transition-none ${active ? "scale-100 duration-[5000ms]" : "scale-105 duration-700"}`}
        >
          <CampaignCover campaign={campaign} sizes="(min-width: 1280px) 1400px, 100vw" priority={priority} />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-card to-transparent to-40% sm:hidden" />
      </div>
      <div className="absolute inset-0 hidden bg-linear-to-r from-black/85 via-black/40 to-transparent sm:block" />
      <div className="absolute inset-0 hidden bg-linear-to-t from-black/70 via-transparent to-transparent sm:block" />
      <div
        className={`absolute inset-x-5 bottom-5 flex flex-col gap-4 transition-[opacity,translate] duration-500 sm:inset-x-10 sm:bottom-10 sm:text-white md:flex-row md:items-end md:justify-between ${active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-60"}`}
      >
        <div className="flex max-w-xl flex-col gap-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`flex size-7 items-center justify-center rounded-md text-[10px] font-bold text-ink ${accentBackground(campaign.brand.name)}`}
            >
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
          tabIndex={active ? 0 : -1}
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold whitespace-nowrap text-ink transition-transform hover:scale-[1.03]"
        >
          View campaign <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export function FeaturedCarousel() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: FEATURED_COUNT, sort: "budget" }));
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const slides = data?.items ?? [];

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const holdAutoplay = () => {
    setInteracting(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteracting(false), RESUME_AFTER_MS);
  };

  const scrollToSlide = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index];
    if (!track || !(slide instanceof HTMLElement)) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  const syncActiveFromScroll = () => {
    const track = trackRef.current;
    const first = track?.children[0];
    if (!track || !(first instanceof HTMLElement)) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    setActive(Math.min(slides.length - 1, Math.round(track.scrollLeft / step)));
  };

  if (!data) return <Skeleton className="aspect-[4/5] w-full rounded-3xl sm:aspect-[21/9] sm:max-h-[560px]" />;
  if (slides.length === 0) return null;

  const paused = hovered || interacting;
  const go = (index: number) => {
    holdAutoplay();
    scrollToSlide((index + slides.length) % slides.length);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group/carousel relative flex flex-col gap-3"
    >
      <div
        ref={trackRef}
        onScroll={syncActiveFromScroll}
        onWheel={holdAutoplay}
        onTouchStart={holdAutoplay}
        onPointerDown={holdAutoplay}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((campaign, index) => (
          <div
            key={campaign._id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            className="aspect-[4/5] shrink-0 basis-[92%] snap-start sm:aspect-[21/9] sm:max-h-[560px] lg:basis-[94%]"
          >
            <Slide campaign={campaign} active={index === active} priority={index === 0} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous campaign"
        onClick={() => go(active - 1)}
        className="absolute top-[calc(50%-0.75rem)] left-3 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:flex"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next campaign"
        onClick={() => go(active + 1)}
        className="absolute top-[calc(50%-0.75rem)] right-[calc(6%+0.75rem)] hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:flex"
      >
        <ChevronRightIcon className="size-5" />
      </button>

      <div className="flex items-center justify-center gap-1.5">
        {slides.map((campaign, index) => (
          <button
            key={campaign._id}
            type="button"
            aria-label={`Show ${campaign.name}`}
            aria-current={index === active}
            onClick={() => go(index)}
            className={`relative h-1.5 overflow-hidden rounded-full bg-white/20 text-brand transition-[width] ${index === active ? "w-10" : "w-1.5 hover:bg-white/40"}`}
          >
            {index === active && (
              <span
                key={active}
                onAnimationEnd={() => scrollToSlide((active + 1) % slides.length)}
                className={`absolute inset-0 origin-left animate-[slide-progress_4s_linear] bg-current motion-reduce:animate-none ${paused ? "[animation-play-state:paused]" : ""}`}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
