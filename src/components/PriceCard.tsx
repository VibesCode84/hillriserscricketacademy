import Link from "next/link";
import { site, formatPrice } from "@/data/site";
import { ButtonLink } from "./Button";
import { TermDates } from "./TermDates";

const included = [
  "Lead coach",
  "Assistant coach",
  "Two junior coaching helpers",
  "Specialist technical development",
  "Game-based learning",
  "Small-group station work",
  "Individual feedback every session",
  `Maximum ${site.standardSession.capacity} players`,
];

/** Value is explained before price — the £25 never appears first. */
export function PriceCard({ ctaHref = "/book", className = "" }: { ctaHref?: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-gold/30 bg-navy-950 p-8 text-cream md:p-10 ${className}`}>
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <p className="eyebrow">Specialist Academy</p>
      <h3 className="mt-4 text-3xl leading-tight md:text-4xl">A 90-minute specialist session</h3>
      <p className="mt-3 text-slate">With a dedicated coaching team, structured development and small working groups.</p>
      <ul className="mt-7 grid gap-3 sm:grid-cols-2">
        {included.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[0.95rem]">
            <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-gold" fill="none" aria-hidden="true">
              <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-9 flex flex-col gap-6 border-t border-cream/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <p>
          <span className="font-serif text-6xl leading-none text-cream">{formatPrice(site.standardSession.pricePence)}</span>
          <span className="ml-2 text-slate">per session, paid termly</span>
        </p>
        <ButtonLink href={ctaHref} arrow className="group">Book a Trial</ButtonLink>
      </div>
      <TermDates className="mt-6" />
      <p className="mt-4 text-sm text-slate">
        Not sure which academy is right?{" "}
        <Link href="/find-my-session" className="text-gold-soft underline underline-offset-4 hover:text-gold">
          Tell us about your child
        </Link>{" "}
        and we&rsquo;ll recommend the best place to start.
      </p>
    </div>
  );
}
