import Image from "next/image";

export const FEATURED_BRANDS = [
  { name: "Zing Beverages", logo: "zing" },
  { name: "Kraft Arena Games", logo: "kraft-arena" },
  { name: "Masala Monk Foods", logo: "masala-monk" },
  { name: "Kadak Chai Co.", logo: "kadak-chai" },
  { name: "Pulse Fitness", logo: "pulse" },
  { name: "Orbit Wallet", logo: "orbit" },
  { name: "Neon Nights Festival", logo: "neon-nights" },
  { name: "Nimbus Audio", logo: "nimbus" },
  { name: "Lumen Skincare", logo: "lumen" },
  { name: "Byteside Media", logo: "byteside" },
];

export function FeaturedBrands() {
  return (
    <section aria-labelledby="featured-brands-heading" className="flex w-full max-w-xl flex-col items-center gap-5">
      <h2 id="featured-brands-heading" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Brands running campaigns on Meme&apos;d
      </h2>
      <div className="flex w-full overflow-hidden mask-x-from-80%">
        <ul className="flex shrink-0 animate-[marquee_40s_linear_infinite] items-center gap-10 pr-10 motion-reduce:animate-none">
          {[...FEATURED_BRANDS, ...FEATURED_BRANDS].map((brand, index) => {
            const duplicate = index >= FEATURED_BRANDS.length;
            return (
              <li key={`${brand.logo}-${index}`} aria-hidden={duplicate} className="shrink-0">
                <Image
                  src={`/brands/${brand.logo}.svg`}
                  alt={duplicate ? "" : brand.name}
                  width={240}
                  height={80}
                  unoptimized
                  className="h-12 w-36 object-contain opacity-80 transition-opacity hover:opacity-100"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
