import Image from "next/image";

const WLDD_CLIENTS = [
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

export function ClientLogos() {
  return (
    <section aria-labelledby="clients-heading" className="flex w-full max-w-xl flex-col items-center gap-5">
      <h2 id="clients-heading" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Brands the WLDD team has worked with
      </h2>
      <div className="flex w-full overflow-hidden mask-x-from-80%">
        <ul className="flex shrink-0 animate-[marquee_40s_linear_infinite] items-center gap-10 pr-10 motion-reduce:animate-none">
          {[...WLDD_CLIENTS, ...WLDD_CLIENTS].map((client, index) => {
            const duplicate = index >= WLDD_CLIENTS.length;
            return (
              <li key={`${client.logo}-${index}`} aria-hidden={duplicate} className="shrink-0">
                <Image
                  src={`/clients/${client.logo}.png`}
                  alt={duplicate ? "" : client.name}
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
