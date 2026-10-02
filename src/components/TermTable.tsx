import { DAYS } from "@/data/sessions";
import { site, formatPrice } from "@/data/site";
import { formatTermDate, paymentDueDate, sessionDates, termStartLabel, terms } from "@/data/term";

/** 2026–27 term dates, session counts and fees, from src/data/term.ts. */
export function TermTable() {
  const price = site.standardSession.pricePence;
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
        <table className="w-full min-w-[46rem] text-left text-[0.95rem]">
          <caption className="sr-only">Academy term dates, number of sessions and fees</caption>
          <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-5 py-4">Term</th>
              <th scope="col" className="px-5 py-4">Sessions</th>
              <th scope="col" className="px-5 py-4">No sessions</th>
              <th scope="col" className="px-5 py-4">Fees due by</th>
              <th scope="col" className="px-5 py-4">Sessions per day</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-950/10 align-top text-navy-950">
            {terms.map((t) => (
              <tr key={t.id}>
                <th scope="row" className="px-5 py-5 font-serif text-xl font-medium">{t.name}</th>
                <td className="px-5 py-5">
                  {t.startLabel ? `From ${t.startLabel}` : formatTermDate(t.startsOn, { weekday: true })}
                  <br />
                  <span className="text-ink-muted">to {formatTermDate(t.endsOn, { weekday: true })}</span>
                </td>
                <td className="px-5 py-5 text-ink-muted">
                  {t.noSessions.length
                    ? t.noSessions.map((n) => (
                        <span key={n.from} className="block">
                          {n.label}: {formatTermDate(n.from)} – {formatTermDate(n.to)}
                        </span>
                      ))
                    : "—"}
                </td>
                <td className="px-5 py-5 font-semibold">{formatTermDate(paymentDueDate(t), { weekday: true, year: true })}</td>
                <td className="px-5 py-5">
                  <ul className="space-y-0.5 text-sm">
                    {DAYS.map((d) => {
                      const n = sessionDates(t, d).length;
                      return (
                        <li key={d}>
                          {d}: <strong>{n}</strong> <span className="text-ink-muted">· {formatPrice(n * price)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-muted">
        Fees are paid termly, one week before each term&rsquo;s sessions start. The term fee is the number of sessions in the term × the
        session fee: {formatPrice(price)} for a 90-minute academy session, or {formatPrice(site.littleCricketers.pricePence)} for Little
        Cricketers. Term dates follow the John Lyon School calendar, with no sessions in half terms. Weekend session counts are provisional
        until weekend times are confirmed. {terms[0].name} starts the {termStartLabel(terms[0])}.
      </p>
    </div>
  );
}
