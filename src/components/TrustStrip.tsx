import { site } from "@/data/site";

const items = ["The area's best coaches", "Max six per net", "Girls-only pathway", "John Lyon School"];

export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-cream/80 ${className}`} aria-label="HillRisers at a glance">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-5">
          {i > 0 && <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />}
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Full-width band version used under the hero */
export function TrustBand() {
  const facts = [
    { k: "6", v: "Maximum players per net, each net with its own coach" },
    { k: "3", v: "Indoor nets at John Lyon in autumn and spring" },
    { k: site.ages, v: "Ages, placed by ability — not just age" },
  ];
  return (
    <section className="border-y border-gold/15 bg-navy-900" aria-label="HillRisers at a glance">
      <div className="container-x grid gap-px sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.k} className="py-8 pr-4 md:py-10">
            <p className="font-serif text-4xl text-gold md:text-5xl">{f.k}</p>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-slate">{f.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
