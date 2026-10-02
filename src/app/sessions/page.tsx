import type { Metadata } from "next";
import { getAvailability } from "@/lib/booking";
import { testimonials } from "@/data/testimonials";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { PriceCard } from "@/components/PriceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { CTASection, NotSureBanner } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { TermDates } from "@/components/TermDates";
import { TermTable } from "@/components/TermTable";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Timetable & Price — Junior Cricket Sessions in Harrow",
  description:
    "Weekly junior cricket academy timetable at John Lyon School, Harrow: Tuesday and Wednesday evenings plus weekend sessions. 90-minute specialist sessions, maximum 18 players, £25.",
  alternates: { canonical: "/sessions" },
};

export default async function SessionsPage() {
  const availability = await getAvailability();
  return (
    <>
      <PageHero
        eyebrow="Timetable & price"
        title="Every session, every week."
        intro={<p>Tuesday and Wednesday evenings plus weekend sessions at John Lyon School. Maximum 18 players in every academy group.</p>}
        afterActions={<TermDates className="mt-6" />}
        actions={
          <>
            <ButtonLink href="/book" arrow className="group">Book a Trial</ButtonLink>
            <ButtonLink href="/find-my-session" variant="secondary">Find My Session</ButtonLink>
          </>
        }
      />
      <Section tone="dark" className="!pt-14">
        <ScheduleGrid availability={availability} />
        <div className="mt-14">
          <NotSureBanner />
        </div>
      </Section>
      <Section tone="light" id="term-dates">
        <SectionHeader
          eyebrow="Term dates 2026–27"
          title="Termly, in step with the school year."
          intro={<p className="text-ink-muted">Sessions follow the John Lyon School calendar, with no sessions in half terms.</p>}
          className="mb-10"
        />
        <TermTable />
      </Section>
      <Section tone="cream">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader eyebrow="Price" title="Simple, transparent pricing." className="mb-10" />
            <PriceCard />
          </div>
          <Reveal delay={120} className="space-y-6 lg:pt-36">
            {testimonials.slice(0, 2).map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </Reveal>
        </div>
      </Section>
      <CTASection />
    </>
  );
}
