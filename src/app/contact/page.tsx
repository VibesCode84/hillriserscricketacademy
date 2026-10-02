import type { Metadata } from "next";
import { site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact HillRisers Cricket Academy",
  description: "Get in touch with HillRisers Cricket Academy, Harrow. Ask about sessions, the Girls Academy or Little Cricketers.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="We’d love to hear from you." intro={<p>Tell us a little about your child and we&rsquo;ll recommend the best place to start.</p>} />
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl bg-cream-200 p-6 md:p-10">
            <EnquiryForm source="contact" />
          </div>
          <aside className="space-y-8 text-navy-950">
            <div>
              <h2 className="text-2xl">Call or message</h2>
              <a href={site.phoneHref} className="mt-2 block text-lg text-gold-deep underline underline-offset-4">{site.phone}</a>
            </div>
            <div>
              <h2 className="text-2xl">Email</h2>
              <a href={`mailto:${site.email}`} className="mt-2 block text-lg text-gold-deep underline underline-offset-4">{site.email}</a>
            </div>
            <div>
              <h2 className="text-2xl">Welfare</h2>
              <p className="mt-2 text-ink-muted">
                For any safeguarding or welfare concern, contact {site.welfareOfficer.name}:{" "}
                <a href={`mailto:${site.welfareOfficer.email}`} className="text-gold-deep underline underline-offset-4">{site.welfareOfficer.email}</a>
              </p>
            </div>
            <div>
              <h2 className="text-2xl">Venue</h2>
              <address className="mt-2 not-italic text-ink-muted">{site.venue.name}, {site.venue.addressLines.join(", ")}</address>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
