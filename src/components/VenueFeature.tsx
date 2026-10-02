import { site } from "@/data/site";
import { ButtonLink } from "./Button";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

export function VenueFeature() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <Reveal className="grid grid-cols-2 gap-4">
        <Photo alt="Indoor cricket hall at John Lyon School" className="col-span-2 aspect-[16/9] rounded-2xl" sizes="(min-width: 1024px) 45vw, 100vw" />
        <Photo alt="Indoor nets set up for an academy session" className="aspect-square rounded-2xl" tone="warm" sizes="22vw" showCaption={false} />
        <Photo alt="Parents arriving at the school entrance" className="aspect-square rounded-2xl" tone="deep" sizes="22vw" showCaption={false} />
      </Reveal>
      <Reveal delay={120}>
        <p className="eyebrow">The venue</p>
        <h2 className="mt-5 text-[2.5rem] leading-[1.05] md:text-[3.25rem]">Train at John Lyon School</h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">
          Academy sessions run at {site.venue.name}, Harrow on the Hill — high-quality indoor cricket facilities, easy to reach from
          Harrow, Pinner, Northwood and Ruislip, with a coach to meet you at the door on your first visit.
        </p>
        <address className="mt-6 not-italic leading-relaxed text-navy-950">
          {site.venue.name}
          <br />
          {site.venue.addressLines.join(", ")}
        </address>
        <div className="mt-8">
          <ButtonLink href="/venue" variant="dark">Venue, parking &amp; arrival</ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
