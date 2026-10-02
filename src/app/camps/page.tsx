import type { Metadata } from "next";
import { camps } from "@/data/camps";
import { site } from "@/data/site";
import { formatTermDate } from "@/data/term";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { CampInterestForm } from "@/components/CampInterestForm";

const [firstCamp] = camps;
const firstCampDates = `${formatTermDate(firstCamp.from, { weekday: true })} – ${formatTermDate(firstCamp.to, { weekday: true, year: true })}`;

export const metadata: Metadata = {
  title: "Specialist Holiday Cricket Camps in Harrow",
  description: `Hillrisers specialist junior cricket holiday camps at ${site.venue.name}, Harrow — starting Spring half term (${firstCampDates}). Register your interest.`,
  alternates: { canonical: "/camps" },
};

const principles = [
  { t: "Specialist coaching", b: "Led by the Hillrisers coaching team, with the same focus on technique, decision-making and game understanding as our academy." },
  { t: "Small working groups", b: "Plenty of turns, plenty of feedback, and coaches who get to know every player." },
  { t: "A week of real progress", b: "Several days together gives time to build a skill properly — and then use it in games." },
  { t: "Serious fun", b: "Ambitious coaching without losing the enjoyment that makes children want to come back." },
];

// TODO: replace with confirmed details when available
const toConfirm = ["Daily times", "Ages and groups", "Specialist focus for each day", "Price and booking"];

const faqs = [
  {
    q: "Does registering interest commit us to anything?",
    a: "No. There's nothing to pay and no obligation. You'll simply hear about camp details before booking opens to everyone.",
  },
  {
    q: "When will the details be confirmed?",
    a: "We're finalising times, ages, focus and prices now. Families who register interest will be the first to know.",
  },
  {
    q: "Where are the camps held?",
    a: `At ${site.venue.name}, ${site.venue.addressLines.join(", ")} — the same venue as our academy sessions.`,
  },
];

export default function CampsPage() {
  return (
    <>
      <PageHero
        eyebrow={`Holiday camps · Starting Spring half term`}
        title="Specialist holiday camps."
        intro={
          <p>
            A week of specialist cricket coaching in the school holidays, from the Hillrisers coaching team at {site.venue.name}. Our first
            camp runs in the Spring half term.
          </p>
        }
        actions={
          <>
            <ButtonLink href="#register" arrow className="group">Register interest</ButtonLink>
            <ButtonLink href="#details" variant="secondary">What we know so far</ButtonLink>
          </>
        }
        afterActions={
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cream">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-gold" fill="none" aria-hidden="true">
              <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {firstCamp.name}: {firstCampDates}
          </p>
        }
        image={{ alt: "Junior cricketers in a holiday camp match at John Lyon School" }}
      />

      <Section tone="light" id="details">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader eyebrow="The camps" title="Everything good about the academy, for a whole week." className="mb-10" />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {principles.map((p, i) => (
                <Reveal key={p.t} delay={(i % 2) * 80} className="border-t border-navy-950/10 pt-5">
                  <h3 className="text-2xl text-navy-950">{p.t}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{p.b}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={120} className="rounded-3xl bg-navy-950 p-7 text-cream md:p-9">
            <p className="eyebrow">First camp</p>
            <h3 className="mt-4 text-3xl">{firstCamp.name}</h3>
            <p className="mt-2 text-lg text-gold-soft">{firstCampDates}</p>
            <p className="mt-1 text-slate">{site.venue.name}, Harrow</p>
            <div className="mt-7 border-t border-cream/10 pt-6">
              <p className="font-semibold">Details to follow</p>
              <ul className="mt-3 space-y-2 text-slate">
                {toConfirm.map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-slate">Register interest and you&rsquo;ll hear first — before booking opens to everyone.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-3">
          <Photo alt="Camp players in a batting drill" className="aspect-[4/3]" sizes="33vw" />
          <Photo alt="Girls and boys celebrating in a camp game" className="aspect-[4/3]" tone="warm" sizes="33vw" />
          <Photo alt="Coach demonstrating a bowling grip to a group" className="aspect-[4/3]" tone="deep" sizes="33vw" />
        </div>
      </section>

      <Section tone="cream" id="register">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader
              eyebrow="Register interest"
              title="Be the first to hear."
              intro={<p className="text-ink-muted">Tell us a little about your child and which camps interest you. No payment, no commitment.</p>}
            />
            <div className="mt-10">
              <FAQAccordion items={faqs} />
            </div>
          </div>
          <Reveal className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
            <CampInterestForm />
          </Reveal>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      </Section>
    </>
  );
}
