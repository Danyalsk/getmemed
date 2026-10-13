"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ScrollRowProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ScrollRow({ title, description, children }: ScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="icon" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}>
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline" size="icon" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}>
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 -mt-2 -mb-6 gap-4 overflow-x-auto px-4 pt-2 pb-8 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}
