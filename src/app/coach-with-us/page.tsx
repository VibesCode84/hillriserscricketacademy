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
  // Private page: shared directly with prospective coaches, not linked from the public site
  robots: { index: false, follow: false },
};

// Candid status for prospective coaches (this page is private)
const whereWeAre = [
  { t: "Launching 1 November", b: "Sessions start at John Lyon School with a trial week on 1–7 November, and regular sessions from 8 November." },
  { t: "No players yet", b: "Families are registering their interest now. We'll know how many players — and how many coaching hours — once registrations close on 19 October." },
  { t: "Hours follow demand", b: "We can't promise a set number of hours until the timetable is built. It will be set from parent feedback and coach availability." },
  { t: "Indoors in autumn and spring", b: "Three indoor nets in the John Lyon sports hall, with an 11-yard run-up — so indoor seam work focuses on action, accuracy and variations. Outdoors in summer." },
  { t: "Equipment is planned", b: "A bowling machine and video analysis are planned, not yet bought." },
  { t: "Small and hands-on", b: "It's a start-up. You'll be part of a small team, and your input will shape how we coach from day one." },
];

const reasons = [
  {
    t: "Market-leading pay",
    b: "Healthy, market-leading pay that reflects your skills, experience and profile. Good coaching deserves to be paid like it.",
  },
  {
    t: "Longer blocks, not odd hours",
    b: "We aim to plan coaching in longer blocks rather than scattered single hours, so your time — and the journey — is worth it.",
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
  { role: "Lead coach", detail: "Leads sessions and the coaching team on the day." },
  { role: "Specialist coach", detail: "Batting (including power hitting, sweeps and ramps), seam or spin." },
  { role: "Girls Academy lead", detail: "Leads the girls-only pathway. Applications from female coaches are particularly welcome." },
  { role: "Early-years coach", detail: "Little Cricketers (ages 4–7), Sundays 9:00–9:50am." },
  { role: "Helpers (aged 16–18)", detail: "Support coaches in sessions — a great first step into coaching." },
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

      <Section tone="cream">
        <SectionHeader
          eyebrow="Where we are now"
          title="An honest picture."
          intro={<p className="text-ink-muted">We&rsquo;d rather you joined knowing exactly where things stand.</p>}
          className="mb-12"
        />
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {whereWeAre.map((r, i) => (
            <Reveal key={r.t} delay={(i % 3) * 80} className="border-t border-navy-950/10 pt-5">
              <h3 className="text-2xl text-navy-950">{r.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{r.b}</p>
            </Reveal>
          ))}
        </div>
      </Section>

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
                <li key={r.role} className="py-5">
                  <p className="font-serif text-2xl text-cream">{r.role}</p>
                  <p className="mt-1 text-slate">{r.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-slate">
              Pay for every role is market-leading and reflects your skills, experience and profile — we&rsquo;ll discuss it with you
              directly. Session times will be set from parent feedback and coach availability. The only fixed time so far is Little Cricketers, Sundays
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
