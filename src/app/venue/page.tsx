import type { Metadata } from "next";
import { site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Venue — John Lyon School, Harrow on the Hill",
  description:
    "HillRisers coaches in the John Lyon School sports hall, Harrow on the Hill — three indoor nets and a bowling machine — with outdoor nets expected in summer.",
  alternates: { canonical: "/venue" },
};

const info = [
  {
    t: "Autumn and spring: indoors",
    b: `Coaching takes place in the ${site.venue.name} sports hall, Harrow on the Hill, which has three indoor nets.`,
  },
  {
    t: "About the run-up",
    b: "The hall allows an 11-yard run-up. Younger groups bowl from junior pitch lengths, and indoor seam coaching focuses on action, accuracy and variations. Batting, spin and fielding are unaffected, and full run-ups return outdoors.",
  },
  {
    t: "Bowling machine",
    b: "A bowling machine is available through autumn and spring, so players get more quality balls in their sessions.",
  },
  {
    t: "Summer",
    b: "Summer arrangements are to be confirmed. We're expecting outdoor nets, with a multi-use games area (MUGA) for fielding.",
  },
  {
    t: "Arrival and collection",
    b: "We'll send arrival, parking and collection details before your child's first session.",
  },
  {
    t: "Accessibility",
    b: "Tell us about any access needs and we'll make sure arrival and sessions work for your child and your family.",
  },
];

export default function VenuePage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.venue.mapQuery)}&output=embed`;
  return (
    <>
      <PageHero
        eyebrow="The venue"
        title="John Lyon School, Harrow on the Hill."
        intro={<p>Three indoor nets and a bowling machine in the sports hall, with outdoor nets expected in summer.</p>}
        actions={
          <>
            <ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>
            <ButtonLink
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.venue.mapQuery)}`}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </ButtonLink>
          </>
        }
        image={{ alt: "John Lyon School sports hall with indoor nets" }}
      />
      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader eyebrow="Facilities" title="What to expect." className="mb-10" />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {info.map((x, i) => (
                <Reveal key={x.t} delay={(i % 2) * 80} className="border-t border-navy-950/10 pt-5">
                  <h3 className="text-2xl text-navy-950">{x.t}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{x.b}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-3xl bg-cream-200">
              <iframe
                title={`Map showing ${site.venue.name}`}
                src={mapSrc}
                className="aspect-square w-full border-0 grayscale-[0.4]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <address className="p-6 not-italic leading-relaxed text-navy-950">
                <strong className="font-serif text-xl">{site.venue.name}</strong>
                <br />
                {site.venue.addressLines.join(", ")}
              </address>
            </div>
          </Reveal>
        </div>
      </Section>
      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-2">
          <Photo alt="Indoor net at John Lyon School" className="aspect-[16/10]" sizes="50vw" />
          <Photo alt="Outdoor summer coaching" className="aspect-[16/10]" tone="warm" sizes="50vw" />
        </div>
      </section>
      <CTASection />
    </>
  );
}
