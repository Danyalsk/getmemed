"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Role } from "@contracts/common";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/wordmark";
import { initials } from "@/lib/format";
import { clearSession, HOME_BY_ROLE, useSession } from "@/lib/session";

const NAV: Record<Role, readonly { href: string; label: string }[]> = {
  brand: [{ href: "/brand", label: "Campaigns" }],
  creator: [
    { href: "/creator", label: "Discover" },
    { href: "/creator/posts", label: "My posts" },
  ],
};

export function SiteHeader() {
  const session = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href={session ? HOME_BY_ROLE[session.user.role] : "/"} aria-label="Meme'd home">
          <Wordmark className="text-xl" />
        </Link>
        {session && (
          <>
            <nav aria-label="Main" className="flex items-center gap-1">
              {NAV[session.user.role].map(({ href, label }) => {
                const active = href === pathname || (href !== HOME_BY_ROLE[session.user.role] && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-auto gap-2 px-2" aria-label="Account menu">
                  <span className="flex size-7 items-center justify-center rounded-full bg-wl-lavender text-xs font-semibold text-wl-ink">
                    {initials(session.user.name)}
                  </span>
                  <span className="hidden text-sm sm:inline">{session.user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span>{session.user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{session.user.email}</span>
                  <span className="text-xs font-normal text-muted-foreground capitalize">{session.user.role} account</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={clearSession}>
                  <LogOutIcon /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
}
