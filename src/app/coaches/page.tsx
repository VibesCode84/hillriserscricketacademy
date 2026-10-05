import type { Metadata } from "next";
import { coaches } from "@/data/coaches";
import { groupSizes } from "@/data/programmes";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section } from "@/components/Section";
import { CoachCard, CoachesComingSoon } from "@/components/CoachCard";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Coaching Team",
  description: "The very best junior cricket coaches from the Harrow area. Every HillRisers coach holds an ECB qualification, an enhanced cricket DBS check and safeguarding training.",
  alternates: { canonical: "/coaches" },
};

export default function CoachesPage() {
  return (
    <>
      <PageHero
        eyebrow="The coaching team"
        title="The very best coaches from the area."
        intro={
          <p>
            Expert, experienced and passionate about young cricketers. With a maximum of {groupSizes.perNet} players per net and each net with
            its own coach, every player gets outstanding attention — and a coach who knows their game.
          </p>
        }
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
      />
      <Section tone="light">
        {coaches.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 80}>
                <CoachCard coach={c} tone="light" />
              </Reveal>
            ))}
          </div>
        ) : (
          <CoachesComingSoon />
        )}
      </Section>
      <CTASection />
    </>
  );
}
