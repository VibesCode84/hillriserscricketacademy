import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { BookingSteps } from "@/components/BookingSteps";
import { KeyDates } from "@/components/KeyDates";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How HillRisers Cricket Academy works: register your interest, tell us what your child wants and which days they can make, and hear first when programmes open.",
  alternates: { canonical: "/how-booking-works" },
};

export default function HowBookingWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Tell us what you want. We'll build around you."
        intro={<p>We&rsquo;re building the timetable around the families who register — so the first step is simply telling us about your child.</p>}
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
      />
      <Section tone="light" className="!pt-14">
        <BookingSteps />
      </Section>
      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader eyebrow="What happens next" title="Programmes coming soon." />
            <p className="mt-6 leading-relaxed text-ink-muted">
              See our <Link href="/programmes" className="underline underline-offset-4">programmes</Link> for ages 4–15. For holidays and
              closures across the year, see the <Link href="/calendar" className="underline underline-offset-4">2026/27 calendar</Link>.
            </p>
          </div>
          <KeyDates />
        </div>
      </Section>
      <CTASection />
    </>
  );
}
