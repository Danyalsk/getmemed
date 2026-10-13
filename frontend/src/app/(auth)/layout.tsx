import { ActivityIcon, LayersIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { FeaturedBrands } from "@/components/featured-brands";
import { CampaignFeed } from "@/components/campaign-feed";
import { Wordmark } from "@/components/wordmark";

const PROMISES = [
  {
    icon: LayersIcon,
    title: "Highest milestone",
    detail: "One payout per post, never stacked",
  },
  {
    icon: ShieldCheckIcon,
    title: "Budget-safe",
    detail: "Spend can't pass what you set",
  },
  {
    icon: ActivityIcon,
    title: "Live views",
    detail: "Every update tracked as it lands",
  },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid flex-1 grid-cols-1 lg:grid-cols-2">
      <SignedInRedirect />
      <div className="hidden border-r bg-[#0e0e0e] lg:block">
        <aside className="sticky top-0 flex h-svh flex-col gap-10 overflow-hidden p-12">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-14 -right-10 h-20 w-64 bg-wl-red" />
            <div className="absolute top-10 right-44 size-16 bg-wl-yellow" />
            <div className="absolute top-24 right-0 h-20 w-16 bg-wl-lavender" />
          </div>
          <Link href="/" aria-label="Meme'd home" className="relative w-fit">
            <Wordmark className="text-3xl" />
          </Link>

          <div className="relative flex flex-col gap-3">
            <p className="max-w-lg text-4xl leading-tight font-semibold tracking-tight">
              Pay creators for the reach they actually deliver.
            </p>
            <p className="max-w-md text-lg text-muted-foreground [@media(max-height:800px)]:hidden">
              Milestone payouts that track views in real time and never exceed
              your campaign budget.
            </p>
          </div>

          <CampaignFeed />

          <ul className="relative grid shrink-0 grid-cols-3 gap-6 border-t pt-6">
            {PROMISES.map((promise) => (
              <li key={promise.title} className="flex flex-col gap-1.5">
                <promise.icon className="size-4 text-wl-lime" />
                <span className="text-sm font-medium">{promise.title}</span>
                <span className="text-xs text-muted-foreground">
                  {promise.detail}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <div className="flex min-w-0 flex-col items-center justify-center gap-12 px-6 py-12">
        <Link href="/" aria-label="Meme'd home" className="lg:hidden">
          <Wordmark className="text-3xl" />
        </Link>
        <div className="w-full max-w-sm lg:max-w-md">{children}</div>
        <FeaturedBrands />
      </div>
    </main>
  );
}
