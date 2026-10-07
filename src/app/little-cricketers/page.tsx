import type { Metadata } from "next";
import { formatProgrammePrice, getProgramme, groupSizes, littleCricketersSlots } from "@/data/programmes";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";

const programme = getProgramme("little-cricketers")!;

export const metadata: Metadata = {
  title: "Little Cricketers — Cricket for Ages 4–6 in Harrow",
  description: `Little Cricketers at John Lyon School, Harrow on the Hill: soft-ball cricket for ages 4–6, ${programme.fixedTime}. ${formatProgrammePrice(programme)}.`,
  alternates: { canonical: "/little-cricketers" },
};

const focus = [
  { t: "Hitting", b: "Big swings with soft balls and plenty of goes." },
  { t: "Catching and throwing", b: "From bean bags to bouncy balls to real catches." },
  { t: "Moving", b: "Running, balance and agility, with lots of activity." },
  { t: "Games", b: "Simple team games that build confidence." },
];

const faqs = [
  { q: "My child has never played cricket. Is that OK?", a: "Completely. Little Cricketers is designed for children who are new to the game." },
  { q: "Do they need any kit?", a: "No. Comfortable clothes, trainers and a water bottle are all they need. We use soft balls and child-sized bats." },
  {
    q: "What happens when they're older?",
    a: "When they're ready, children move into our Development programme. Players are placed by ability, not just age.",
  },
];

export default function LittleCricketersPage() {
  return (
    <>
      <PageHero
        eyebrow="Little Cricketers · Ages 4–6"
        title="Their first cricket session should make them want another one."
        intro={<p>The perfect first step into cricket: soft ball, movement, fun and confidence for children aged 4–6, with brilliant coaches who love working with young children.</p>}
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
        image={{ alt: "Young children playing a soft-ball cricket game" }}
      >
        <div className="mt-8 inline-flex flex-wrap gap-x-6 gap-y-2 rounded-2xl border border-gold/25 bg-navy-900/70 px-5 py-4 text-cream">
          <span><strong className="text-gold">When:</strong> Sundays, 40-minute sessions at {littleCricketersSlots.join(", ").replace(/, ([^,]*)$/, " or $1")}</span>
          <span><strong className="text-gold">Price:</strong> {formatProgrammePrice(programme)}</span>
          <span><strong className="text-gold">Group size:</strong> max {groupSizes.littleCricketers}</span>
        </div>
      </PageHero>

      <Section tone="light">
        <SectionHeader eyebrow="What they'll do" title="Lots of activity, lots of fun." className="mb-12" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {focus.map((f, i) => (
            <Reveal key={f.t} delay={(i % 4) * 70} className="card-lift rounded-3xl bg-cream-200 p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 font-serif text-xl text-gold" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-4 text-2xl text-navy-950">{f.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{f.b}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-2">
          <Photo alt="Children playing a target throwing game" className="aspect-[16/10]" sizes="50vw" />
          <Photo alt="Young girl hitting a soft ball" className="aspect-[16/10]" tone="warm" sizes="50vw" />
        </div>
      </section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Questions" title="Good to know." />
          <FAQAccordion items={faqs} />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      </Section>

      <CTASection title="Save your Little Cricketer a place." body="Register your interest and you'll get priority booking when places open." />
    </>
  );
}
