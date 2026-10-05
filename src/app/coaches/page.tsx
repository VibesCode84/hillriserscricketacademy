import type { Metadata } from "next";
import { coaches } from "@/data/coaches";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { CoachCard } from "@/components/CoachCard";
import { CoachExperience, CoachingPhilosophy, SessionFlow } from "@/components/Coaching";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Our Coaching — Philosophy and Coaches",
  description:
    "The very best junior cricket coaches from the Harrow area, and a coaching philosophy built around every child: small groups, specialist nets, game-ready skills and clear progress.",
  alternates: { canonical: "/coaches" },
};

export default function CoachesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our coaching"
        title="The very best coaches from the area."
        intro={
          <p>
            Expert, experienced and passionate about young cricketers — with a coaching philosophy built around every individual child.
          </p>
        }
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
        image={{ alt: "Coach giving feedback to a young batter in an indoor net" }}
      />

      <Section tone="light">
        <SectionHeader
          eyebrow="Our coaching philosophy"
          title="How we coach."
          intro={<p className="text-ink-muted">Six principles that shape every HillRisers session, for every player.</p>}
          className="mb-14"
        />
        <CoachingPhilosophy />
      </Section>

      <Section tone="darker">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Our coaches"
            title="What every HillRisers coach brings."
            intro={
              <p className="text-slate">
                We choose coaches for their cricket knowledge, their experience with young players and their ability to inspire.
              </p>
            }
          />
          <CoachExperience />
        </div>
        {coaches.length > 0 && (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 80}>
                <CoachCard coach={c} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section tone="cream">
        <SectionHeader
          eyebrow="Inside a session"
          title="What a session looks like."
          intro={<p className="text-ink-muted">Every session has a purpose — and every player gets plenty of time with a coach.</p>}
          className="mb-12"
        />
        <SessionFlow />
      </Section>

      <CTASection title="Give your child coaching that's built around them." />
    </>
  );
}
