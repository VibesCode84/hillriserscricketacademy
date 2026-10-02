import { Reveal } from "./Reveal";

const stages = [
  { name: "Explore", body: "Enjoy the game and develop fundamental movement and technique." },
  { name: "Develop", body: "Build stronger skills and repeatable technique." },
  { name: "Perform", body: "Apply those skills under pressure and in realistic scenarios." },
  { name: "Excel", body: "Create an individual game and prepare for higher-level cricket." },
];

export function Pathway({ tone = "light" }: { tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
      <span className={`absolute left-0 right-0 top-[1.15rem] hidden h-px md:block ${light ? "bg-navy-950/15" : "bg-cream/15"}`} aria-hidden="true" />
      {stages.map((s, i) => (
        <Reveal as="li" key={s.name} delay={i * 90} className="relative">
          <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${light ? "border-gold-deep bg-cream text-gold-deep" : "border-gold bg-navy-950 text-gold"}`}>
            {i + 1}
          </span>
          <h3 className={`mt-5 text-3xl ${light ? "text-navy-950" : "text-cream"}`}>{s.name}</h3>
          <p className={`mt-2 leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>{s.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}

export function PathwayNote({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <p className={`mt-10 text-sm ${tone === "light" ? "text-ink-muted" : "text-slate"}`}>
      Every player receives term feedback and milestones as they progress. We don&rsquo;t promise representative selection — we help
      players build the skills and habits higher-level cricket asks for.
    </p>
  );
}
