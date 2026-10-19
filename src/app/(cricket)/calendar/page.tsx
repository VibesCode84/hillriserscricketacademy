import type { Metadata } from "next";
import { calendarTerms, type CalendarKind } from "@/data/calendar";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "2026/27 Calendar — Term Dates, Holidays and Closures",
  description:
    "The HillRisers 2026/27 calendar at John Lyon School, Harrow on the Hill: launch and trial week, term dates, school holidays, the Christmas shutdown and likely holiday arrangements.",
  alternates: { canonical: "/calendar" },
};

const kinds: Record<CalendarKind, { label: string; dot: string; badge: string }> = {
  launch: { label: "Launch", dot: "bg-gold", badge: "bg-gold/15 text-navy-950" },
  term: { label: "Weekly sessions", dot: "bg-navy-950", badge: "bg-navy-950 text-cream" },
  holiday: { label: "Holiday · TBC", dot: "bg-emerald-600", badge: "bg-emerald-600/10 text-emerald-800" },
  affected: { label: "Change of plan", dot: "bg-amber-500", badge: "bg-amber-500/15 text-amber-900" },
  shutdown: { label: "Closed", dot: "bg-red-600", badge: "bg-red-600/10 text-red-800" },
};

export default function CalendarPage() {
  return (
    <>
      <PageHero
        eyebrow="2026/27 calendar"
        title="The year at a glance."
        intro={
          <p>
            Term dates, school holidays and closures for our first year at John Lyon School. Holiday plans are still taking shape — tell us
            what you&rsquo;d like and we&rsquo;ll build around you.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>
            <ButtonLink href="/how-booking-works" variant="secondary">How booking works</ButtonLink>
          </>
        }
      />

      <Section tone="light">
        <SectionHeader eyebrow="Key" title="What each date means." className="mb-8" />
        <ul className="mb-14 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-muted">
          {Object.values(kinds).map((k) => (
            <li key={k.label} className="flex items-center gap-2">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${k.dot}`} />
              {k.label}
            </li>
          ))}
        </ul>

        <div className="space-y-16">
          {calendarTerms.map((t) => (
            <div key={t.term}>
              <h2 className="text-3xl text-navy-950 md:text-4xl">{t.term}</h2>
              <ol className="mt-6 divide-y divide-navy-950/10 border-y border-navy-950/10">
                {t.entries.map((e, i) => {
                  const k = kinds[e.kind];
                  return (
                    <Reveal as="li" key={e.id} delay={(i % 3) * 60} className="grid gap-3 py-6 md:grid-cols-[16rem_1fr] md:gap-10">
                      <div>
                        <p className="font-semibold text-navy-950">{e.dates}</p>
                        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${k.badge}`}>{k.label}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl text-navy-950">{e.title}</h3>
                        <p className="mt-1.5 max-w-2xl leading-relaxed text-ink-muted">{e.detail}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Dates may change. We&rsquo;ll give registered families plenty of notice of any change, and confirm holiday arrangements before
          booking opens.
        </p>
      </Section>
      <CTASection />
    </>
  );
}
