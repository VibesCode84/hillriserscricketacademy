import type { Metadata } from "next";
import Link from "next/link";
import { Crest } from "@/components/Logo";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { default: "Partner portal", template: "%s | HillRisers partner portal" },
  robots: { index: false, follow: false },
};

/** Standalone layout for coaches and delivery partners (not linked from the parent-facing site) */
export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-navy-950">
      <header className="bg-navy-950">
        <div className="container-x flex items-center justify-between py-5">
          <Link href="/partners" className="inline-flex items-center gap-3">
            <Crest className="h-9 w-auto" />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[1.45rem] font-semibold text-cream">HillRisers</span>
              <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold">Partner portal</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate">
            <Link href="/partners/terms" className="hover:text-cream">Partner terms</Link>
            <Link href="/partners/portal" className="font-semibold text-cream hover:text-gold">My account</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="container-x border-t border-navy-950/10 py-8 text-sm text-ink-muted">
        HillRisers CIC · John Lyon School, Harrow on the Hill ·{" "}
        <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>
      </footer>
    </div>
  );
}
