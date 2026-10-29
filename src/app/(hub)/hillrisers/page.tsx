import Image from "next/image";
import { Crest, Wordmark } from "@/components/Logo";
import { hub, sports, type Sport } from "@/data/hub";

// Served at hillrisers.co.uk/ (src/middleware.ts rewrites the landing page's "/" here)

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

function SportCard({ sport }: { sport: Sport }) {
  const pos = sport.image?.position ?? "center";
  const inner = (
    <>
      {/* Phones: photo on top, text below. Tablets and up: text over the photo. */}
      <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
        {sport.image ? (
          <Image
            src={sport.image.src}
            alt={sport.image.alt}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 [object-position:var(--pos-m)] group-hover:scale-[1.03] md:[object-position:var(--pos)]"
            style={{ "--pos": pos, "--pos-m": sport.image.mobilePosition ?? pos } as React.CSSProperties}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
            <div className="absolute right-6 top-6 text-gold/60 md:right-8 md:top-8">
              <SportIcon sport={sport.key} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 hidden bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent md:block" />
      </div>
      <div className="relative p-6 md:absolute md:inset-x-0 md:bottom-0 md:p-8">
        <h2 className="font-serif text-4xl text-cream md:text-5xl">{sport.name}</h2>
        {sport.line && <p className="mt-2 max-w-md text-sm leading-relaxed text-slate md:text-base">{sport.line}</p>}
        {sport.href ? (
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-950 transition group-hover:bg-gold-soft">
            {sport.cta ?? `Visit ${sport.name}`} <span aria-hidden="true">→</span>
          </span>
        ) : (
          <span className="mt-5 inline-flex rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/80">{sport.status ?? "Coming soon"}</span>
        )}
      </div>
    </>
  );
  const shape = "group relative block overflow-hidden rounded-[1.75rem] bg-navy-900 ring-1 ring-cream/10 md:min-h-[30rem] lg:min-h-[37rem]";
  return sport.href ? (
    <a href={sport.href} rel="noopener" className={`${shape} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}>
      {inner}
    </a>
  ) : (
    <div className={shape} aria-label={`${sport.name} — coming soon`}>
      {inner}
    </div>
  );
}

/** A slim, low-key row for a sport that isn't ready yet */
function SmallSport({ sport }: { sport: Sport }) {
  const body = (
    <>
      <span className="text-gold/50 [&_svg]:h-8 [&_svg]:w-8">
        <SportIcon sport={sport.key} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-2xl text-cream/90">{sport.name}</span>
        {sport.line && <span className="mt-0.5 block text-sm text-slate">{sport.line}</span>}
        <span className="mt-1 block text-sm text-gold sm:hidden">{sport.href ? (sport.cta ?? "Visit") + " →" : (sport.status ?? "Coming soon")}</span>
      </span>
      <span className="hidden shrink-0 text-sm text-slate sm:block">{sport.href ? (sport.cta ?? "Visit") + " →" : (sport.status ?? "Coming soon")}</span>
    </>
  );
  const cls = "mt-4 flex items-center gap-4 rounded-2xl border border-cream/10 px-5 py-4";
  return sport.href ? (
    <a href={sport.href} rel="noopener" className={`${cls} hover:border-cream/25`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default function HillRisersHome() {
  const large = sports.filter((s) => s.size !== "small");
  const small = sports.filter((s) => s.size === "small");
  return (
    <div className="relative min-h-screen overflow-hidden text-cream">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-navy-800/60 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-gold/[0.07] blur-[110px]" />
      </div>

      <header className="container-x relative flex items-center justify-between py-6">
        <span className="inline-flex items-center gap-3">
          <Crest className="h-11 w-auto" />
          <Wordmark className="h-[1.75rem] w-auto" />
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
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate md:text-xl">{hub.intro}</p>
        <p className="mt-10 text-lg text-cream md:text-xl">{hub.prompt}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {large.map((s) => (
            <SportCard key={s.key} sport={s} />
          ))}
        </div>
        {small.map((s) => (
          <SmallSport key={s.key} sport={s} />
        ))}
      </main>

      <section id="about" className="relative border-t border-cream/10">
        <div className="container-x py-14">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{hub.aboutHeading}</h2>
          <p className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-cream md:text-4xl">{hub.aboutLead}</p>
          {hub.about.map((p) => (
            <p key={p} className="mt-4 max-w-2xl leading-relaxed text-slate">
              {p}
            </p>
          ))}
          <p className="mt-6 text-slate">
            Get in touch:{" "}
            <a href={`mailto:${hub.email}`} className="text-cream underline underline-offset-4 hover:text-gold-soft">{hub.email}</a>
          </p>
        </div>
      </section>

      <footer className="container-x relative border-t border-cream/10 py-8 text-sm text-slate/70">© {new Date().getFullYear()} {hub.legalName} · Company number {hub.companyNumber}</footer>
    </div>
  );
}
