import Link from "next/link";
import { formatPrice } from "@/data/site";
import {
  formatOfferPrice,
  formatProgrammePrice,
  OFFER_HOURLY_PENCE,
  OFFER_LABEL,
  programmes,
  REGISTRATION_FEE_PENCE,
  STANDARD_HOURLY_PENCE,
  type Programme,
} from "@/data/programmes";

/** Standard price, with the offer price highlighted where one applies */
export function ProgrammePrice({ p, light = true, align = "right" }: { p: Programme; light?: boolean; align?: "right" | "left" }) {
  const offer = formatOfferPrice(p);
  if (!offer) return <span className="font-semibold">{formatProgrammePrice(p)}</span>;
  return (
    <span className={`inline-flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="font-semibold">{offer}</span>
      <span className={`text-sm ${light ? "text-ink-muted" : "text-slate"}`}>
        <s>{formatProgrammePrice(p)}</s> · <span className={light ? "text-gold-deep" : "text-gold"}>{p.offerLabel ?? OFFER_LABEL}</span>
      </span>
    </span>
  );
}

/** Programmes and prices — a table on desktop, cards on phones. */
export function ProgrammeTable({ tone = "light" }: { tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <div>
      <p className={`mb-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full px-5 py-2.5 text-sm ${light ? "bg-navy-950 text-cream" : "bg-gold text-navy-950"}`}>
        <strong>{OFFER_LABEL}:</strong> all group programmes {formatPrice(OFFER_HOURLY_PENCE)} per hour
        <span className="opacity-75">(standard rate {formatPrice(STANDARD_HOURLY_PENCE)})</span>
      </p>

      {/* Desktop table */}
      <div className={`hidden overflow-hidden rounded-2xl border md:block ${light ? "border-navy-950/10 bg-white" : "border-cream/10 bg-navy-900"}`}>
        <table className="w-full text-left text-[0.95rem]">
          <caption className="sr-only">HillRisers programmes, ages and prices</caption>
          <thead className={`border-b text-xs uppercase tracking-wider ${light ? "border-navy-950/10 text-ink-muted" : "border-cream/10 text-slate"}`}>
            <tr>
              <th scope="col" className="px-6 py-4">Programme</th>
              <th scope="col" className="px-6 py-4">Ages</th>
              <th scope="col" className="px-6 py-4">What it is</th>
              <th scope="col" className="px-6 py-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${light ? "divide-navy-950/10 text-navy-950" : "divide-cream/10 text-cream"}`}>
            {programmes.map((p) => (
              <tr key={p.key} className="align-top">
                <th scope="row" className="px-6 py-5 font-serif text-xl font-medium">
                  {p.href ? <Link href={p.href} className="link-underline">{p.name}</Link> : p.name}
                </th>
                <td className="px-6 py-5">{p.ages}</td>
                <td className={`px-6 py-5 ${light ? "text-ink-muted" : "text-slate"}`}>
                  {p.summary}
                  {p.fixedTime && <span className={`block font-semibold ${light ? "text-navy-950" : "text-cream"}`}>{p.fixedTime}</span>}
                </td>
                <td className="whitespace-nowrap px-6 py-5 text-right">
                  <ProgrammePrice p={p} light={light} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone cards */}
      <ul className="grid gap-3 md:hidden">
        {programmes.map((p) => (
          <li key={p.key} className={`rounded-2xl border p-5 ${light ? "border-navy-950/10 bg-white text-navy-950" : "border-cream/10 bg-navy-900 text-cream"}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-xl">{p.href ? <Link href={p.href} className="underline underline-offset-4">{p.name}</Link> : p.name}</p>
              <p className={`text-sm ${light ? "text-ink-muted" : "text-slate"}`}>{p.ages}</p>
            </div>
            <p className={`mt-1 text-sm ${light ? "text-ink-muted" : "text-slate"}`}>{p.summary}</p>
            {p.fixedTime && <p className="mt-1 text-sm font-semibold">{p.fixedTime}</p>}
            <p className="mt-3">
              <ProgrammePrice p={p} light={light} align="left" />
            </p>
          </li>
        ))}
      </ul>

      <div className={`mt-5 rounded-2xl p-5 ${light ? "bg-cream-200 text-navy-950" : "bg-navy-950 text-cream"}`}>
        <p className="font-semibold">Registration {formatPrice(REGISTRATION_FEE_PENCE)} for new players, including a HillRisers playing shirt.</p>
        <p className={`mt-2 text-sm leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>
          Group programmes are priced per hour of coaching. Sessions may run for 1 hour, 90 minutes or 2 hours, depending on what families
          tell us they want. Early Risers is priced per session, and the bowling machine net per net per hour.
        </p>
      </div>
    </div>
  );
}
