import { ViewTransition, type ReactNode } from "react";

/**
 * Transition types attached to <Link transitionTypes>. Drilling into a detail
 * page slides forward, the back link slides back, and every other navigation
 * (tabs, auth redirects) gets a soft fade-and-lift.
 */
export const TRANSITION = {
  forward: ["nav-forward"],
  back: ["nav-back"],
};

const PAGE_ANIMATIONS = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "page-fade",
};

/** Wrap each page's content (not layouts: layouts persist, so enter/exit never fire there). */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={PAGE_ANIMATIONS} exit={PAGE_ANIMATIONS} default="none">
      <div className="flex flex-col gap-8">{children}</div>
    </ViewTransition>
  );
}

/** Same `id` on the grid card and the campaign hero makes the cover photo morph between them. */
export function SharedCover({ id, children }: { id: string; children: ReactNode }) {
  return (
    <ViewTransition name={`campaign-cover-${id}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
