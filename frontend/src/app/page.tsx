import Image from "next/image";
import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

const SAMPLE_LADDER = [
  { views: "10K", payout: "₹500", color: "bg-wl-green" },
  { views: "50K", payout: "₹2,000", color: "bg-wl-purple" },
  { views: "100K", payout: "₹5,000", color: "bg-wl-pink" },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-14 px-6 py-16">
      <SignedInRedirect />
      <section className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Image src="/wldd-logo.jpg" alt="WLDD" width={60} height={36} className="h-auto w-[60px] mix-blend-multiply" />
          presents
        </div>
        <Wordmark className="text-7xl sm:text-8xl" />
        <p className="max-w-xl text-xl font-medium">
          Brands launch campaigns. Meme pages, clip accounts and hype pages post. Views climb the
          payout ladder and creators get paid, never a rupee over budget.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="ladder-heading" className="flex flex-col gap-4">
        <h2 id="ladder-heading" className="font-heading text-2xl">
          How the payout ladder works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {SAMPLE_LADDER.map(({ views, payout, color }, index) => (
            <li
              key={views}
              className={`${color} flex flex-col gap-1 rounded-xl border-2 border-ink p-5 shadow-brutal`}
              style={{ transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)` }}
            >
              <span className="text-sm font-bold uppercase">{views} views</span>
              <span className="font-heading text-3xl">{payout}</span>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground">
          A post earns the highest milestone it has crossed. Climb from 10K to 100K and you are
          topped up to ₹5,000, not paid ₹7,500.
        </p>
      </section>
    </main>
  );
}
