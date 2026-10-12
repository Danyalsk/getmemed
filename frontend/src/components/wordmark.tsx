import type { CSSProperties } from "react";

import { cn } from "cn";

// Letters stagger up and down like the WLDD logo.
const LETTERS = [
  { char: "M", color: "var(--wl-green)", offset: "0em" },
  { char: "E", color: "var(--wl-purple)", offset: "0.12em" },
  { char: "M", color: "var(--wl-pink)", offset: "-0.06em" },
  { char: "E", color: "var(--wl-yellow)", offset: "0.08em" },
  { char: "’", color: "var(--ink)", offset: "-0.04em" },
  { char: "D", color: "var(--wl-green)", offset: "0.04em" },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      aria-label="Meme'd"
      role="img"
      className={cn("inline-flex font-heading leading-none tracking-tight", className)}
    >
      {LETTERS.map(({ char, color, offset }, index) => (
        <span
          key={index}
          aria-hidden
          className="wordmark-letter"
          style={{ "--letter-color": color, transform: `translateY(${offset})` } as CSSProperties}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
