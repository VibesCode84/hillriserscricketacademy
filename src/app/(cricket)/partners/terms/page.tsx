import type { Metadata } from "next";
import { partnerTerms } from "@/data/partner-terms";

export const metadata: Metadata = { title: "Partner terms" };

export default function PartnerTermsPage() {
  return (
    <main className="container-x max-w-3xl py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">Draft — to be reviewed</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Partner terms</h1>
      <p className="mt-4 text-ink-muted">These terms apply to sessions run by HillRisers delivery partners at John Lyon School, Harrow on the Hill, including use of the bowling machine.</p>
      <ol className="mt-10 space-y-7">
        {partnerTerms.map((x, i) => (
          <li key={x.t}>
            <h2 className="text-2xl">{i + 1}. {x.t}</h2>
            <p className="mt-2 leading-relaxed text-ink-muted">{x.b}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
