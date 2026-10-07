import type { Metadata } from "next";
import { groupSizes, specialistSkills } from "@/data/programmes";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ProgrammeTable } from "@/components/ProgrammeTable";
import { CTASection, NotSureBanner } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Programmes & Prices — Junior Cricket Coaching in Harrow",
  description:
    "HillRisers programmes at John Lyon School: Early Risers (4–6), Development (7–11), Performance (10–15), girls-only groups, small groups and 1-to-1 coaching. Group programmes £30 per hour, with a 2026/27 offer of £25 per hour.",
  alternates: { canonical: "/programmes" },
};

const notes = [
  { t: "Placed by ability", b: "Players are placed by ability, not just age, and move up when they're ready." },
  {
    t: "Small groups",
    b: `Every programme is coached in small groups: a maximum of ${groupSizes.perNet} players per net, each with its own coach. Early Risers is our only larger group (maximum ${groupSizes.earlyRisers}).`,
  },
  { t: "Fielding every session", b: "Every session includes fielding, whatever the programme." },
  { t: "Session length", b: "Sessions may run for 1 hour, 90 minutes or 2 hours — we'll decide using what families tell us." },
];

export default function ProgrammesPage() {
  return (
    <>
      <PageHero
        eyebrow="Programmes and prices"
        title="Outstanding coaching at every stage."
        intro={<p>From first steps with a soft ball to elite hard-ball specialist nets — expertly coached in small groups, groups of three or 1-to-1.</p>}
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
      />
      <Section tone="light" className="!pt-14">
        <ProgrammeTable />
      </Section>
      <Section tone="cream">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader eyebrow="Specialist skills" title="Coached within every programme." />
            <ul className="mt-8 flex flex-wrap gap-2">
              {[...specialistSkills, "Fielding"].map((s) => (
                <li key={s} className="rounded-full border border-navy-950/15 bg-white px-4 py-2 text-navy-950">{s}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {notes.map((n, i) => (
              <Reveal key={n.t} delay={(i % 2) * 80} className="border-t border-navy-950/10 pt-5">
                <h3 className="text-2xl text-navy-950">{n.t}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{n.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="mt-14">
          <NotSureBanner tone="light" />
        </div>
      </Section>
      <CTASection />
    </>
  );
}
