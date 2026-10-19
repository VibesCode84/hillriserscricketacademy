import type { Metadata } from "next";
import Link from "next/link";
import { camps } from "@/data/camps";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { CampInterestForm } from "@/components/CampInterestForm";

const [firstCamp] = camps;

export const metadata: Metadata = {
  title: "Specialist Holiday Cricket Camps in Harrow",
  description:
    "HillRisers specialist junior cricket holiday camps at John Lyon School, part-day or full-day. Details to be confirmed — register your interest to hear first.",
  alternates: { canonical: "/camps" },
};

const principles = [
  { t: "Specialist coaching", b: "From the HillRisers coaching team, with the same focus on technique, decision-making and game understanding as our academy." },
  { t: "Small working groups", b: "Plenty of turns, plenty of feedback, and coaches who get to know every player." },
  { t: "Serious fun", b: "Ambitious coaching without losing the enjoyment that makes children want to come back." },
];

const faqs = [
  {
    q: "Does registering interest commit us to anything?",
    a: "No. There's nothing to pay and no obligation. You'll simply hear about camp details before booking opens to everyone.",
  },
  {
    q: "When will the details be confirmed?",
    a: "Camp details are to be confirmed. Families who register interest will be the first to know.",
  },
];

export default function CampsPage() {
  return (
    <>
      <PageHero
        eyebrow="Holiday camps · Details TBC"
        title="Specialist holiday camps."
        intro={
          <p>
            Specialist cricket coaching in the school holidays from the HillRisers coaching team — part-day or full-day camps, with weekly
            sessions possibly carrying on too. See the <Link href="/calendar" className="underline underline-offset-4">2026/27 calendar</Link>{" "}
            for holiday dates.
          </p>
        }
        actions={
          <>
            <ButtonLink href="#register" arrow className="group">Register interest</ButtonLink>
          </>
        }
        afterActions={<p className="mt-6 text-sm font-semibold text-cream">{firstCamp.name} · Details TBC</p>}
        image={{ alt: "Junior cricketers in a holiday camp game" }}
      />

      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader eyebrow="The camps" title="Everything good about the academy, in the holidays." className="mb-10" />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {principles.map((p, i) => (
                <Reveal key={p.t} delay={(i % 2) * 80} className="border-t border-navy-950/10 pt-5">
                  <h3 className="text-2xl text-navy-950">{p.t}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{p.b}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={120} className="self-start rounded-3xl bg-navy-950 p-7 text-cream md:p-9">
            <p className="eyebrow">First camp</p>
            <h3 className="mt-4 text-3xl">{firstCamp.name}</h3>
            <p className="mt-2 text-lg text-gold-soft">Details TBC</p>
            <p className="mt-6 border-t border-cream/10 pt-6 text-sm text-slate">
              Register interest and you&rsquo;ll hear first — before booking opens to everyone.
            </p>
            <div className="mt-6">
              <ButtonLink href="#register">Register interest</ButtonLink>
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
