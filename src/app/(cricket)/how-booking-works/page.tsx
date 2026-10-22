import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/data/site";
import { REGISTRATION_FEE_PENCE } from "@/data/programmes";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { BookingSteps } from "@/components/BookingSteps";
import { KeyDates } from "@/components/KeyDates";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "How Booking Works",
  description: "How booking will work at HillRisers Cricket Academy: register your interest, hear first when the timetable is published, get priority booking and book a trial.",
  alternates: { canonical: "/how-booking-works" },
};

export default function HowBookingWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How booking works"
        title="Register now. Book when the timetable is published."
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
              New players pay a one-off registration fee of {formatPrice(REGISTRATION_FEE_PENCE)}, which includes a HillRisers playing
              shirt. See our <Link href="/programmes" className="underline underline-offset-4">programmes and prices</Link> and our{" "}
              <Link href="/terms" className="underline underline-offset-4">terms and conditions</Link>. For holidays and closures across the
              year, see the <Link href="/calendar" className="underline underline-offset-4">2026/27 calendar</Link>.
            </p>
          </div>
          <KeyDates />
        </div>
      </Section>
      <CTASection />
    </>
  );
}
