"use client";

import { MenuIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Wordmark } from "@/components/wordmark";
import { useSession } from "@/lib/session";

import { SidebarNav } from "./sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      {session && (
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-background/80 backdrop-blur lg:block">
          <SidebarNav user={session.user} />
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/85 px-4 backdrop-blur lg:hidden"
          style={{ viewTransitionName: "site-header" }}
        >
          <Wordmark className="text-xl" />
          {session && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarNav user={session.user} onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
        </header>
        <main className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
