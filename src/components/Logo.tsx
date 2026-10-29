import Link from "next/link";
import { crestPaths as c, wordmark } from "./logo-paths";

export const brand = { navy: "#071B3F", richNavy: "#0A2A5E", gold: "#E8B84E", ivory: "#F5F0E6" };

/** Icon-only crest: shield, spire and hills (works on dark and light backgrounds) */
export function Crest({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <path d={c.shield} fill={brand.navy} />
      <path d={c.border} fill={brand.richNavy} />
      <path d={c.border} fill="none" stroke={brand.gold} strokeWidth="3.2" strokeLinejoin="round" />
      <g transform="translate(0 8)">
        <path d={c.spireLeft} fill={brand.gold} />
        <path d={c.spireCentre} fill={brand.ivory} />
        <path d={c.spireRight} fill={brand.gold} />
        <path d={c.hillFront} fill="none" stroke={brand.gold} strokeWidth="3.2" strokeLinecap="round" />
        <path d={c.hillBack} fill="none" stroke={brand.gold} strokeWidth="3.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** "HillRisers" wordmark: Hill in ivory (on dark) or navy (on light), Risers in gold */
export function Wordmark({ className = "h-7 w-auto", on = "dark" }: { className?: string; on?: "dark" | "light" }) {
  return (
    <svg viewBox={wordmark.viewBox} className={className} role="img" aria-label="HillRisers">
      <path d={wordmark.hill} fill={on === "dark" ? brand.ivory : brand.navy} />
      <path d={wordmark.risers} fill={brand.gold} />
    </svg>
  );
}

/** Horizontal lockup; in the header (`iconOnPhones`) phones show the crest only */
export function Logo({ compact = false, iconOnPhones = false }: { compact?: boolean; iconOnPhones?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="HillRisers Cricket Academy — home">
      <Crest className="h-12 w-auto shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5" />
      <span className={`${iconOnPhones ? "hidden sm:flex" : "flex"} flex-col leading-none`}>
        <Wordmark className="h-[1.6rem] w-auto" />
        {!compact && <span className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold">Cricket Academy</span>}
      </span>
    </Link>
  );
}
