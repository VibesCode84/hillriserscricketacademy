import Image from "next/image";
import { Crest } from "@/components/Logo";
import { hub, sports, type Sport } from "@/data/hub";

// Served at hillrisers.co.uk/ (the middleware rewrites the landing page's "/" here)

function SportIcon({ sport }: { sport: Sport["key"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (sport === "hockey")
    return (
      <svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden="true">
        <path {...common} d="M40 8 24 44c-2 5-6 8-11 8h-3" />
        <path {...common} d="M44 10 28 46c-2 5-7 9-13 9h-5" />
        <circle {...common} cx="46" cy="50" r="5" />
      </svg>
    );
  if (sport === "netball")
    return (
      <svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden="true">
        <path {...common} d="M18 14h28M32 14v44" />
        <ellipse {...common} cx="32" cy="18" rx="10" ry="3" />
        <path {...common} d="M23 19l3 10h12l3-10" />
        <circle {...common} cx="48" cy="40" r="7" />
        <path {...common} d="M41 40h14M48 33c-3 4-3 10 0 14" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden="true">
      <path {...common} d="M14 54 40 12l6 3-24 43z" />
      <circle {...common} cx="46" cy="46" r="6" />
    </svg>
  );
}

function SportCard({ sport, featured }: { sport: Sport; featured: boolean }) {
  const inner = (
    <>
      {sport.image ? (
        <Image
          src={sport.image.src}
          alt={sport.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          style={{ objectPosition: sport.image.position }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
          <div className="absolute right-6 top-6 text-gold/60 md:right-8 md:top-8">
            <SportIcon sport={sport.key} />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <h2 className="font-serif text-4xl text-cream md:text-5xl">{sport.name}</h2>
        {sport.line && <p className="mt-2 text-sm text-slate md:text-base">{sport.line}</p>}
        {sport.href ? (
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-950 transition group-hover:bg-gold-soft">
            {sport.cta ?? `Visit ${sport.name}`} <span aria-hidden="true">→</span>
          </span>
        ) : (
          <span className="mt-5 inline-flex rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/80">Coming soon</span>
        )}
      </div>
    </>
  );
  const shape = `group relative block overflow-hidden rounded-[1.75rem] ring-1 ring-cream/10 ${
    featured ? "min-h-[26rem] lg:row-span-2 lg:min-h-0" : "min-h-[15rem]"
  }`;
  return sport.href ? (
    <a href={sport.href} className={`${shape} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}>
      {inner}
    </a>
  ) : (
    <div className={shape} aria-label={`${sport.name} — coming soon`}>
      {inner}
    </div>
  );
}

export default function HillRisersHome() {
  const [first, ...rest] = sports;
  return (
    <div className="relative min-h-screen overflow-hidden text-cream">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-navy-800/60 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-gold/[0.07] blur-[110px]" />
      </div>

      <header className="container-x relative flex items-center justify-between py-6">
        <span className="inline-flex items-center gap-3">
          <Crest className="h-10 w-auto" />
          <span className="font-serif text-[1.65rem] font-semibold tracking-tight">{hub.name}</span>
        </span>
        <a href="#about" className="text-sm font-medium text-slate underline-offset-4 hover:text-cream hover:underline">
          About us
        </a>
      </header>

      <main className="container-x relative pb-16 pt-6 md:pt-12">
        <p className="eyebrow">Harrow on the Hill</p>
        <h1 className="mt-5 max-w-3xl text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">
          {hub.tagline.replace(/\.$/, "")}
          <span className="text-gold-soft">.</span>
        </h1>
        <p className="mt-5 text-lg text-slate md:text-xl">Choose your sport.</p>

        <div className="mt-10 grid gap-4 lg:h-[34rem] lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2">
          <SportCard sport={first} featured />
          {rest.map((s) => (
            <SportCard key={s.key} sport={s} featured={false} />
          ))}
        </div>
      </main>

      <section id="about" className="relative border-t border-cream/10">
        <div className="container-x py-14">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">About us</h2>
          {hub.about.map((p) => (
            <p key={p} className="mt-4 max-w-2xl leading-relaxed text-slate">
              {p}
            </p>
          ))}
        </div>
      </section>

      <footer className="container-x relative border-t border-cream/10 py-8 text-sm text-slate/70">© {new Date().getFullYear()} HillRisers</footer>
    </div>
  );
}
