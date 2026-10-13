"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PLATFORM_LABELS } from "@contracts/common";

import { CampaignCover } from "@/components/campaign-cover";
import { TRANSITION_TYPES } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupees, formatRupeesCompact, formatViews, getInitials } from "@/lib/format";
import { queries } from "@/lib/queries";

import { campaignHref } from "../creator-campaign-card";

const ROTATE_MS = 7000;
const FEATURED_COUNT = 5;

export function FeaturedCarousel() {
  const { data } = useQuery(queries.liveCampaigns({ page: 1, pageSize: FEATURED_COUNT, sort: "budget" }));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = data?.items ?? [];

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (!data) return <Skeleton className="aspect-[21/9] min-h-80 w-full rounded-3xl" />;
  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative aspect-[21/9] min-h-80 w-full overflow-hidden rounded-3xl border bg-muted"
    >
      {slides.map((campaign, index) => {
        const firstRung = campaign.milestones[0];
        const visible = index === active;
        return (
          <div
            key={campaign._id}
            aria-hidden={!visible}
            className={`absolute inset-0 transition-opacity duration-700 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <CampaignCover campaign={campaign} sizes="(min-width: 1280px) 1200px, 100vw" priority={index === 0} />
            <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex flex-col gap-4 text-white sm:inset-x-10 sm:bottom-10 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-xl flex-col gap-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex size-7 items-center justify-center rounded-md bg-wl-yellow text-[10px] font-bold text-wl-ink">
                    {getInitials(campaign.brand.name)}
                  </span>
                  {campaign.brand.name}
                </span>
                <h2 className="text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">{campaign.name}</h2>
                <p className="text-sm text-white/85 sm:text-base">
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
      })}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 backdrop-blur">
        {slides.map((campaign, index) => (
          <button
            key={campaign._id}
            type="button"
            aria-label={`Show ${campaign.name}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </section>
  );
}
