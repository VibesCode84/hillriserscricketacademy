import Link from "next/link";
import { formatTermDate, paymentDueDate, termStartLabel, upcomingTerm } from "@/data/term";

/** Compact "sessions start / fees due" line for the upcoming term, used near prices and CTAs. */
export function TermDates({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  const t = upcomingTerm();
  const started = t.startsOn <= new Date().toISOString().slice(0, 10);
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${light ? "text-ink-muted" : "text-slate"} ${className}`}>
      <span className={`inline-flex items-center gap-2 font-semibold ${light ? "text-navy-950" : "text-cream"}`}>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 ${light ? "text-gold-deep" : "text-gold"}`} fill="none" aria-hidden="true">
          <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {started ? `${t.name} runs until ${formatTermDate(t.endsOn)}` : `${t.name} starts ${termStartLabel(t)}`}
      </span>
      {!started && (
        <>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Fees due by {formatTermDate(paymentDueDate(t), { weekday: true })}</span>
        </>
      )}
      <Link href="/sessions#term-dates" className={`underline underline-offset-4 ${light ? "hover:text-navy-950" : "hover:text-cream"}`}>
        Term dates
      </Link>
    </p>
  );
}
