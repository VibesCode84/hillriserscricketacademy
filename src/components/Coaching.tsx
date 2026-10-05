import { coachExperience, coachingPhilosophy, sessionFlow } from "@/data/coaching";
import { Reveal } from "./Reveal";

export function CoachingPhilosophy({ tone = "light", limit }: { tone?: "light" | "dark"; limit?: number }) {
  const light = tone === "light";
  const items = limit ? coachingPhilosophy.slice(0, limit) : coachingPhilosophy;
  return (
    <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <Reveal key={p.t} delay={(i % 3) * 80} className={`border-t pt-6 ${light ? "border-navy-950/10" : "border-cream/10"}`}>
          <span className={`font-serif text-lg ${light ? "text-gold-deep" : "text-gold"}`}>{String(i + 1).padStart(2, "0")}</span>
          <h3 className={`mt-2 text-2xl ${light ? "text-navy-950" : "text-cream"}`}>{p.t}</h3>
          <p className={`mt-2 leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>{p.b}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function CoachExperience({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {coachExperience.map((x, i) => (
        <Reveal
          as="li"
          key={x}
          delay={(i % 2) * 60}
          className={`flex gap-4 rounded-2xl border p-5 ${light ? "border-navy-950/10 bg-white text-navy-950" : "border-cream/10 bg-navy-900 text-cream"}`}
        >
          <svg viewBox="0 0 20 20" className={`mt-0.5 h-5 w-5 shrink-0 ${light ? "text-gold-deep" : "text-gold"}`} fill="none" aria-hidden="true">
            <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="leading-relaxed">{x}</span>
        </Reveal>
      ))}
    </ul>
  );
}

export function SessionFlow({ tone = "light" }: { tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <ol className="grid gap-5 md:grid-cols-5">
      {sessionFlow.map((s, i) => (
        <Reveal as="li" key={s.t} delay={i * 70} className={`rounded-2xl p-6 ${light ? "bg-white" : "bg-navy-900"}`}>
          <span className={`font-serif text-4xl ${light ? "text-gold-deep" : "text-gold"}`}>{i + 1}</span>
          <h3 className={`mt-3 text-xl ${light ? "text-navy-950" : "text-cream"}`}>{s.t}</h3>
          <p className={`mt-2 text-[0.95rem] leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>{s.b}</p>
        </Reveal>
      ))}
    </ol>
  );
}
