import { site } from "@/data/site";
import { ButtonLink } from "./Button";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

export function VenueFeature() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <Reveal className="grid grid-cols-2 gap-4">
        <Photo alt="John Lyon School sports hall set up with indoor nets" className="col-span-2 aspect-[16/9] rounded-2xl" sizes="(min-width: 1024px) 45vw, 100vw" />
        <Photo alt="Indoor net during a coaching session" className="aspect-square rounded-2xl" tone="warm" sizes="22vw" showCaption={false} />
        <Photo alt="Outdoor summer coaching" className="aspect-square rounded-2xl" tone="deep" sizes="22vw" showCaption={false} />
      </Reveal>
      <Reveal delay={120}>
        <p className="eyebrow">The venue</p>
        <h2 className="mt-5 text-[2.5rem] leading-[1.05] md:text-[3.25rem]">Indoors at John Lyon. Outdoors in summer.</h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">
          In autumn and spring we coach in the {site.venue.name} sports hall, Harrow on the Hill, which has three indoor nets. In summer,
          coaching moves outdoors.
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
