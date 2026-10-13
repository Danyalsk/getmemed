import { ArrowRightIcon, Building2Icon, ShieldCheckIcon, TrendingUpIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { CampaignTicker } from "@/components/campaign-ticker";
import { FloatingBrands } from "@/components/floating-brands";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { ACCENT_BACKGROUNDS, ACCENT_TEXTS } from "@/lib/accents";
import { Wordmark } from "@/components/wordmark";

const SAMPLE_MILESTONES = [
  { views: "10K views", payout: "₹500" },
  { views: "50K views", payout: "₹2,000" },
  { views: "100K views", payout: "₹5,000" },
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
              <ol className="grid gap-3 sm:grid-cols-3">
                {SAMPLE_MILESTONES.map(({ views, payout }, index) => (
                  <li key={views} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
                    <span className="text-xs text-muted-foreground">Milestone {index + 1}</span>
                    <span className="text-sm">{views}</span>
                    <span className={`text-2xl font-semibold ${ACCENT_TEXTS[index % ACCENT_TEXTS.length]}`}>{payout}</span>
                  </li>
                ))}
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
