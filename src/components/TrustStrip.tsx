const items = ["Ages 4–14", "Specialist Coaches", "Girls Academy", "John Lyon School"];

export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-cream/80 ${className}`} aria-label="Why families choose HillRisers">
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
    { k: "4–14", v: "Junior players, from first swing to confident cricketer" },
    { k: "18", v: "Maximum players in every academy group" },
    { k: "4", v: "Coaches per session: lead, assistant and two helpers" },
    { k: "90", v: "Minutes of purposeful, structured coaching" },
  ];
  return (
    <section className="border-y border-gold/15 bg-navy-900" aria-label="The HillRisers academy at a glance">
      <div className="container-x grid grid-cols-2 gap-px lg:grid-cols-4">
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
