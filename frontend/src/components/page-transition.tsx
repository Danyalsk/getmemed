import { ViewTransition, type ReactNode } from "react";

export const TRANSITION_TYPES = {
  forward: ["nav-forward"],
  back: ["nav-back"],
};

const PAGE_ANIMATIONS = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "page-fade",
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={PAGE_ANIMATIONS} exit={PAGE_ANIMATIONS} default="none">
      <div className="flex flex-col gap-8">{children}</div>
    </ViewTransition>
  );
}

export function SharedCampaignCover({ id, children }: { id: string; children: ReactNode }) {
  return (
    <ViewTransition name={`campaign-cover-${id}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
