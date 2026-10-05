import Link from "next/link";
import { coaches } from "@/data/coaches";
import { specialistSkills } from "@/data/programmes";
import { HomeHero } from "@/components/Hero";
import { TrustBand, TrustStrip } from "@/components/TrustStrip";
import { Section, SectionHeader } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { CoachCard, CoachesComingSoon } from "@/components/CoachCard";
import { ProgrammeTable } from "@/components/ProgrammeTable";
import { BookingSteps } from "@/components/BookingSteps";
import { KeyDates } from "@/components/KeyDates";
import { CTASection } from "@/components/CTASection";
import { VenueFeature } from "@/components/VenueFeature";

const pillars = [
  {
    title: "Small groups, own coach",
    body: "A maximum of six players per net, and each net has its own coach — so every player gets plenty of turns and feedback.",
    icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  },
  {
    title: "Built around each child",
    body: "Players are placed by ability, not just age, and move up when they're ready. Tell us what your child wants from cricket and we'll plan around it.",
    icon: "M4 18c4-1 7-4 9-7s4-5 7-6M15 5h5v5",
  },
  {
    title: "Specialist skills",
    body: `${specialistSkills.join(", ").replace(/, ([^,]*)$/, " and $1")} — with fielding in every session.`,
    icon: "M4 20 18 6m-4 0h4v4M6 14l4 4",
  },
  {
    title: "Every format",
    body: "Larger groups, small groups of three, and 1-to-1 coaching — plus a girls-only pathway.",
    icon: "M4 6h16M4 12h16M4 18h10",
  },
];

export default function HomePage() {
  return (
    <>
      <HomeHero trust={<TrustStrip />} />
      <TrustBand />

      {/* What HillRisers offers */}
      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeader
              eyebrow="A new academy, built with you"
              title="Specialist coaching, shaped by the families who join."
              intro={
                <p className="text-ink-muted">
                  HillRisers is a new cricket academy launching at John Lyon School on 1 November. Rather than fix a timetable and hope it
                  suits you, we&rsquo;re asking families first — when children can attend, how long sessions should be, and what they want
                  from cricket — and building the timetable around the answers.
                </p>
              }
            />
            <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" variant="dark" arrow className="group">Register your interest</ButtonLink>
            </Reveal>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="card-lift rounded-2xl bg-white p-7 hover:shadow-[0_24px_50px_-30px_rgba(7,24,47,0.35)]">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold-deep" fill="none" aria-hidden="true">
                  <path d={p.icon} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="mt-5 text-2xl text-navy-950">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-muted">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Programmes */}
      <Section tone="cream" id="programmes">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Programmes and price guide"
            title="Something for every young cricketer."
            intro={<p className="text-ink-muted">From first steps with a soft ball to hard-ball specialist nets.</p>}
          />
          <Reveal>
            <Link href="/programmes" className="link-underline shrink-0 text-sm font-semibold text-navy-950">More about the programmes →</Link>
          </Reveal>
        </div>
        <Reveal className="mt-12">
          <ProgrammeTable />
        </Reveal>
      </Section>

      {/* Girls */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="grid lg:grid-cols-2">
          <Photo alt="Girls playing cricket in an indoor net" className="min-h-[20rem] lg:min-h-[36rem]" sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="flex items-center py-20 md:py-28">
            <Reveal className="container-x max-w-2xl lg:px-16">
              <p className="eyebrow">Girls cricket</p>
              <h2 className="mt-5 text-[2.5rem] leading-[1.05] text-cream md:text-[3.5rem]">A girls-only pathway.</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate">
                Girls Development (8–11) and Girls Performance (11–15) run in the same formats as our mixed groups, girls only. Girls are
                also welcome in every mixed group.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/girls" arrow className="group">Girls cricket</ButtonLink>
                <ButtonLink href="/register" variant="secondary">Register your interest</ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How booking works */}
      <Section tone="light" id="booking">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow="How booking works" title="Register now. Book when the timetable is published." />
          <Reveal>
            <Link href="/how-booking-works" className="link-underline shrink-0 text-sm font-semibold text-navy-950">Full details →</Link>
          </Reveal>
        </div>
        <div className="mt-12">
          <BookingSteps />
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h3 className="text-3xl text-navy-950">Key dates</h3>
            <p className="mt-2 text-ink-muted">Registered families get priority booking before places open to everyone.</p>
          </div>
          <KeyDates />
        </div>
      </Section>

      {/* Coaching team */}
      <Section tone="cream">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow="The coaching team" title="Qualified, checked and announced soon." />
          <Reveal>
            <ButtonLink href="/coach-with-us" variant="dark">Coach with us</ButtonLink>
          </Reveal>
        </div>
        <div className="mt-12">
          {coaches.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {coaches.map((c) => (
                <CoachCard key={c.id} coach={c} tone="light" />
              ))}
            </div>
          ) : (
            <CoachesComingSoon />
          )}
        </div>
      </Section>

      {/* Venue */}
      <Section tone="light">
        <VenueFeature />
      </Section>

      {/* Holiday camps teaser */}
      <section className="border-y border-gold/15 bg-navy-900">
        <div className="container-x flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Holiday camps</p>
            <p className="mt-3 font-serif text-3xl text-cream">Specialist holiday camps, starting Spring half term.</p>
            <p className="mt-1 text-slate">Details TBC — register interest to hear first.</p>
          </div>
          <ButtonLink href="/camps#register" variant="secondary" className="shrink-0">Register interest</ButtonLink>
        </div>
      </section>

      <CTASection />
    </>
  );
}
