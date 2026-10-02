import type { FAQ } from "@/data/faqs";

export function FAQAccordion({ items, tone = "light" }: { items: FAQ[]; tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <div className={`divide-y border-y ${light ? "divide-navy-950/10 border-navy-950/10" : "divide-cream/10 border-cream/10"}`}>
      {items.map((f) => (
        <details key={f.q} className="group py-1">
          <summary className={`flex cursor-pointer items-center justify-between gap-6 py-5 text-left font-serif text-[1.35rem] leading-snug ${light ? "text-navy-950" : "text-cream"}`}>
            {f.q}
            <span className={`relative h-4 w-4 shrink-0 ${light ? "text-gold-deep" : "text-gold"}`} aria-hidden="true">
              <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
              <span className="absolute left-1/2 top-0 h-4 w-px bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <p className={`max-w-3xl pb-6 leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(items: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
