import { site } from "@/data/site";
import { ButtonLink } from "./Button";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";
import { photos } from "@/data/photos";

export function VenueFeature() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <Reveal className="grid grid-cols-2 gap-4">
        <Photo {...photos.sportsHall} className="col-span-2 aspect-[16/9] rounded-2xl" sizes="(min-width: 1024px) 45vw, 100vw" />
        <Photo {...photos.sportsHallNets} className="aspect-square rounded-2xl" sizes="22vw" />
        <Photo {...photos.school} className="aspect-square rounded-2xl" sizes="22vw" />
      </Reveal>
      <Reveal delay={120}>
        <p className="eyebrow">The venue</p>
        <h2 className="mt-5 text-[2.5rem] leading-[1.05] md:text-[3.25rem]">Train at John Lyon School.</h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">
          We coach in the {site.venue.name} sports hall, Harrow on the Hill, with three indoor nets and a bowling machine.
        </p>
        <address className="mt-6 not-italic leading-relaxed text-navy-950">
          {site.venue.name}
          <br />
          {site.venue.addressLines.join(", ")}
        </address>
        <div className="mt-8">
          <ButtonLink href="/venue" variant="dark">More about the venue</ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
