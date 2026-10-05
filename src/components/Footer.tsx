import Link from "next/link";
import { phoneHref, site } from "@/data/site";
import { Logo } from "./Logo";

const groups = [
  {
    title: "Academy",
    links: [
      { href: "/programmes", label: "Programmes & Prices" },
      { href: "/how-booking-works", label: "How Booking Works" },
      { href: "/girls", label: "Girls Cricket" },
      { href: "/little-cricketers", label: "Little Cricketers" },
      { href: "/camps", label: "Holiday Camps" },
      { href: "/venue", label: "Venue" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { href: "/register", label: "Register Your Interest" },
      { href: "/coaches", label: "Coaching Team" },
      { href: "/refer", label: "Invite a Friend" },
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/safeguarding", label: "Safeguarding" },
      { href: "/privacy", label: "Privacy" },
      { href: "/refunds", label: "Refunds" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-navy-950 pb-28 pt-20 md:pb-12">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-[0.95rem] leading-relaxed text-slate">
              The very best junior cricket coaching for ages {site.ages}, at {site.venue.name}, Harrow on the Hill. Launching{" "}
              1 November.
            </p>
            {(site.phone || site.email) && (
              <div className="mt-6 space-y-1.5 text-[0.95rem]">
                {site.phone && <a href={phoneHref(site.phone)} className="block text-cream hover:text-gold">{site.phone}</a>}
                {site.email && <a href={`mailto:${site.email}`} className="block text-cream hover:text-gold">{site.email}</a>}
              </div>
            )}
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">{g.title}</h2>
              <ul className="mt-5 space-y-3">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-[0.95rem] text-cream/80 hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 rounded-2xl border border-cream/10 bg-navy-900/60 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold" fill="none" aria-hidden="true">
            <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[0.95rem] leading-relaxed text-slate">
            <span className="text-cream">Safeguarding comes first.</span> Every HillRisers coach will hold an enhanced cricket DBS check and
            safeguarding training.
            {site.welfareEmail && (
              <>
                {" "}Welfare contact:{" "}
                <a href={`mailto:${site.welfareEmail}`} className="text-gold-soft underline underline-offset-4">{site.welfareEmail}</a>
              </>
            )}
          </p>
          <Link href="/safeguarding" className="link-underline text-sm font-semibold text-gold">
            Our safeguarding approach
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-cream/10 pt-8 text-sm text-slate md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Junior cricket coaching in Harrow on the Hill, North West London.</p>
        </div>
      </div>
    </footer>
  );
}
