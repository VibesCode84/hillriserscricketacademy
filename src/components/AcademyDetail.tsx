import type { Academy } from "@/data/academies";
import { coachesFor } from "@/data/coaches";
import { sessionsFor } from "@/data/sessions";
import { testimonialsFor } from "@/data/testimonials";
import { faqGroups } from "@/data/faqs";
import type { SessionAvailability } from "@/lib/booking";
import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";
import { CoachCard } from "./CoachCard";
import { SessionCard } from "./SessionCard";
import { PriceCard } from "./PriceCard";
import { FAQAccordion, faqJsonLd } from "./FAQAccordion";
import { TestimonialCard } from "./TestimonialCard";
import { NotSureBanner } from "./CTASection";

export function LearnList({ items, tone = "light" }: { items: string[]; tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal as="li" key={item} delay={i * 50} className={`flex items-baseline gap-4 border-b py-4 ${light ? "border-navy-950/10" : "border-cream/10"}`}>
          <span className={`font-serif text-lg ${light ? "text-gold-deep" : "text-gold"}`}>{String(i + 1).padStart(2, "0")}</span>
          <span className={`text-lg ${light ? "text-navy-950" : "text-cream"}`}>{item}</span>
        </Reveal>
      ))}
    </ul>
  );
}

export function HowItWorks({ steps }: { steps: Academy["howItWorks"] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 80} className="rounded-2xl border border-cream/10 bg-navy-900 p-6">
          <span className="font-serif text-4xl text-gold">{i + 1}</span>
          <h3 className="mt-4 text-2xl text-cream">{s.title}</h3>
          <p className="mt-3 leading-relaxed text-slate">{s.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/** Sections 2–10 of the session page template. */
export function AcademyDetail({
  academy,
  availability,
}: {
  academy: Academy;
  availability: Record<string, SessionAvailability> | null;
}) {
  const coaches = coachesFor(academy.key);
  const times = sessionsFor(academy.key);
  const [testimonial] = testimonialsFor(academy.key);
  const generalFaqs = faqGroups[0].items.slice(0, 2).concat(faqGroups[2].items.slice(0, 1));
  const faqs = [...academy.faqs, ...generalFaqs];

  return (
    <>
      {/* What your child will learn */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeader eyebrow="What your child will learn" title="Purposeful coaching, every session." />
          <LearnList items={academy.learn} />
        </div>
      </Section>

      {/* How sessions work */}
      <Section tone="darker">
        <SectionHeader
          eyebrow="How sessions work"
          title="90 minutes, four coaches, small working groups."
          intro={<p className="text-slate">Every session follows a clear structure, so players get more turns, more feedback and a reason for every drill.</p>}
          className="mb-14"
        />
        <HowItWorks steps={academy.howItWorks} />
      </Section>

      {/* Who it is for + testimonial */}
      <Section tone="cream">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Who it is for" title={`Is ${academy.name} right for my child?`} />
            <ul className="mt-8 space-y-4">
              {academy.whoFor.map((w) => (
                <li key={w} className="flex gap-4 text-lg text-navy-950">
                  <svg viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0 text-gold-deep" fill="none" aria-hidden="true">
                    <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-ink-muted">
              {academy.ageLabel} · {academy.levelLabel}. Girls are welcome in every academy.
            </p>
          </div>
          {testimonial && (
            <Reveal delay={100}>
              <TestimonialCard t={testimonial} large />
            </Reveal>
          )}
        </div>
      </Section>

      {/* Coaches */}
      {coaches.length > 0 && (
        <Section tone="light">
          <SectionHeader eyebrow="Your coaches" title="Specialists in what your child wants to improve." className="mb-12" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coaches.map((c) => (
              <CoachCard key={c.id} coach={c} tone="light" />
            ))}
          </div>
        </Section>
      )}

      {/* Session times + price */}
      <Section tone="darker" id="times">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeader eyebrow="Session times" title="When it runs." />
            <div className="mt-10 grid gap-5">
              {times.length ? (
                times.map((s) => <SessionCard key={s.id} session={s} availability={availability?.[s.id]} />)
              ) : (
                <p className="text-slate">New times are being added — register your interest and we&rsquo;ll let you know first.</p>
              )}
            </div>
          </div>
          <div>
            <SectionHeader eyebrow="Price" title="What’s included." />
            <PriceCard className="mt-10" ctaHref={`/book?discipline=${academy.key}`} />
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader eyebrow="Questions" title="Good to know." />
          </div>
          <div>
            <FAQAccordion items={faqs} />
            <div className="mt-10">
              <NotSureBanner tone="light" />
            </div>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      </Section>
    </>
  );
}
