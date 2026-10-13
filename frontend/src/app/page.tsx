import { ArrowRightIcon, Building2Icon, FlameIcon, ShieldCheckIcon, TrendingUpIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { CampaignTicker } from "@/components/campaign-ticker";
import { FloatingBrands } from "@/components/floating-brands";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { ACCENT_BACKGROUNDS, ACCENT_TEXTS } from "@/lib/accents";
import { formatRupees, formatViews } from "@/lib/format";

const LADDER_RUNGS = [
  {
    views: 100_000,
    payout: 5_000,
    flame: "size-6 text-brand",
    node: "border-brand shadow-[0_0_28px_-2px_var(--color-brand)]",
    amount: "text-brand",
  },
  {
    views: 50_000,
    payout: 2_000,
    flame: "size-5 text-pop-orange",
    node: "border-pop-orange shadow-[0_0_20px_-4px_var(--color-pop-orange)]",
    amount: "text-pop-orange",
  },
  {
    views: 10_000,
    payout: 500,
    flame: "size-4 text-pop-orange/70",
    node: "border-pop-orange/50 shadow-[0_0_12px_-6px_var(--color-pop-orange)]",
    amount: "text-foreground",
  },
];

const AUDIENCES = [
  {
    icon: Building2Icon,
    title: "For brands",
    points: [
      "Set a budget and a milestone ladder",
      "Pause, resume or close any time",
      "See spend and remaining budget live",
    ],
  },
  {
    icon: UserRoundIcon,
    title: "For creators",
    points: ["Browse live campaigns", "Submit your Instagram or YouTube post", "Get paid as views cross milestones"],
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SignedInRedirect />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Wordmark className="text-2xl" />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <PageTransition>
        <main className="flex flex-1 flex-col">
          <section className="relative overflow-hidden">
            <FloatingBrands />
            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 lg:py-28">
              <p className="text-sm font-medium text-brand">Creator campaigns, paid on performance</p>
              <h1 className="max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
                Pay for reach, not for promises.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Brands launch campaigns with a milestone payout ladder. Meme pages, clip accounts and hype pages post,
                and every rupee paid is tied to real views and capped by your budget.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Create an account <ArrowRightIcon />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">I already have one</Link>
                </Button>
              </div>
            </div>
          </section>

          <CampaignTicker />

          <section className="border-y bg-[#0e0e0e]">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col gap-3">
                <TrendingUpIcon className="size-6 text-pop-cyan" />
                <h2 className="text-2xl font-semibold tracking-tight">How payouts work</h2>
                <p className="text-muted-foreground">
                  A post earns the highest milestone it has crossed. Moving from 10K to 100K views tops the creator up
                  to ₹5,000 in total, never the sum of every milestone.
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheckIcon className="size-4 text-brand" /> Total payouts can never exceed the campaign
                  budget.
                </p>
              </div>
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute top-6 bottom-6 left-6 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-linear-to-t from-muted via-pop-orange to-brand"
                >
                  <span className="absolute inset-x-0 h-16 animate-[heat-climb_2.6s_ease-in_infinite] rounded-full bg-linear-to-t from-transparent via-white/80 to-transparent motion-reduce:hidden" />
                </span>
                <ol aria-label="Example payout ladder" className="relative flex flex-col gap-4">
                  {LADDER_RUNGS.map((rung, index) => {
                    const below = LADDER_RUNGS[index + 1];
                    return (
                      <li key={rung.views} className="flex items-center gap-4">
                        <span
                          className={`flex size-12 shrink-0 items-center justify-center rounded-full border-2 bg-card ${rung.node}`}
                        >
                          <FlameIcon className={rung.flame} />
                        </span>
                        <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl border bg-card/70 px-4 py-3 backdrop-blur">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatViews(rung.views)} views{index === 0 && " · max payout"}
                            </span>
                            <span className={`text-2xl font-semibold tracking-tight tabular-nums ${rung.amount}`}>
                              {formatRupees(rung.payout)}
                            </span>
                          </div>
                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground tabular-nums">
                            +{formatRupees(rung.payout - (below?.payout ?? 0))}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                  <li className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center">
                      <span className="size-3 rounded-full bg-muted-foreground/60 ring-4 ring-background" />
                    </span>
                    <span className="text-sm text-muted-foreground">Post goes live · ₹0</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
            {AUDIENCES.map(({ icon: Icon, title, points }, index) => (
              <div key={title} className="flex flex-col gap-4 rounded-xl border bg-card p-6">
                <Icon className={`size-6 ${ACCENT_TEXTS[index + 2]}`} />
                <h3 className="text-xl font-semibold">{title}</h3>
                <ul className="flex flex-col gap-2 text-muted-foreground">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span aria-hidden className={`size-1.5 rounded-full ${ACCENT_BACKGROUNDS[index + 2]}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </main>
      </PageTransition>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <Wordmark className="text-base" />
          <span>Pay for reach, not for promises.</span>
        </div>
      </footer>
    </div>
  );
}
