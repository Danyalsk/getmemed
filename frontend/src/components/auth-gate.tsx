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

function useRedirectTo(target: string | null): void {
  const router = useRouter();
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);
}

export function RequireSession({ role, children }: { role?: Role; children: ReactNode }) {
  const session = useSession();
  const wrongRole = session && role && session.user.role !== role;
  const target = session === null ? "/login" : wrongRole ? HOME_BY_ROLE[session.user.role] : null;
  useRedirectTo(target);

  if (session === undefined || target) return <PageLoader />;
  return children;
}

export function SignedInRedirect() {
  const session = useSession();
  useRedirectTo(session ? HOME_BY_ROLE[session.user.role] : null);
  return null;
}
