import type { Metadata } from "next";
import Link from "next/link";
import { phoneHref, site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact HillRisers Cricket Academy",
  description: "Get in touch with HillRisers Cricket Academy at John Lyon School, Harrow on the Hill.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We’d love to hear from you."
        intro={
          <p>
            Questions about HillRisers? Send us a message. To register a child for sessions, please use the{" "}
            <Link href="/register" className="text-gold-soft underline underline-offset-4">interest form</Link>.
          </p>
        }
      />
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl bg-cream-200 p-6 md:p-10">
            <EnquiryForm source="contact" />
          </div>
          <aside className="space-y-8 text-navy-950">
            {site.phone && (
              <div>
                <h2 className="text-2xl">Call or message</h2>
                <a href={phoneHref(site.phone)} className="mt-2 block text-lg text-gold-deep underline underline-offset-4">{site.phone}</a>
              </div>
            )}
            {site.email && (
              <div>
                <h2 className="text-2xl">Email</h2>
                <a href={`mailto:${site.email}`} className="mt-2 block text-lg text-gold-deep underline underline-offset-4">{site.email}</a>
              </div>
            )}
            {site.welfareEmail && (
              <div>
                <h2 className="text-2xl">Welfare</h2>
                <p className="mt-2 text-ink-muted">
                  For any safeguarding or welfare concern:{" "}
                  <a href={`mailto:${site.welfareEmail}`} className="text-gold-deep underline underline-offset-4">{site.welfareEmail}</a>
                </p>
              </div>
            )}
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
