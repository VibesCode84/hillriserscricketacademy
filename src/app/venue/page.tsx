import type { Metadata } from "next";
import { site } from "@/data/site";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { Section, SectionHeader } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Venue — Train at John Lyon School, Harrow",
  description:
    "Hillrisers Cricket Academy trains at John Lyon School, Middle Road, Harrow on the Hill. Indoor cricket facilities, parking, arrival instructions and accessibility.",
  alternates: { canonical: "/venue" },
};

// TODO: confirm parking, entrance and waiting arrangements with John Lyon School.
const info = [
  {
    t: "Getting there",
    b: "John Lyon School is on Middle Road, Harrow on the Hill — a short drive from Harrow, Pinner, Northwood, Ruislip and Wembley. Harrow-on-the-Hill station and several bus routes are nearby.",
  },
  {
    t: "Parking",
    b: "Parking arrangements are confirmed in your welcome email. Please drive slowly on site and follow any instructions from school staff.",
  },
  {
    t: "Arrival",
    b: "Arrive 10 minutes before your session. A coach meets players at the entrance, signs them in and takes them through to the hall. On your first visit, the coach will introduce themselves to you.",
  },
  {
    t: "Collection",
    b: "Please collect your child from the same entrance at the end of the session. Players are only released to a parent or a named adult.",
  },
  {
    t: "Parents waiting",
    b: "Parents are welcome to wait at the venue. The coaching team will explain where on your first visit.",
  },
  {
    t: "Accessibility",
    b: "Let us know about any access needs when you book and we'll make sure arrival and the session work for your child and your family.",
  },
];

export default function VenuePage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.venue.mapQuery)}&output=embed`;
  return (
    <>
      <PageHero
        eyebrow="The venue"
        title="Train at John Lyon School"
        intro={<p>High-quality indoor cricket facilities at one of Harrow&rsquo;s leading schools — easy to reach, and a coach at the door to welcome you.</p>}
        actions={
          <>
            <ButtonLink href="/book" arrow className="group">Book a Trial</ButtonLink>
            <ButtonLink href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.venue.mapQuery)}`} variant="secondary" target="_blank" rel="noopener noreferrer">
              Get directions
            </ButtonLink>
          </>
        }
        image={{ alt: "John Lyon School indoor cricket hall set up for an academy session" }}
      />
      <section className="bg-navy-950">
        <div className="grid gap-1 sm:grid-cols-3">
          <Photo alt="Indoor nets at John Lyon School" className="aspect-[4/3]" sizes="33vw" />
          <Photo alt="Sports hall with academy stations laid out" className="aspect-[4/3]" tone="warm" sizes="33vw" />
          <Photo alt="School entrance where coaches meet players" className="aspect-[4/3]" tone="deep" sizes="33vw" />
        </div>
      </section>
      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader eyebrow="Arrival & practicalities" title="Everything you need for the first visit." className="mb-10" />
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
      <CTASection />
    </>
  );
}
