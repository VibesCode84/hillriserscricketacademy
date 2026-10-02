import type { Metadata } from "next";
import { academies, specialistAcademies } from "@/data/academies";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { AcademyCard } from "@/components/AcademyCard";
import { Reveal } from "@/components/Reveal";
import { Pathway, PathwayNote } from "@/components/Pathway";
import { PriceCard } from "@/components/PriceCard";
import { CTASection, NotSureBanner } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "The Academy — Specialist Junior Cricket Coaching in Harrow",
  description:
    "A development academy that complements school and club cricket. Specialist batting, seam, spin, power hitting and performance coaching for ages 4–14 at John Lyon School, Harrow.",
  alternates: { canonical: "/academy" },
};

const journey = [
  { t: "Find the right session", b: "Use Find My Session or ask us. We’ll recommend where to start." },
  { t: "Book a trial", b: "Book one session — no term commitment and no account needed." },
  { t: "Welcome to HillRisers", b: "You’ll get everything you need: what to bring, where to go and who your coach is." },
  { t: "The first session", b: "Your coach knows your child is new, and makes sure they settle in quickly." },
  { t: "How did they find it?", b: "Within 24–48 hours we’ll check in and recommend their academy pathway." },
];

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="The Academy"
        title="Better coaching. More touches. Clearer development."
        intro={
          <p>
            HillRisers is a development academy that complements school and club cricket — specialist coaching for young cricketers who
            want to enjoy the game and get better.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/book" arrow className="group">Book a Trial</ButtonLink>
            <ButtonLink href="/find-my-session" variant="secondary">Find My Session</ButtonLink>
          </>
        }
        image={{ alt: "Academy players working in small coaching stations in an indoor hall" }}
      />

      <Section tone="light">
        <SectionHeader
          eyebrow="Specialist academies"
          title="Choose what you want to get better at."
          intro={<p className="text-ink-muted">Each academy has its own coaching plan, its own specialist coaches and a clear purpose for every session.</p>}
          className="mb-14"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialistAcademies.map((a, i) => (
            <Reveal key={a.key} delay={(i % 3) * 80}>
              <AcademyCard academy={a} tone="light" />
            </Reveal>
          ))}
          {academies
            .filter((a) => a.key === "girls" || a.key === "little-cricketers")
            .map((a, i) => (
              <Reveal key={a.key} delay={(i + 2) * 80}>
                <AcademyCard academy={a} tone="light" />
              </Reveal>
            ))}
        </div>
        <div className="mt-14">
          <NotSureBanner tone="light" />
        </div>
      </Section>

      <Section tone="darker">
        <SectionHeader eyebrow="Player pathway" title="Explore. Develop. Perform. Excel." className="mb-14" />
        <Pathway tone="dark" />
        <PathwayNote tone="dark" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Academy kit", "Term reports", "Milestone badges", "Player of the month"].map((x) => (
            <div key={x} className="rounded-xl border border-gold/20 px-5 py-4 text-cream">
              <span className="mr-3 text-gold">◆</span>
              {x}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Your first weeks" title="Joining is simple — and personal." />
            <ol className="mt-10 space-y-6">
              {journey.map((j, i) => (
                <Reveal as="li" key={j.t} delay={i * 60} className="flex gap-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-deep text-sm font-semibold text-gold-deep">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl text-navy-950">{j.t}</h3>
                    <p className="mt-1 leading-relaxed text-ink-muted">{j.b}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal delay={120}>
            <PriceCard />
          </Reveal>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
