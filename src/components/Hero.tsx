import type { ReactNode } from "react";
import { ButtonLink } from "./Button";
import { Photo } from "./Photo";

function HeroArtwork() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-navy-800/60 blur-[120px]" />
      <div className="absolute right-0 top-20 h-[28rem] w-[28rem] rounded-full bg-gold/[0.07] blur-[110px]" />
      <svg className="absolute bottom-0 left-0 h-[70%] w-full" preserveAspectRatio="none" viewBox="0 0 1440 500">
        <path d="M0 470 C 300 450 560 330 860 270 S 1280 190 1440 150" stroke="#d5a93f" strokeOpacity="0.35" fill="none" />
        <path d="M0 495 C 320 480 600 370 900 315 S 1300 240 1440 205" stroke="#e8cf83" strokeOpacity="0.12" fill="none" />
        <path d="M0 440 C 280 420 520 290 820 225 S 1260 140 1440 95" stroke="#f8f6f0" strokeOpacity="0.05" fill="none" />
      </svg>
    </div>
  );
}

/** Homepage hero */
export function HomeHero({ trust }: { trust: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-16 pt-28 md:pb-24 md:pt-36 lg:pt-40">
      <HeroArtwork />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">Junior cricket academy · Harrow</p>
          <h1 className="mt-6 text-[3rem] leading-[0.98] text-cream sm:text-[4rem] lg:text-[5.25rem]">
            Cricket coaching that makes a <em className="font-normal italic text-gold-soft">difference.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate md:text-xl">
            Specialist batting, bowling and performance coaching for junior cricketers aged 4–14 at John Lyon School.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/book" arrow className="group">Book a Trial</ButtonLink>
            <ButtonLink href="/find-my-session" variant="secondary">Find My Session</ButtonLink>
          </div>
          <p className="mt-4 text-sm italic text-slate">No need to know which group is right — we&rsquo;ll help you choose.</p>
          <div className="mt-10 border-t border-cream/10 pt-6">{trust}</div>
        </div>

        <div className="relative hidden h-[34rem] lg:block">
          <Photo
            alt="Girls Academy batter playing a confident drive"
            className="absolute right-0 top-0 h-[26rem] w-[72%] rounded-[2rem]"
            priority
            sizes="40vw"
          />
          <Photo
            alt="Coach giving one-to-one feedback to a young bowler"
            className="absolute bottom-0 left-0 h-[17rem] w-[52%] rounded-[1.75rem] ring-8 ring-navy-950"
            tone="warm"
            sizes="25vw"
          />
          <div className="absolute bottom-10 right-4 max-w-[13rem] rounded-2xl border border-gold/25 bg-navy-900/90 p-5 backdrop-blur">
            <p className="font-serif text-4xl text-gold">18</p>
            <p className="mt-1 text-sm leading-snug text-slate">players maximum, with four coaches in every academy session</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Inner-page hero */
export function PageHero({
  eyebrow,
  title,
  intro,
  actions,
  image,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  image?: { src?: string; alt: string };
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-16 pt-32 md:pb-24 md:pt-40">
      <HeroArtwork />
      <div className={`container-x relative grid items-center gap-12 ${image ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-6 text-[2.75rem] leading-[1.02] text-cream sm:text-6xl lg:text-[4.25rem]">{title}</h1>
          {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-slate md:text-xl">{intro}</div>}
          {actions && <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          {children}
        </div>
        {image && (
          <Photo src={image.src} alt={image.alt} priority className="aspect-[4/3] rounded-[2rem] lg:aspect-[4/5]" sizes="(min-width: 1024px) 40vw, 100vw" />
        )}
      </div>
    </section>
  );
}
