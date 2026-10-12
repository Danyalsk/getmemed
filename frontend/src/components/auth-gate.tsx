"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type { Role } from "@contracts/common";

import { HOME_BY_ROLE, useSession } from "@/lib/session";

function PageLoader() {
  return (
    <div role="status" className="flex flex-1 items-center justify-center p-16 text-muted-foreground">
      <LoaderCircleIcon className="size-6 animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function useRedirect(target: string | null): void {
  const router = useRouter();
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);
}

/** Renders children only for a signed-in user with the given role. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const session = useSession();
  const target =
    session === null ? "/login" : session && session.user.role !== role ? HOME_BY_ROLE[session.user.role] : null;
  useRedirect(target);

  if (session === undefined || target) return <PageLoader />;
  return children;
}

/** Sends signed-in users from public pages to their dashboard. */
export function SignedInRedirect() {
  const session = useSession();
  useRedirect(session ? HOME_BY_ROLE[session.user.role] : null);
  return null;
}
