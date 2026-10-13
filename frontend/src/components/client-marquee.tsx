const WLDD_CLIENTS = [
  "Amazon",
  "Myntra",
  "OnePlus",
  "boAt",
  "Tata Motors",
  "Xiaomi",
  "Audible",
  "Philips",
  "Fastrack",
  "TVS",
  "Unacademy",
  "Masters' Union",
];

const ACCENTS = ["bg-wl-lime", "bg-wl-yellow", "bg-wl-red", "bg-wl-lavender", "bg-wl-blue"];

function MarqueeRow({ clients, reverse }: { clients: readonly string[]; reverse: boolean }) {
  return (
    <div className="flex overflow-hidden mask-x-from-85%">
      <ul
        className={`flex shrink-0 animate-[marquee_45s_linear_infinite] gap-3 pr-3 motion-reduce:animate-none ${reverse ? "[animation-direction:reverse]" : ""}`}
      >
        {[...clients, ...clients].map((client, index) => (
          <li
            key={`${client}-${index}`}
            aria-hidden={index >= clients.length}
            className="flex items-center gap-2.5 rounded-full border bg-card/70 px-4 py-2 text-base font-semibold whitespace-nowrap text-foreground/85"
          >
            <span aria-hidden className={`size-2 ${ACCENTS[index % ACCENTS.length] ?? "bg-wl-lime"}`} />
            {client}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClientMarquee() {
  const half = Math.ceil(WLDD_CLIENTS.length / 2);
  return (
    <section aria-labelledby="clients-heading" className="flex flex-col gap-4">
      <h2 id="clients-heading" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Brands the WLDD team has worked with
      </h2>
      <div className="-mx-12 flex flex-col gap-3">
        <MarqueeRow clients={WLDD_CLIENTS.slice(0, half)} reverse={false} />
        <MarqueeRow clients={WLDD_CLIENTS.slice(half)} reverse />
      </div>
    </section>
  );
}
