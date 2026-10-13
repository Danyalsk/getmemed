import { cn } from "cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-3 items-center rounded-[0.32em] bg-brand px-[0.38em] pt-[0.1em] pb-[0.16em] leading-none font-extrabold tracking-tight text-ink lowercase shadow-[0.1em_0.12em_0_rgb(0_0_0/0.65)]",
        className,
      )}
    >
      meme’d
    </span>
  );
}
