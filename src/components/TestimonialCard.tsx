import type { Testimonial } from "@/data/testimonials";

export function TestimonialCard({ t, tone = "light", large = false }: { t: Testimonial; tone?: "light" | "dark"; large?: boolean }) {
  const light = tone === "light";
  return (
    <figure className={`relative flex h-full flex-col rounded-2xl p-7 md:p-9 ${light ? "bg-white" : "bg-navy-900"}`}>
      <svg viewBox="0 0 32 24" className="h-6 w-8 text-gold" fill="currentColor" aria-hidden="true">
        <path d="M0 24V14C0 6 4.5 1.3 12 0l1.4 3C9 4.4 6.8 7.4 6.6 11H12v13H0Zm19 0V14c0-8 4.5-12.7 12-14l1 3c-4.4 1.4-6.6 4.4-6.8 8H31v13H19Z" />
      </svg>
      <blockquote className={`mt-5 flex-1 font-serif leading-snug ${large ? "text-[1.75rem] md:text-[2.25rem]" : "text-[1.35rem]"} ${light ? "text-navy-950" : "text-cream"}`}>
        {t.quote}
      </blockquote>
      <figcaption className={`mt-6 text-sm ${light ? "text-ink-muted" : "text-slate"}`}>
        <span className={`font-semibold ${light ? "text-navy-950" : "text-cream"}`}>{t.parent}</span>
        {t.childLabel && <span> · {t.childLabel}</span>}
      </figcaption>
      {t.sample && process.env.NODE_ENV !== "production" && (
        <span className="absolute right-4 top-4 rounded bg-[#b3261e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Sample — replace
        </span>
      )}
    </figure>
  );
}
