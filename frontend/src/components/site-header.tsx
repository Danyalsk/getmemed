"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { clearSession, HOME_BY_ROLE, useSession } from "@/lib/session";

export function SiteHeader() {
  const session = useSession();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href={session ? HOME_BY_ROLE[session.user.role] : "/"} aria-label="Meme'd home">
          <Wordmark className="text-3xl" />
        </Link>
        {session && (
          <div className="flex items-center gap-3">
            <span className="hidden font-semibold sm:inline">{session.user.name}</span>
            <Badge variant={session.user.role === "brand" ? "purple" : "green"} className="capitalize">
              {session.user.role}
            </Badge>
            <Button variant="outline" size="sm" onClick={clearSession}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
