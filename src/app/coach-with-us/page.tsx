import type { Metadata } from "next";
import { site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CoachInterestForm } from "@/components/CoachInterestForm";

export const metadata: Metadata = {
  title: "Coach with Us — Junior Cricket Coaching Jobs in Harrow",
  description:
    "HillRisers Cricket Academy is a start-up launching at John Lyon School, Harrow on the Hill, on 1 November. We're looking for lead, specialist, girls and early-years coaches, and helpers aged 16–18.",
  alternates: { canonical: "/coach-with-us" },
};

const reasons = [
  {
    t: "Properly paid",
    b: "Lead coaches earn £40 an hour and specialist coaches £30 an hour. Good coaching deserves to be paid like it.",
  },
  {
    t: "Longer blocks, not odd hours",
    b: "We plan coaching in longer blocks rather than scattered single hours, so your time — and the journey — is worth it.",
  },
  {
    t: "Freedom to coach your way",
    b: "You know how to coach. We'll give you small groups, your own net and the support you need — then trust you to coach the way you believe in.",
  },
  {
    t: "Build something from day one",
    b: "Join a small, ambitious team shaping a new academy from the start. Your ideas will shape how HillRisers coaches.",
  },
  {
    t: "Tools to help",
    b: "A bowling machine and video analysis are planned, so you can show players what you see and give them more quality balls.",
  },
  {
    t: "Support in the net",
    b: "Helpers aged 16–18 will support sessions where groups need it, leaving you free to coach.",
  },
];

const roles = [
  { role: "Lead coach", rate: "£40/hr", detail: "Leads sessions and the coaching team on the day." },
  { role: "Specialist coach", rate: "£30/hr", detail: "Batting (including power hitting, sweeps and ramps), seam or spin." },
  { role: "Girls Academy lead", rate: "£40/hr", detail: "Leads the girls-only pathway. Applications from female coaches are particularly welcome." },
  { role: "Early-years coach", rate: "£30/hr", detail: "Little Cricketers (ages 4–7), Sundays 9:00–9:50am." },
  { role: "Helpers", rate: "Aged 16–18", detail: "Support coaches in sessions — a great first step into coaching." },
];

const requirements = ["ECB coaching qualification", "Enhanced cricket DBS check", "Safeguarding training", "First aid — an advantage"];

export default function CoachWithUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Coach with us"
        title="Help build a cricket academy from day one."
        intro={
          <p>
            HillRisers is a start-up academy launching at {site.venue.name}, Harrow on the Hill, on 1 November. We don&rsquo;t have players
            yet — we&rsquo;re looking for coaches to build it with us from the very first session.
          </p>
        }
        actions={<ButtonLink href="#apply" arrow className="group">Express your interest</ButtonLink>}
        image={{ alt: "Coach working with a young batter in an indoor net" }}
      />

      <Section tone="light">
        <SectionHeader eyebrow="Why coach with HillRisers" title="Good pay, good players, and the freedom to coach." className="mb-12" />
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.t} delay={(i % 3) * 80} className="border-t border-navy-950/10 pt-6">
              <h3 className="text-2xl text-navy-950">{r.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{r.b}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="darker">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHeader eyebrow="Roles" title="Who we're looking for." className="mb-8" />
            <ul className="divide-y divide-cream/10 border-y border-cream/10">
              {roles.map((r) => (
                <li key={r.role} className="grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:gap-6">
                  <div>
                    <p className="font-serif text-2xl text-cream">{r.role}</p>
                    <p className="mt-1 text-slate">{r.detail}</p>
                  </div>
                  <p className="font-semibold text-gold sm:text-right">{r.rate}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-slate">
              Session times will be set from parent feedback and coach availability. The only fixed time so far is Little Cricketers, Sundays
              9:00–9:50am.
            </p>
          </div>
          <div className="self-start rounded-3xl border border-gold/25 bg-navy-900 p-7 md:p-9">
            <h3 className="text-2xl text-cream">What you&rsquo;ll need</h3>
            <ul className="mt-5 space-y-3">
              {requirements.map((x) => (
                <li key={x} className="flex gap-3 text-cream/90">
                  <span className="text-gold" aria-hidden="true">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="cream" id="apply">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Express your interest"
            title="Tell us about you."
            intro={
              <p className="text-ink-muted">
                Your qualifications and playing background, the role(s) you&rsquo;re interested in, your availability (including summer),
                and your DBS and safeguarding status.
                {site.email && (
                  <>
                    {" "}Prefer email? Write to <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>.
                  </>
                )}
              </p>
            }
          />
          <Reveal className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
            <CoachInterestForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
