"use client";

import { CircleCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

const SLOW_AFTER_MS = 2500;
const RETRY_EVERY_MS = 3000;
const READY_VISIBLE_MS = 2500;

type WakeState = "checking" | "waking" | "ready" | "hidden";

const PIXEL_COLORS = ["bg-brand", "bg-pop-cyan", "bg-pop-pink"];

function formatElapsed(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ServerWakeNotice() {
  const [state, setState] = useState<WakeState>("checking");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => setState((current) => (current === "checking" ? "waking" : current)), SLOW_AFTER_MS);

    async function waitForServer(): Promise<void> {
      while (!cancelled) {
        try {
          await api.health();
          clearTimeout(slowTimer);
          setState((current) => (current === "waking" ? "ready" : "hidden"));
          return;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, RETRY_EVERY_MS));
        }
      }
    }

    void waitForServer();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  useEffect(() => {
    if (state === "waking") {
      const ticker = setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
      return () => clearInterval(ticker);
    }
    if (state === "ready") {
      const hide = setTimeout(() => setState("hidden"), READY_VISIBLE_MS);
      return () => clearTimeout(hide);
    }
  }, [state]);

  if (state === "checking" || state === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md animate-in items-center gap-4 rounded-2xl border bg-popover/95 p-4 shadow-2xl backdrop-blur fade-in-0 slide-in-from-bottom-4 sm:bottom-6"
    >
      {state === "waking" ? (
        <>
          <span aria-hidden className="flex shrink-0 items-end gap-1">
            {PIXEL_COLORS.map((color, index) => (
              <span
                key={color}
                className={`size-2.5 animate-bounce ${color} motion-reduce:animate-none`}
                style={{ animationDelay: `${index * 150}ms` }}
              />
            ))}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium">Waking up the server</span>
            <span className="text-xs text-muted-foreground">
              The API sleeps when nobody&apos;s using it. It&apos;s usually back within a minute.
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatElapsed(elapsed)}</span>
        </>
      ) : (
        <>
          <CircleCheckIcon className="size-5 shrink-0 text-brand" />
          <span className="text-sm font-medium">Server is ready</span>
        </>
      )}
    </div>
  );
}
