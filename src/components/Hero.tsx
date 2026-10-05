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
          <p className="eyebrow">HillRisers Cricket Academy · John Lyon, Harrow on the Hill</p>
          <h1 className="mt-6 text-[2.75rem] leading-[1] text-cream sm:text-[3.75rem] lg:text-[4.5rem]">
            Elite cricket coaching, built around <em className="font-normal italic text-gold-soft">your child.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate md:text-xl">
            The very best coaches from the area, in small groups, with coaching shaped around the needs of every cricket-loving child.
            Tell us when your child can attend and what they want from cricket — we&rsquo;ll build the timetable around you.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" arrow className="group">Register your interest</ButtonLink>
            <ButtonLink href="/how-booking-works" variant="secondary">How booking works</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-slate">Launching 1 November. Registered families get priority booking before places open to everyone.</p>
          <div className="mt-10 border-t border-cream/10 pt-6">{trust}</div>
        </div>

        <div className="relative hidden h-[34rem] lg:block">
          <Photo
            alt="Young batter playing a drive in an indoor net"
            className="absolute right-0 top-0 h-[26rem] w-[72%] rounded-[2rem]"
            priority
            sizes="40vw"
          />
          <Photo
            alt="Coach giving feedback to a young bowler"
            className="absolute bottom-0 left-0 h-[17rem] w-[52%] rounded-[1.75rem] ring-8 ring-navy-950"
            tone="warm"
            sizes="25vw"
          />
          <div className="absolute bottom-10 right-4 max-w-[13rem] rounded-2xl border border-gold/25 bg-navy-900/90 p-5 backdrop-blur">
            <p className="font-serif text-4xl text-gold">6</p>
            <p className="mt-1 text-sm leading-snug text-slate">players maximum per net, and each net has its own coach</p>
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
  afterActions,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  image?: { src?: string; alt: string };
  children?: ReactNode;
  afterActions?: ReactNode;
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
          {afterActions}
          {children}
        </div>
        {image && (
          <Photo src={image.src} alt={image.alt} priority className="aspect-[4/3] rounded-[2rem] lg:aspect-[4/5]" sizes="(min-width: 1024px) 40vw, 100vw" />
        )}
      </div>
    </section>
  );
}
