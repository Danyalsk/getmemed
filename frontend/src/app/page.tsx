import { ArrowRightIcon, Building2Icon, EyeIcon, ShieldCheckIcon, TrendingUpIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { CampaignTicker } from "@/components/campaign-ticker";
import { FloatingBrands } from "@/components/floating-brands";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { ACCENT_BACKGROUNDS, ACCENT_TEXTS } from "@/lib/accents";
import { formatRupees, formatViews } from "@/lib/format";

const MILESTONE_STEPS = [
  {
    views: 10_000,
    payout: 500,
    height: "sm:min-h-44",
    accent: "text-brand",
    bar: "bg-brand",
    glow: "border-t-brand from-brand/15",
  },
  {
    views: 50_000,
    payout: 2_000,
    height: "sm:min-h-56",
    accent: "text-pop-cyan",
    bar: "bg-pop-cyan",
    glow: "border-t-pop-cyan from-pop-cyan/15",
  },
  {
    views: 100_000,
    payout: 5_000,
    height: "sm:min-h-68",
    accent: "text-pop-violet",
    bar: "bg-pop-violet",
    glow: "border-t-pop-violet from-pop-violet/15",
  },
];
const TOP_STEP_VIEWS = 100_000;

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
              <ol className="grid gap-3 sm:grid-cols-3 sm:items-end">
                {MILESTONE_STEPS.map((step, index) => {
                  const previous = MILESTONE_STEPS[index - 1];
                  return (
                    <li
                      key={step.views}
                      className={`flex flex-col justify-between gap-6 rounded-2xl border border-t-2 bg-linear-to-b to-card to-60% p-5 ${step.glow} ${step.height}`}
                    >
                      <div className="flex flex-col gap-3">
                        <span className="flex items-center justify-between text-xs text-muted-foreground">
                          Step {index + 1}
                          <EyeIcon className="size-3.5" />
                        </span>
                        <span className="text-lg font-semibold tabular-nums">{formatViews(step.views)} views</span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className={`block h-full rounded-full ${step.bar}`}
                            style={{ width: `${(step.views / TOP_STEP_VIEWS) * 100}%` }}
                          />
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {previous && (
                          <span className="w-fit rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                            +{formatRupees(step.payout - previous.payout)} top-up
                          </span>
                        )}
                        <span className={`text-3xl font-semibold tracking-tight tabular-nums ${step.accent}`}>
                          {formatRupees(step.payout)}
                        </span>
                        <span className="text-xs text-muted-foreground">paid in total</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
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
