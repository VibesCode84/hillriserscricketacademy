import Link from "next/link";
import { FEES_NOTE, programmes } from "@/data/programmes";

/** Programmes and ages — a table on desktop, cards on phones. */
export function ProgrammeTable({ tone = "light" }: { tone?: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <div>
      {/* Desktop table */}
      <div className={`hidden overflow-hidden rounded-2xl border md:block ${light ? "border-navy-950/10 bg-white" : "border-cream/10 bg-navy-900"}`}>
        <table className="w-full text-left text-[0.95rem]">
          <caption className="sr-only">HillRisers programmes and ages</caption>
          <thead className={`border-b text-xs uppercase tracking-wider ${light ? "border-navy-950/10 text-ink-muted" : "border-cream/10 text-slate"}`}>
            <tr>
              <th scope="col" className="px-6 py-4">Programme</th>
              <th scope="col" className="px-6 py-4">Ages</th>
              <th scope="col" className="px-6 py-4">What it is</th>
              <th scope="col" className="px-6 py-4">Fee</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${light ? "divide-navy-950/10 text-navy-950" : "divide-cream/10 text-cream"}`}>
            {programmes.map((p) => (
              <tr key={p.key} className="align-top">
                <th scope="row" className="px-6 py-5 font-serif text-xl font-medium">
                  {p.href ? <Link href={p.href} className="link-underline">{p.name}</Link> : p.name}
                </th>
                <td className="whitespace-nowrap px-6 py-5">{p.ages}</td>
                <td className={`px-6 py-5 ${light ? "text-ink-muted" : "text-slate"}`}>{p.summary}</td>
                <td className="px-6 py-5">{p.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`mt-4 text-sm ${light ? "text-ink-muted" : "text-slate"}`}>{FEES_NOTE}</p>

      {/* Phone cards */}
      <ul className="grid gap-3 md:hidden">
        {programmes.map((p) => (
          <li key={p.key} className={`rounded-2xl border p-5 ${light ? "border-navy-950/10 bg-white text-navy-950" : "border-cream/10 bg-navy-900 text-cream"}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-xl">{p.href ? <Link href={p.href} className="underline underline-offset-4">{p.name}</Link> : p.name}</p>
              <p className={`text-sm ${light ? "text-ink-muted" : "text-slate"}`}>{p.ages}</p>
            </div>
            <p className={`mt-1 text-sm ${light ? "text-ink-muted" : "text-slate"}`}>{p.summary}</p>
            <p className="mt-2 text-sm font-semibold">{p.fee}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
