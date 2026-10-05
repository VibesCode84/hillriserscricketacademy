import type { Coach } from "@/data/coaches";
import { Photo } from "./Photo";

export function CoachCard({ coach, tone = "dark" }: { coach: Coach; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl ${light ? "bg-white" : "bg-navy-900"}`}>
      <Photo
        src={coach.image?.src}
        alt={coach.image?.alt ?? coach.name}
        className="aspect-[4/5]"
        tone="warm"
        sizes="(min-width: 1024px) 25vw, 50vw"
        showCaption={false}
      />
      <div className="flex flex-1 flex-col p-6">
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${light ? "text-gold-deep" : "text-gold"}`}>{coach.role}</p>
        <h3 className={`mt-2 text-2xl ${light ? "text-navy-950" : "text-cream"}`}>{coach.name}</h3>
        {coach.philosophy && (
          <blockquote className={`mt-4 flex-1 font-serif text-[1.2rem] italic leading-snug ${light ? "text-navy-900" : "text-cream/90"}`}>
            &ldquo;{coach.philosophy}&rdquo;
          </blockquote>
        )}
        <dl className={`mt-5 space-y-2 border-t pt-4 text-sm ${light ? "border-navy-950/10 text-ink-muted" : "border-cream/10 text-slate"}`}>
          <div>
            <dt className="sr-only">Qualifications</dt>
            <dd>{coach.qualifications}</dd>
          </div>
          <div>
            <dt className="sr-only">Background</dt>
            <dd>{coach.background}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

/** Shown until coaches have signed — swap for CoachCards by adding entries to src/data/coaches.ts */
export function CoachesComingSoon({ tone = "light" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <div className={`rounded-3xl border p-8 md:p-10 ${light ? "border-navy-950/10 bg-white" : "border-cream/10 bg-navy-900"}`}>
      <p className={`eyebrow ${light ? "!text-gold-deep" : ""}`}>Coaching team</p>
      <p className={`mt-4 font-serif text-3xl ${light ? "text-navy-950" : "text-cream"}`}>Coaching team announced soon.</p>
      <p className={`mt-3 max-w-2xl leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>
        We&rsquo;re recruiting now. Every HillRisers coach will hold an ECB coaching qualification, an enhanced cricket DBS check and
        safeguarding training. We&rsquo;ll introduce each coach — with their qualifications and playing background — once they&rsquo;ve
        signed.
      </p>
    </div>
  );
}
