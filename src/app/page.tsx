import Link from "next/link";
import { specialistAcademies, getAcademy } from "@/data/academies";
import { coaches } from "@/data/coaches";
import { testimonials } from "@/data/testimonials";
import { getAvailability } from "@/lib/booking";
import { HomeHero } from "@/components/Hero";
import { TrustBand, TrustStrip } from "@/components/TrustStrip";
import { Section, SectionHeader } from "@/components/Section";
import { AcademyCard } from "@/components/AcademyCard";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { CoachCard } from "@/components/CoachCard";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { TestimonialCard } from "@/components/TestimonialCard";
import { PriceCard } from "@/components/PriceCard";
import { CTASection, NotSureBanner } from "@/components/CTASection";
import { FindMySession } from "@/components/FindMySession";
import { Pathway } from "@/components/Pathway";
import { VenueFeature } from "@/components/VenueFeature";

export const revalidate = 60;


const pillars = [
  {
    title: "Specialist Coaching",
    body: "Focused batting, seam, spin and performance sessions — led by coaches who specialise in what your child wants to improve.",
    icon: "M4 20 18 6m-4 0h4v4M6 14l4 4",
  },
  {
    title: "More Individual Attention",
    body: "Players work in smaller coaching groups within each academy session, so there are more turns, more touches and more feedback.",
    icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  },
  {
    title: "Clear Development",
    body: "Every session has a purpose — not simply nets for the sake of nets. Players leave knowing what to work on next.",
    icon: "M4 18c4-1 7-4 9-7s4-5 7-6M15 5h5v5",
  },
  {
    title: "Positive Environment",
    body: "Ambitious coaching without taking away the enjoyment of cricket. Players are known by name and encouraged to try things.",
    icon: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z",
  },
];

export default async function HomePage() {
  const availability = await getAvailability();
  const girls = getAcademy("girls")!;
  const featured = testimonials[0];

  return (
    <>
      <HomeHero trust={<TrustStrip />} />
      <TrustBand />

      {/* Why Hillrisers */}
      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeader
              eyebrow="Why Hillrisers"
              title="More than another cricket session."
              intro={
                <p className="text-ink-muted">
                  Young players improve when they get enough attention, enough repetition and coaching they can understand. Hillrisers
                  combines specialist coaches, structured sessions and positive small-group learning to help every player develop their
                  own game.
                </p>
              }
            />
            <Reveal className="mt-10">
              <ButtonLink href="/academy" variant="dark" arrow className="group">Explore the Academy</ButtonLink>
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

      {/* Academy disciplines */}
      <Section tone="darker">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Specialist Academy"
            title="Choose what you want to get better at."
            intro={<p className="text-slate">Five specialist academies and a dedicated Girls Academy — each with its own coaching plan.</p>}
          />
          <Reveal>
            <Link href="/academy" className="link-underline shrink-0 text-sm font-semibold text-gold">See the full academy →</Link>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...specialistAcademies, girls].map((a, i) => (
            <Reveal key={a.key} delay={(i % 3) * 90}>
              <AcademyCard academy={a} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Find your session */}
      <Section tone="cream" id="find">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeader
            eyebrow="Find your session"
            title="Tell us about your child. We’ll suggest where to start."
            intro={
              <p className="text-ink-muted">
                Four quick questions. No commitment — and if the first session isn&rsquo;t quite the right fit, we&rsquo;ll move them.
              </p>
            }
          />
          <Reveal>
            <FindMySession availability={availability} />
          </Reveal>
        </div>
      </Section>

      {/* Girls feature */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="grid lg:grid-cols-2">
          <Photo alt="Girls Academy players laughing during a fielding game" className="min-h-[22rem] lg:min-h-[40rem]" sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="flex items-center py-20 md:py-28">
            <Reveal className="container-x max-w-2xl lg:px-16">
              <p className="eyebrow">Girls Cricket</p>
              <h2 className="mt-5 text-[2.5rem] leading-[1.05] text-cream md:text-[3.5rem]">A cricket academy where girls belong.</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate">
                Dedicated girls sessions. Positive coaching. A pathway from first experience through to confident competitive cricket —
                and girls are welcome in every specialist academy too.
              </p>
              <ul className="mt-8 grid gap-3 text-cream sm:grid-cols-2">
                {["Beginners welcome", "Experienced players welcome", "Girls-only sessions", "Positive role models"].map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/girls" arrow className="group">Explore Girls Cricket</ButtonLink>
                <ButtonLink href="/book?discipline=girls" variant="secondary">Book a Girls Academy Trial</ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Coaching team */}
      <Section tone="light">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="The coaching team"
            title="Coaches who know every player by name."
            intro={
              <p className="text-ink-muted">
                Every academy session has a lead coach, an assistant coach and two junior helpers. They are the heart of Hillrisers.
              </p>
            }
          />
          <Reveal>
            <ButtonLink href="/coaches" variant="dark">Meet the coaches</ButtonLink>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.slice(0, 4).map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <CoachCard coach={c} tone="light" />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Timetable */}
      <Section tone="darker" id="timetable">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Weekly timetable"
            title="Sessions through the week."
            intro={<p className="text-slate">Wednesday evenings, plus weekend sessions at John Lyon School.</p>}
          />
          <Reveal>
            <Link href="/sessions" className="link-underline shrink-0 text-sm font-semibold text-gold">Full timetable &amp; pricing →</Link>
          </Reveal>
        </div>
        <Reveal className="mt-12">
          <ScheduleGrid availability={availability} />
        </Reveal>
      </Section>

      {/* Testimonial + price */}
      <Section tone="cream">
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-6">
            <TestimonialCard t={featured} large />
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.slice(1, 3).map((t) => (
                <TestimonialCard key={t.id} t={t} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={120} className="flex flex-col">
            <p className="eyebrow">Price</p>
            <h2 className="mb-8 mt-5 text-[2.5rem] leading-[1.05] md:text-[3.25rem]">Specialist coaching. £25.</h2>
            <PriceCard className="flex-1" />
          </Reveal>
        </div>
      </Section>

      {/* Pathway */}
      <Section tone="light" tight>
        <SectionHeader
          eyebrow="Player pathway"
          title="A clear path, from first session to their best cricket."
          className="mb-14"
        />
        <Pathway />
      </Section>

      {/* Venue */}
      <Section tone="cream">
        <VenueFeature />
        <div className="mt-16">
          <NotSureBanner tone="light" />
        </div>
      </Section>

      {/* Holiday camps teaser */}
      <section className="border-y border-gold/15 bg-navy-900">
        <div className="container-x flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">New · Holiday camps</p>
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
