import type { Metadata } from "next";
import { getAvailability } from "@/lib/booking";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { FindMySession } from "@/components/FindMySession";
import { TestimonialCard } from "@/components/TestimonialCard";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Find My Session — Which Cricket Group Is Right for My Child?",
  description:
    "Answer four quick questions about your child and we'll recommend the right Hillrisers cricket session — or speak to a coach.",
  alternates: { canonical: "/find-my-session" },
};

export default async function FindMySessionPage() {
  const availability = await getAvailability();
  return (
    <>
      <PageHero
        eyebrow="Find my session"
        title="Tell us about your child."
        intro={<p>Four quick questions and we&rsquo;ll recommend the best starting point. If it&rsquo;s not quite right after the first session, we&rsquo;ll move them.</p>}
      />
      <Section tone="cream" className="!pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <FindMySession availability={availability} />
          <aside className="space-y-6">
            <TestimonialCard t={testimonials[3]} />
            <div className="rounded-2xl bg-navy-950 p-6 text-cream">
              <p className="font-serif text-xl">Prefer to talk?</p>
              <p className="mt-2 text-sm text-slate">Call the academy and we&rsquo;ll help you choose.</p>
              <a href={site.phoneHref} className="mt-4 inline-block font-semibold text-gold underline underline-offset-4">{site.phone}</a>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
