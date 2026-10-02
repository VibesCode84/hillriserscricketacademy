import type { Metadata } from "next";
import { getAcademy } from "@/data/academies";
import { coachesFor } from "@/data/coaches";
import { sessionsFor } from "@/data/sessions";
import { testimonialsFor } from "@/data/testimonials";
import { getAvailability } from "@/lib/booking";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SessionCard } from "@/components/SessionCard";
import { CoachCard } from "@/components/CoachCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { Photo } from "@/components/Photo";
import { CTASection } from "@/components/CTASection";

const academy = getAcademy("little-cricketers")!;

export const revalidate = 60;
export const metadata: Metadata = {
  title: { absolute: `${academy.seo.title} | Hillrisers` },
  description: academy.seo.description,
  alternates: { canonical: "/little-cricketers" },
};

const focus = [
  { t: "Hitting", b: "Big swings, soft balls and plenty of turns." },
  { t: "Catching", b: "Bean bags, bouncy balls, then real catches." },
  { t: "Throwing", b: "Aim, power and hitting the stumps." },
  { t: "Moving", b: "Running, balance, agility — lots of activity." },
  { t: "Games", b: "Simple team games with tons of smiles." },
  { t: "Confidence", b: "Praise for effort, and a sticker-worthy moment every week." },
];

const faqs = [
  { q: "My child has never played cricket. Is that okay?", a: "Completely. Little Cricketers is designed for children who are brand new to the game." },
  { q: "Do they need any kit?", a: "No. Just comfortable clothes, trainers and a water bottle. We provide soft balls and child-sized bats." },
  { q: "Do parents stay?", a: "Parents are welcome to stay and watch. For the youngest children we ask that a parent stays at the venue." },
  { q: "What happens when they’re older?", a: "Little Cricketers is the first step into the Hillrisers academy. When they’re ready, usually around age 7–8, we’ll recommend the right academy group." },
];

export default async function LittleCricketersPage() {
  const availability = await getAvailability();
  const times = sessionsFor("little-cricketers");
  const coach = coachesFor("little-cricketers");
  const [quote] = testimonialsFor("little-cricketers");

  return (
    <>
      <PageHero
        eyebrow="Little Cricketers · Ages 4–7"
        title="Their first cricket session should make them want another one."
        intro={<p>Fun, active sessions full of hitting, catching, throwing and games — with coaches who love working with young children.</p>}
        actions={
          <>
            <ButtonLink href="/book?discipline=little-cricketers" arrow className="group">Try Little Cricketers</ButtonLink>
            <ButtonLink href="#times" variant="secondary">Times &amp; details</ButtonLink>
          </>
        }
        image={academy.image}
      />

      <Section tone="light">
        <SectionHeader
          eyebrow="What they’ll do"
          title="Lots of activity. Lots of fun. Lots of first moments."
          intro={<p className="text-ink-muted">No jargon and no standing around in queues — just plenty of goes and plenty of encouragement.</p>}
          className="mb-14"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {focus.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 80} className="card-lift rounded-3xl bg-cream-200 p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 font-serif text-xl text-gold" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-4 text-3xl text-navy-950">{f.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{f.b}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-2">
          <Photo alt="Little Cricketers playing a target throwing game" className="aspect-[16/10]" sizes="50vw" />
          <Photo alt="Smiling young girl hitting a soft ball off a tee" className="aspect-[16/10]" tone="warm" sizes="50vw" />
        </div>
      </section>

      <Section tone="cream">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="The first step"
              title="Where the Hillrisers pathway begins."
              intro={
                <p className="text-ink-muted">
                  Little Cricketers builds the movement, coordination and confidence young players need. When they&rsquo;re ready, we&rsquo;ll
                  recommend the right next step into the full academy — so there&rsquo;s always somewhere to grow.
                </p>
              }
            />
          </div>
          {quote && <TestimonialCard t={quote} large />}
        </div>
      </Section>

      <Section tone="darker" id="times">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="When" title="Sunday mornings." />
            <div className="mt-10 grid gap-5">
              {times.map((s) => (
                <SessionCard key={s.id} session={s} availability={availability?.[s.id]} />
              ))}
            </div>
          </div>
          {coach[0] && (
            <div className="max-w-sm">
              <SectionHeader eyebrow="Your coach" title="Plenty of energy. Plenty of patience." />
              <div className="mt-10">
                <CoachCard coach={coach[0]} />
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Questions" title="Good to know." />
          <FAQAccordion items={faqs} />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      </Section>

      <CTASection
        title="Let them try it."
        body="One session is all it takes to see if they love it."
        primary={{ href: "/book?discipline=little-cricketers", label: "Try Little Cricketers" }}
        secondary={{ href: "/find-my-session", label: "Find My Session" }}
      />
    </>
  );
}
