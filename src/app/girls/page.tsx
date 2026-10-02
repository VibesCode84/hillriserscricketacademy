import type { Metadata } from "next";
import { getAcademy, specialistAcademies } from "@/data/academies";
import { coachesFor } from "@/data/coaches";
import { testimonialsFor } from "@/data/testimonials";
import { getAvailability } from "@/lib/booking";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { WhenItRuns } from "@/components/WhenItRuns";
import { AcademyCard } from "@/components/AcademyCard";
import { CoachCard } from "@/components/CoachCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { Pathway } from "@/components/Pathway";
import { CTASection } from "@/components/CTASection";
import { EnquiryForm } from "@/components/EnquiryForm";

const academy = getAcademy("girls")!;

export const revalidate = 60;
export const metadata: Metadata = {
  title: { absolute: `${academy.seo.title} | HillRisers` },
  description: academy.seo.description,
  alternates: { canonical: "/girls" },
};

const promises = [
  { t: "Beginners welcome", b: "Never held a bat? Perfect. Lots of our girls start from scratch." },
  { t: "Experienced players welcome", b: "Already playing for school or club? We’ll stretch you with specialist coaching." },
  { t: "Dedicated girls sessions", b: "A girls-only group with its own coaching plan, every week." },
  { t: "Mixed academies too", b: "Girls can also join any specialist batting, bowling or performance session." },
  { t: "Supportive environment", b: "Positive role models, encouragement and coaches who know every player." },
  { t: "Skills, confidence, enjoyment", b: "Get better at cricket, feel good doing it, and make friends along the way." },
];

const faqs = [
  {
    q: "My daughter has never played. Will she be the only beginner?",
    a: "Very unlikely — and the group is coached in small stations, so beginners and experienced players each work at the right level.",
  },
  {
    q: "Can girls join the mixed specialist academies?",
    a: "Yes. Girls are welcome in every academy. Many train in the Girls Academy and join a specialist session as well.",
  },
  {
    q: "Is it soft ball or hard ball?",
    a: "Both, depending on age and experience. New players start with softer balls and move to hard-ball cricket when they’re ready.",
  },
  {
    q: "Who coaches the Girls Academy?",
    a: "The Girls Academy is led by our Girls Academy Lead Coach, supported by an assistant coach and junior helpers — including female role models.",
  },
];

export default async function GirlsPage() {
  const availability = await getAvailability();
  const coaches = coachesFor("girls");
  const quotes = testimonialsFor("girls");

  return (
    <>
      <PageHero
        eyebrow="Girls Academy · Ages 7–14"
        title="Cricket for girls who want to play, improve and belong."
        intro={
          <p>
            A dedicated junior girls cricket environment with high-quality coaching, positive role models and a clear development pathway.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/book?discipline=girls" arrow className="group">Book a Girls Academy Trial</ButtonLink>
            <ButtonLink href="#ask" variant="secondary">Ask Us About the Right Group</ButtonLink>
          </>
        }
        image={academy.image}
      />

      <Section tone="light">
        <SectionHeader eyebrow="What to expect" title="A place where every girl gets better." className="mb-14" />
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal key={p.t} delay={(i % 3) * 80} className="border-t border-navy-950/10 pt-6">
              <h3 className="text-2xl text-navy-950">{p.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{p.b}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-3">
          <Photo alt="Girl bowling in an indoor net" className="aspect-[4/5]" sizes="33vw" />
          <Photo alt="Girls Academy group huddle with their coach" className="aspect-[4/5]" tone="warm" sizes="33vw" />
          <Photo alt="Young batter celebrating a boundary" className="aspect-[4/5]" tone="deep" sizes="33vw" />
        </div>
      </section>

      <Section tone="darker" id="times">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Girls Academy sessions" title="Dedicated girls sessions." />
            <div className="mt-10">
              <WhenItRuns discipline="girls" availability={availability} />
            </div>
          </div>
          <div>
            <SectionHeader eyebrow="Also open to girls" title="Every specialist academy." />
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {specialistAcademies.slice(0, 4).map((a) => (
                <AcademyCard key={a.key} academy={a} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid gap-8 md:grid-cols-2">
          {quotes.slice(0, 2).map((t) => (
            <Reveal key={t.id}>
              <TestimonialCard t={t} large />
            </Reveal>
          ))}
        </div>
      </Section>

      {coaches.length > 0 && (
        <Section tone="light">
          <SectionHeader eyebrow="Coaches & role models" title="Led by people who love the women’s game." className="mb-12" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coaches.map((c) => (
              <CoachCard key={c.id} coach={c} tone="light" />
            ))}
          </div>
        </Section>
      )}

      <Section tone="darker" tight>
        <SectionHeader eyebrow="Pathway" title="From first experience to confident competitive cricket." className="mb-12" />
        <Pathway tone="dark" />
      </Section>

      <Section tone="light" id="ask">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Ask us"
              title="Not sure which group is right?"
              intro={<p className="text-ink-muted">Tell us a little about your daughter and we&rsquo;ll recommend the best place to start.</p>}
            />
            <div className="mt-10">
              <FAQAccordion items={faqs} />
            </div>
          </div>
          <Reveal className="rounded-3xl bg-cream-200 p-6 md:p-9">
            <EnquiryForm source="girls" />
          </Reveal>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      </Section>

      <CTASection
        title="Her first session could be the start of something."
        primary={{ href: "/book?discipline=girls", label: "Book a Girls Academy Trial" }}
        secondary={{ href: "#ask", label: "Ask Us About the Right Group" }}
      />
    </>
  );
}
