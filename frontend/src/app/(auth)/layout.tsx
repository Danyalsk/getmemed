import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { ClientMarquee } from "@/components/client-marquee";
import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <SignedInRedirect />
      <aside className="relative hidden overflow-hidden border-r bg-[#0e0e0e] p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="Meme'd home">
          <Wordmark className="text-3xl" />
        </Link>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-28 -right-16 h-40 w-72 bg-wl-red" />
          <div className="absolute top-20 right-40 h-24 w-24 bg-wl-yellow" />
          <div className="absolute top-52 right-0 h-56 w-24 bg-wl-lavender" />
        </div>
        <div className="relative flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <p className="max-w-md text-3xl leading-tight font-semibold tracking-tight">
              Pay creators for the reach they actually deliver.
            </p>
            <p className="max-w-md text-muted-foreground">
              Milestone payouts that track views in real time and never exceed your campaign budget.
            </p>
          </div>
          <ClientMarquee />
        </div>
        <p className="relative text-xs text-muted-foreground">A WLDD company</p>
      </aside>
      <div className="flex flex-col items-center justify-center gap-8 px-6 py-12">
        <Link href="/" aria-label="Meme'd home" className="lg:hidden">
          <Wordmark className="text-3xl" />
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
