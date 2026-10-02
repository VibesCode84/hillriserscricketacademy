import { termPaymentDueLabel, termStartLabel } from "@/data/term";

/** Compact "sessions start / fees due" line, used near prices and CTAs. */
export function TermDates({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${light ? "text-ink-muted" : "text-slate"} ${className}`}>
      <span className={`inline-flex items-center gap-2 font-semibold ${light ? "text-navy-950" : "text-cream"}`}>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 ${light ? "text-gold-deep" : "text-gold"}`} fill="none" aria-hidden="true">
          <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Sessions start {termStartLabel}
      </span>
      <span aria-hidden="true" className="hidden sm:inline">·</span>
      <span>Termly fees due by {termPaymentDueLabel}</span>
    </p>
  );
}
