import { cn } from "cn";

/** Meme'd wordmark as used on wldd.in: lime pixel type with a hard black drop shadow. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-pixel leading-none tracking-tight text-wl-lime uppercase [text-shadow:0.08em_0.08em_0_#000]",
        className,
      )}
    >
      Meme’d
    </span>
  );
}
