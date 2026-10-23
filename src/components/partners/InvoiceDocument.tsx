import { bankDetails, company, isPast, ukDateTime } from "@/data/invoicing";
import { findSlot, getBlock, shortDate, timeLabel } from "@/data/partners";
import { formatPrice, site } from "@/data/site";
import type { NetBooking, Partner, PartnerInvoice } from "@/lib/partners/store";
import { Crest } from "../Logo";
import { PrintButton } from "./PrintButton";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long", year: "numeric" });

/** A bank-transfer invoice (standard layout until HillRisers' own template is supplied) */
export function InvoiceDocument({ booking, invoice, partner }: { booking: NetBooking; invoice: PartnerInvoice; partner: Partner }) {
  const block = getBlock(booking.blockId)?.label ?? booking.blockId;
  const nets = booking.items.map((i) => {
    const dates = findSlot(booking.blockId, i.slotKey)?.slot.dates ?? [];
    return {
      key: i.slotKey,
      text: `${i.day} ${timeLabel(i.start)}–${timeLabel(i.end)}, net ${i.net}${i.bowlingMachine ? " + bowling machine" : ""}`,
      detail: `${i.weeks} week${i.weeks === 1 ? "" : "s"}${dates.length ? `, ${shortDate(dates[0])} – ${shortDate(dates.at(-1)!)}` : ""}`,
      pence: i.pricePence,
    };
  });
  const status = invoice.paidAt ? "Paid" : isPast(invoice.dueAt) ? "Overdue" : "Due";
  const rows =
    invoice.stage === "balance"
      ? [{ key: "balance", text: `Balance for ${block} nets`, detail: `Booking total ${formatPrice(booking.totalPence)}, deposit ${formatPrice(booking.depositPence ?? 0)} paid`, pence: invoice.amountPence }]
      : booking.plan === "deposit"
        ? [{ key: "deposit", text: `Deposit to reserve ${block} nets`, detail: `Booking total ${formatPrice(booking.totalPence)}; balance due later`, pence: invoice.amountPence }]
        : nets;

  return (
    <div className="container-x max-w-3xl py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <article className="rounded-3xl bg-white p-8 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-12 print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-navy-950/10 pb-8">
          <div className="flex items-center gap-3">
            <Crest className="h-12 w-auto text-navy-950" />
            <div>
              <p className="font-serif text-2xl font-semibold">{company.legalName}</p>
              <p className="text-sm text-ink-muted">{company.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-4xl">Invoice</p>
            <p className="mt-1 font-mono text-sm">{invoice.number}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${status === "Paid" ? "bg-[#e3f3e8] text-[#1d6b3a]" : status === "Overdue" ? "bg-[#fbeae8] text-[#8c1d18]" : "bg-[#fff4d6] text-[#7a5a00]"}`}>
              {status}
            </span>
          </div>
        </header>

        <section className="grid gap-6 py-8 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Billed to</p>
            <p className="mt-2 font-semibold">{partner.orgName}</p>
            {partner.orgName !== partner.contactName && <p>{partner.contactName}</p>}
            <p>{partner.email}</p>
            <p>{partner.phone}</p>
          </div>
          <dl className="space-y-1 sm:text-right">
            <div><dt className="inline text-ink-muted">Issued: </dt><dd className="inline">{when(invoice.issuedAt)}</dd></div>
            <div><dt className="inline text-ink-muted">Due: </dt><dd className="inline font-semibold">{ukDateTime(invoice.dueAt)}</dd></div>
            <div><dt className="inline text-ink-muted">Booking ref: </dt><dd className="inline font-mono">{booking.id.slice(0, 8).toUpperCase()}</dd></div>
          </dl>
        </section>

        <table className="w-full text-left text-sm">
          <thead className="border-y border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="py-3">Description</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-950/5">
            {rows.map((r) => (
              <tr key={r.key} className="align-top">
                <td className="py-3">
                  <p className="font-semibold">{r.text}</p>
                  <p className="text-ink-muted">{r.detail}</p>
                </td>
                <td className="py-3 text-right">{formatPrice(r.pence)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-navy-950">
              <td className="py-4 text-base font-semibold">Total due</td>
              <td className="py-4 text-right text-base font-semibold">{formatPrice(invoice.amountPence)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.stage !== "balance" && booking.plan === "deposit" && (
          <div className="mt-2 text-sm text-ink-muted">
            <p className="font-semibold text-navy-950">Nets reserved</p>
            <ul className="mt-1 list-disc pl-5">
              {nets.map((n) => <li key={n.key}>{n.text} — {n.detail}</li>)}
            </ul>
          </div>
        )}

        <section className="mt-8 rounded-2xl bg-cream-200 p-6 text-sm print:border print:border-navy-950/20 print:bg-transparent">
          <p className="font-semibold">Pay by bank transfer within 24 hours — no fee</p>
          <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
            <dt className="text-ink-muted">Account name</dt><dd className="font-semibold">{bankDetails.accountName ?? "—"}</dd>
            <dt className="text-ink-muted">Sort code</dt><dd className="font-mono font-semibold">{bankDetails.sortCode ?? "—"}</dd>
            <dt className="text-ink-muted">Account number</dt><dd className="font-mono font-semibold">{bankDetails.accountNumber ?? "—"}</dd>
            <dt className="text-ink-muted">Reference</dt><dd className="font-mono font-semibold">{invoice.number}</dd>
          </dl>
          <p className="mt-4 text-ink-muted">
            {invoice.stage === "balance"
              ? "If the balance isn't paid by your deadline, the nets are released and the deposit isn't refunded."
              : "Your nets are held until the due time. If payment hasn't arrived by then, they're released for other partners."}{" "}
            Our bank details will never change by email.
          </p>
        </section>

        <footer className="mt-10 border-t border-navy-950/10 pt-6 text-xs text-ink-muted">
          {company.legalName} · Company number {company.companyNumber}
          {company.registeredOffice ? ` · Registered office: ${company.registeredOffice}` : ""} · {company.email} · {site.url.replace(/^https?:\/\//, "")}
        </footer>
      </article>
    </div>
  );
}
