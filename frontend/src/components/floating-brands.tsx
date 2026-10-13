import Image from "next/image";

import { FEATURED_BRANDS } from "./featured-brands";

const SPOTS = [
  { top: "6%", left: "8%", size: "h-12", opacity: "opacity-40", rotate: -8, seconds: 9 },
  { top: "14%", left: "58%", size: "h-9", opacity: "opacity-25", rotate: 6, seconds: 11 },
  { top: "30%", left: "30%", size: "h-14", opacity: "opacity-35", rotate: -3, seconds: 10 },
  { top: "38%", left: "74%", size: "h-10", opacity: "opacity-30", rotate: 9, seconds: 12 },
  { top: "52%", left: "4%", size: "h-9", opacity: "opacity-25", rotate: 5, seconds: 8 },
  { top: "58%", left: "46%", size: "h-12", opacity: "opacity-40", rotate: -7, seconds: 13 },
  { top: "72%", left: "70%", size: "h-9", opacity: "opacity-30", rotate: -4, seconds: 10 },
  { top: "80%", left: "18%", size: "h-11", opacity: "opacity-35", rotate: 7, seconds: 11 },
  { top: "88%", left: "52%", size: "h-8", opacity: "opacity-25", rotate: -9, seconds: 9 },
  { top: "22%", left: "78%", size: "h-8", opacity: "opacity-25", rotate: 4, seconds: 12 },
];

export function FloatingBrands() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-10 right-0 hidden w-[46%] lg:block">
      {FEATURED_BRANDS.map((brand, index) => {
        const spot = SPOTS[index % SPOTS.length];
        if (!spot) return null;
        return (
          <span
            key={brand.logo}
            className="absolute animate-[brand-float_ease-in-out_infinite_alternate] motion-reduce:animate-none"
            style={{
              top: spot.top,
              left: spot.left,
              rotate: `${spot.rotate}deg`,
              animationDuration: `${spot.seconds}s`,
              animationDelay: `-${index * 1.3}s`,
            }}
          >
            <Image
              src={`/brands/${brand.logo}.svg`}
              alt=""
              width={240}
              height={80}
              unoptimized
              className={`w-auto ${spot.size} ${spot.opacity}`}
            />
          </span>
        );
      })}
    </div>
  );
}
