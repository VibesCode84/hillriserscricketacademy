import Link from "next/link";

export function Crest({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden="true" fill="none">
      <path
        d="M20 1.5 37.5 7.2V22c0 11.6-7.4 19.6-17.5 24.4C9.9 41.6 2.5 33.6 2.5 22V7.2L20 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-gold"
      />
      <path d="M13.5 13v22M26.5 13v22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-cream" />
      <path d="M9 30.5c5.2-1.2 9.6-4.6 13.2-8.3 2.6-2.6 5.4-4.3 9-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-gold" />
      <path d="M12 33.6l1.2-1.6M16 31.8l1-1.7M19.8 29.3l.8-1.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-gold-soft" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Hillrisers Cricket Academy — home">
      <Crest className="h-10 w-auto shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.55rem] font-semibold tracking-tight text-cream">Hillrisers</span>
        {!compact && (
          <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold">Cricket Academy</span>
        )}
      </span>
    </Link>
  );
}
