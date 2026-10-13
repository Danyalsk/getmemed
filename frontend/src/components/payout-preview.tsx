"use client";

import { useEffect, useState } from "react";

import type { Milestone } from "@contracts/campaign";

import { formatRupees, formatViews } from "@/lib/format";

const SAMPLE_LADDER: readonly Milestone[] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
  { views: 100_000, payout: 5_000 },
];
const TRACK_MAX_VIEWS = 120_000;
const CLIMB_MS = 9000;
const HOLD_MS = 2500;
const STATIC_VIEWS = 64_000;

function useClimbingViews(): number {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (reducedMotion) {
        setViews(STATIC_VIEWS);
        return;
      }
      const elapsed = (now - started) % (CLIMB_MS + HOLD_MS);
      const progress = Math.min(1, elapsed / CLIMB_MS);
      setViews(Math.round(TRACK_MAX_VIEWS * (1 - (1 - progress) ** 2)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return views;
}

export function PayoutPreview() {
  const views = useClimbingViews();
  const earned = SAMPLE_LADDER.filter((rung) => views >= rung.views).at(-1)?.payout ?? 0;
  const percent = (value: number) => `${(value / TRACK_MAX_VIEWS) * 100}%`;

  return (
    <figure
      aria-label="Example: a post earning as its views cross each milestone"
      className="flex w-full max-w-md flex-col gap-6 rounded-2xl border bg-card/90 p-6 shadow-2xl backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-10 grid-cols-2 overflow-hidden rounded-lg">
            <span className="bg-wl-yellow" />
            <span className="bg-wl-red" />
            <span className="bg-wl-lavender" />
            <span className="bg-wl-lime" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Summer Fizz Memes</span>
            <span className="text-xs text-muted-foreground">Instagram reel</span>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-wl-lime/15 px-2.5 py-1 text-xs font-medium text-wl-lime">
          <span className="size-1.5 animate-pulse rounded-full bg-wl-lime" /> Live
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Views</span>
          <span className="text-3xl font-semibold tracking-tight tabular-nums">{views.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Earned</span>
          <span className="text-3xl font-semibold tracking-tight text-wl-lime tabular-nums">{formatRupees(earned)}</span>
        </div>
      </div>

      <div className="relative pb-10">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-wl-lime" style={{ width: percent(views) }} />
        </div>
        {SAMPLE_LADDER.map((rung) => {
          const reached = views >= rung.views;
          return (
            <div
              key={rung.views}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5"
              style={{ left: percent(rung.views) }}
            >
              <span
                className={`size-2 rounded-full ring-4 ring-card transition-colors ${reached ? "bg-wl-lime" : "bg-muted-foreground/40"}`}
              />
              <span
                className={`text-xs font-medium whitespace-nowrap tabular-nums transition-colors ${reached ? "text-foreground" : "text-muted-foreground"}`}
              >
                {formatRupees(rung.payout)}
              </span>
              <span className="text-[11px] text-muted-foreground">{formatViews(rung.views)}</span>
            </div>
          );
        })}
      </div>

      <figcaption className="text-xs text-muted-foreground">
        Paid the highest milestone reached, never more than the campaign budget.
      </figcaption>
    </figure>
  );
}
