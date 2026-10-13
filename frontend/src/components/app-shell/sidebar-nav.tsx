"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicUser } from "@contracts/auth";

import { Wordmark } from "@/components/wordmark";
import { accentBackground } from "@/lib/accents";
import { getInitials } from "@/lib/format";
import { clearSession, HOME_BY_ROLE } from "@/lib/session";

import { isActivePath, NAVIGATION } from "./navigation";

interface SidebarNavProps {
  user: PublicUser;
  onNavigate?: () => void;
}

export function SidebarNav({ user, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-5">
      <Link href={HOME_BY_ROLE[user.role]} onClick={onNavigate} aria-label="Meme'd home" className="px-3">
        <Wordmark className="text-2xl" />
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAVIGATION[user.role].map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-xs font-medium text-muted-foreground">{section.title}</span>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                >
                  <Icon className="size-4.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-ink ${accentBackground(user.name)}`}
        >
          {getInitials(user.name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
        </div>
        <button
          type="button"
          onClick={clearSession}
          aria-label="Log out"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOutIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
