import Image from "next/image";

const FEATURED_BRANDS = [
  { name: "Amazon", logo: "amazon" },
  { name: "Myntra", logo: "myntra" },
  { name: "OnePlus", logo: "one-plus" },
  { name: "boAt", logo: "boat" },
  { name: "Tata Motors", logo: "tata-motors" },
  { name: "Xiaomi", logo: "xiaomi" },
  { name: "Audible", logo: "audible" },
  { name: "Philips", logo: "philips" },
  { name: "Fastrack", logo: "fastrack" },
  { name: "TVS", logo: "tvs" },
  { name: "Unacademy", logo: "unacademy" },
  { name: "Masters' Union", logo: "masters-union" },
];

export function FeaturedBrands() {
  return (
    <section aria-labelledby="featured-brands-heading" className="flex w-full max-w-xl flex-col items-center gap-5">
      <h2 id="featured-brands-heading" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        The kind of brands you&apos;ll work with
      </h2>
      <div className="flex w-full overflow-hidden mask-x-from-80%">
        <ul className="flex shrink-0 animate-[marquee_40s_linear_infinite] items-center gap-10 pr-10 motion-reduce:animate-none">
          {[...FEATURED_BRANDS, ...FEATURED_BRANDS].map((brand, index) => {
            const duplicate = index >= FEATURED_BRANDS.length;
            return (
              <li key={`${brand.logo}-${index}`} aria-hidden={duplicate} className="shrink-0">
                <Image
                  src={`/brands/${brand.logo}.png`}
                  alt={duplicate ? "" : brand.name}
                  width={720}
                  height={360}
                  sizes="112px"
                  className="h-14 w-28 object-contain opacity-80 transition-opacity hover:opacity-100"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
