import type { Metadata } from "next";
import Link from "next/link";
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
  description: "The HillRisers coaching team will be announced soon. Every coach will hold an ECB qualification, an enhanced cricket DBS check and safeguarding training.",
  alternates: { canonical: "/coaches" },
};

export default function CoachesPage() {
  return (
    <>
      <PageHero
        eyebrow="The coaching team"
        title="Coaches who know every player."
        intro={
          <p>
            With a maximum of {groupSizes.perNet} players per net and each net with its own coach, every player gets proper attention — and a
            coach who knows their game.
          </p>
        }
        actions={<ButtonLink href="/coach-with-us" variant="secondary">Coach with us</ButtonLink>}
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
        <p className="mt-8 text-ink-muted">
          Are you a qualified cricket coach? <Link href="/coach-with-us" className="font-semibold text-navy-950 underline underline-offset-4">Find out about coaching with us</Link>.
        </p>
      </Section>
      <CTASection />
    </>
  );
}
