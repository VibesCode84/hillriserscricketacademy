import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COACH_PAGE_KEY } from "@/data/recruitment";
import { Crest } from "@/components/Logo";
import { site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CoachInterestForm } from "@/components/CoachInterestForm";

export const metadata: Metadata = {
  title: "Coach with Us — Junior Cricket Coaching Jobs in Harrow",
  description:
    "HillRisers Cricket Academy launches at John Lyon School, Harrow on the Hill, on 1 November. Join the founding coaching team: lead, specialist, girls and early-years coaches, and junior helpers.",
  // Private page: shared directly with prospective coaches; never linked from the parent-facing site
  robots: { index: false, follow: false, nocache: true },
};

// Only the configured key renders; any other /team/* URL is a 404
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ key: COACH_PAGE_KEY }];
}

// The opportunity, for prospective coaches (this page is private)
const opportunity = [
  { t: "Launching 1 November", b: "A brand-new academy at John Lyon School, Harrow on the Hill — trial week on 1–7 November and regular sessions from 8 November." },
  { t: "Families are signing up now", b: "Parents are registering their children's availability and ambitions, and we're building the timetable around them." },
  { t: "Coaching that fits your life", b: "Session times are set around families and our coaches' availability — tell us when you can coach and we'll build around you." },
  { t: "Indoors and out", b: "Three indoor nets at John Lyon through autumn and spring. In summer the sports hall is used for exams, and we expect to coach outdoors with outdoor nets." },
  { t: "Kit on the way", b: "A bowling machine and video analysis are coming, so you can show players exactly what you see." },
  { t: "A founding team", b: "Be one of the coaches who shapes HillRisers from the very first session — your ideas will define how we coach." },
];

const reasons = [
  {
    t: "Market-leading pay",
    b: "Healthy, market-leading pay that reflects your skills, experience and profile. Good coaching deserves to be paid like it.",
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
    t: "An exciting team",
    b: "Work alongside ambitious, like-minded coaches who love developing young cricketers — and enjoy doing it.",
  },
  {
    t: "Technology to help",
    b: "Bowling machines and video analysis will help you give players more quality balls and show them exactly what you see.",
  },
  {
    t: "Support in the net",
    b: "Junior helpers support sessions where groups need it, leaving you free to coach.",
  },
];

const roles = [
  { role: "Lead coach", detail: "Leads sessions and the coaching team on the day." },
  { role: "Specialist coach", detail: "Batting (including power hitting, sweeps and ramps), seam or spin." },
  { role: "Girls Academy lead", detail: "Leads the girls-only pathway. Applications from female coaches are particularly welcome." },
  { role: "Early-years coach", detail: "Little Cricketers (ages 4–7), Sundays 9:00–9:50am." },
  { role: "Junior helpers", detail: "Support coaches in sessions — a great first step into coaching." },
];

const requirements = ["ECB coaching qualification", "Enhanced cricket DBS check", "Safeguarding training", "First aid — an advantage"];

export default async function CoachRecruitmentPage({ params }: { params: Promise<{ key: string }> }) {
  if ((await params).key !== COACH_PAGE_KEY) notFound();
  return (
    <>
      {/* Standalone header — no links into the parent-facing site */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="container-x flex h-[4.5rem] items-center gap-3 lg:h-20">
          <Crest className="h-10 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[1.55rem] font-semibold tracking-tight text-cream">HillRisers</span>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold">Coaching opportunities</span>
          </span>
        </div>
      </header>
      <PageHero
        eyebrow="Coach with us"
        title="Join the founding coaching team."
        intro={
          <p>
            HillRisers launches at {site.venue.name}, Harrow on the Hill, on 1 November — and we want the very best coaches in the area to
            help us build something special. Market-leading pay, small groups, great facilities and the freedom to coach your way.
          </p>
        }
        actions={<ButtonLink href="#apply" arrow className="group">Express your interest</ButtonLink>}
        image={{ alt: "Coach working with a young batter in an indoor net" }}
      />

      <Section tone="cream">
        <SectionHeader
          eyebrow="The opportunity"
          title="Be part of something new."
          intro={<p className="text-ink-muted">A new academy, a founding team, and young cricketers ready to learn.</p>}
          className="mb-12"
        />
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {opportunity.map((r, i) => (
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
                Your qualifications, playing background and coaching experience; your coaching philosophy, strengths and weaknesses; the
                role(s) you&rsquo;re interested in; your availability (including summer); and your DBS and safeguarding status.
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
      <footer className="bg-navy-950 py-10 text-sm text-slate">
        <div className="container-x flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. This page is shared privately with prospective coaches.</p>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-cream">Privacy</Link>
        </div>
      </footer>
    </>
  );
}
