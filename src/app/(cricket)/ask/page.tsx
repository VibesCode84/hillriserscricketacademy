import type { Metadata } from "next";
import { PageHero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { AskChat } from "@/components/AskChat";

export const metadata: Metadata = {
  title: "Ask HillRisers",
  robots: { index: false, follow: false },
};

export default function AskPage() {
  return (
    <>
      <PageHero eyebrow="Ask HillRisers" title="Ask us anything." />
      <Section tone="light">
        <AskChat />
      </Section>
    </>
  );
}
