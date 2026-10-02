import type { Metadata } from "next";
import { coaches } from "@/data/coaches";
import { PageHero } from "@/components/Hero";
import { Section, SectionHeader } from "@/components/Section";
import { CoachCard } from "@/components/CoachCard";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Our Coaches — Specialist Junior Cricket Coaches in Harrow",
  description:
    "Meet the HillRisers coaching team: specialist batting, seam, spin, girls and foundation coaches. DBS checked, with a lead coach, assistant and two helpers in every session.",
  alternates: { canonical: "/coaches" },
};

const model = [
  { k: "1", t: "Lead Coach", b: "Plans the session and leads the key technical work." },
  { k: "1", t: "Assistant Coach", b: "Runs a second station so players get more turns and feedback." },
  { k: "2", t: "Junior Helpers", b: "Feed, field and encourage — and act as great role models." },
];

export default function CoachesPage() {
  return (
    <>
      <PageHero
        eyebrow="The coaching team"
        title="Our coaches are our biggest asset."
        intro={<p>Specialists in what your child wants to improve — and people who remember their name, their game and what they worked on last week.</p>}
      />
      <Section tone="light">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 80}>
              <CoachCard coach={c} tone="light" />
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tone="darker">
        <SectionHeader eyebrow="Every academy session" title="Four coaches. Eighteen players, maximum." className="mb-14" />
        <div className="grid gap-6 md:grid-cols-3">
          {model.map((m, i) => (
            <Reveal key={m.t} delay={i * 80} className="rounded-2xl border border-cream/10 bg-navy-900 p-7">
              <p className="font-serif text-6xl text-gold">{m.k}</p>
              <h3 className="mt-3 text-2xl text-cream">{m.t}</h3>
              <p className="mt-2 leading-relaxed text-slate">{m.b}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm text-slate">
          All coaches and helpers are DBS checked and follow the academy&rsquo;s safeguarding policy.
        </p>
      </Section>
      <CTASection />
    </>
  );
}
