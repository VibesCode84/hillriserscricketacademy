import { keyDates } from "@/data/launch";

export function KeyDates({ tone = "light" }: { tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <ol className={`divide-y overflow-hidden rounded-2xl border ${light ? "divide-navy-950/10 border-navy-950/10 bg-white" : "divide-cream/10 border-cream/10 bg-navy-900"}`}>
      {keyDates.map((d) => (
        <li key={d.date} className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6 md:px-6">
          <span className={`font-semibold ${light ? "text-gold-deep" : "text-gold"}`}>{d.date}</span>
          <span className={light ? "text-navy-950" : "text-cream"}>
            {d.label}
            {d.detail && <span className={`block text-sm ${light ? "text-ink-muted" : "text-slate"}`}>{d.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
