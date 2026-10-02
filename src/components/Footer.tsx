import Link from "next/link";
import { site } from "@/data/site";
import { Logo } from "./Logo";

const groups = [
  {
    title: "Academy",
    links: [
      { href: "/academy", label: "The Academy" },
      { href: "/academy/batting", label: "Batting" },
      { href: "/academy/seam-bowling", label: "Seam Bowling" },
      { href: "/academy/spin-bowling", label: "Spin Bowling" },
      { href: "/academy/power", label: "Power & Range" },
      { href: "/academy/performance", label: "Performance" },
    ],
  },
  {
    title: "Families",
    links: [
      { href: "/girls", label: "Girls Cricket" },
      { href: "/little-cricketers", label: "Little Cricketers" },
      { href: "/sessions", label: "Timetable & Price" },
      { href: "/find-my-session", label: "Find My Session" },
      { href: "/coaches", label: "Coaches" },
      { href: "/refer", label: "Invite a Friend" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/safeguarding", label: "Safeguarding" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refunds", label: "Refund Policy" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/contact", label: "Contact" },
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
              Specialist junior cricket coaching for players aged 4–14 at {site.venue.name}, Harrow.
            </p>
            <div className="mt-6 space-y-1.5 text-[0.95rem]">
              <a href={site.phoneHref} className="block text-cream hover:text-gold">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="block text-cream hover:text-gold">{site.email}</a>
            </div>
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
            <span className="text-cream">Safeguarding comes first.</span> All coaches and helpers are DBS checked and follow our
            safeguarding policy. Welfare contact:{" "}
            <a href={`mailto:${site.welfareOfficer.email}`} className="text-gold-soft underline underline-offset-4">
              {site.welfareOfficer.email}
            </a>
          </p>
          <Link href="/safeguarding" className="link-underline text-sm font-semibold text-gold">
            Our safeguarding approach
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-cream/10 pt-8 text-sm text-slate md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Junior cricket coaching in Harrow, Northwood, Ruislip and North West London.</p>
        </div>
      </div>
    </footer>
  );
}
