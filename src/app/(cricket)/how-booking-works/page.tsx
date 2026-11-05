import type { Metadata } from "next";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section } from "@/components/Section";
import { BookingSteps } from "@/components/BookingSteps";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How HillRisers Cricket Academy works: register your interest, tell us what your child wants and which sessions they can make, and we'll be in touch when programmes are ready.",
  alternates: { canonical: "/how-booking-works" },
};

export default function HowBookingWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Tell us what you want. We'll build around you."
        actions={<ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>}
      />
      <Section tone="light" className="!pt-14">
        <BookingSteps />
      </Section>
      <CTASection />
    </>
  );
}
