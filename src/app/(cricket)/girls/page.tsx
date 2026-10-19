import type { Metadata } from "next";
import { getProgramme, specialistSkills } from "@/data/programmes";
import { ProgrammePrice } from "@/components/ProgrammeTable";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "Girls Cricket Coaching in Harrow — Girls-Only Pathway",
  description:
    "A girls-only cricket pathway at John Lyon School, Harrow on the Hill: Girls Development (8–11) and Girls Performance (11–15). Beginners and experienced players welcome.",
  alternates: { canonical: "/girls" },
};

const groups = ["girls-development", "girls-performance"].map((k) => getProgramme(k)!);

const points = [
  { t: "Beginners welcome", b: "Never played before? That's fine. Girls are placed by ability, not just age." },
  { t: "Experienced players welcome", b: "Already playing for school or club? Specialist coaching will stretch you." },
  { t: "Girls only", b: "The same formats as our mixed groups, in a girls-only environment." },
  { t: "Mixed groups too", b: "Girls are welcome in every mixed group as well — choose what suits." },
];

const faqs = [
  {
    q: "My daughter has never played. Is that OK?",
    a: "Yes. Players are placed by ability, not just age, so beginners start at the right level and move up when they're ready.",
  },
  {
    q: "Can girls join the mixed groups?",
    a: "Yes. Girls are welcome in every group. Let us know on the interest form whether you'd like girls-only sessions.",
  },
  {
    q: "When will the girls' sessions run?",
    a: "We're building the timetable around the families who register, so tell us when your daughter can attend on the interest form.",
  },
];

export default function GirlsPage() {
  return (
    <>
      <PageHero
        eyebrow="Girls cricket"
        title="The best place for girls to play cricket."
        intro={<p>Outstanding specialist coaching in a girls-only environment — from first steps with a hard ball to performance nets.</p>}
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
        image={photos.girlBatting}
      />

      <Section tone="light">
        <SectionHeader eyebrow="Girls-only groups" title="Two programmes, girls only." className="mb-10" />
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((g) => (
            <Reveal key={g.key} className="rounded-3xl bg-navy-950 p-7 text-cream md:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">Ages {g.ages}</p>
              <h3 className="mt-3 text-3xl">{g.name}</h3>
              <p className="mt-2 text-slate">{g.summary}</p>
              <p className="mt-6">
                <ProgrammePrice p={g} light={false} align="left" />
              </p>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <Reveal key={p.t} delay={(i % 4) * 70} className="border-t border-navy-950/10 pt-5">
              <h3 className="text-2xl text-navy-950">{p.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{p.b}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-ink-muted">
          Specialist skills: {specialistSkills.join(", ").toLowerCase()} — with fielding in every session.
        </p>
      </Section>

      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-2">
          <Photo alt="Girl bowling in an indoor net" className="aspect-[16/10]" sizes="50vw" />
          <Photo alt="Girls fielding during a session" className="aspect-[16/10]" tone="warm" sizes="50vw" />
        </div>
      </section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Questions" title="Good to know." />
          <FAQAccordion items={faqs} />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      </Section>

      <CTASection title="Help us shape the girls' timetable." />
    </>
  );
}
