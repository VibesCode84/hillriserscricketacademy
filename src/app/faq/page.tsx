import type { Metadata } from "next";
import { allFaqs, faqGroups } from "@/data/faqs";
import { PageHero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { FAQAccordion, faqJsonLd } from "@/components/FAQAccordion";
import { CTASection, NotSureBanner } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "FAQs — Junior Cricket Coaching Questions Answered",
  description:
    "Is my child good enough? What do they need to bring? Are beginners and girls welcome? Answers to parents' questions about Hillrisers Cricket Academy in Harrow.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <PageHero eyebrow="FAQs" title="Questions parents ask us." intro={<p>If your question isn&rsquo;t here, just ask — we&rsquo;re always happy to talk.</p>} />
      <Section tone="light">
        <div className="mx-auto max-w-4xl space-y-16">
          {faqGroups.map((g) => (
            <div key={g.title}>
              <h2 className="mb-4 text-3xl text-navy-950">{g.title}</h2>
              <FAQAccordion items={g.items} />
            </div>
          ))}
          <NotSureBanner tone="light" />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(allFaqs)) }} />
      </Section>
      <CTASection />
    </>
  );
}
