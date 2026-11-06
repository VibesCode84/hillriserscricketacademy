import { bankDetails, company, isPast } from "@/data/invoicing";
import { formatPrice, site } from "@/data/site";
import { invoiceTotal, type Customer, type ManualInvoice } from "@/lib/partners/store";
import { Crest } from "../Logo";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long", year: "numeric" });
const qty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** An invoice raised in admin, as the customer sees it (and prints it) */
export function CustomerInvoiceDocument({ invoice, customer }: { invoice: ManualInvoice; customer?: Customer }) {
  const total = invoiceTotal(invoice);
  const status =
    invoice.status === "paid" ? "Paid" : invoice.status === "void" ? "Void" : invoice.status === "draft" ? "Draft" : invoice.dueAt && isPast(invoice.dueAt) ? "Overdue" : "Due";
  return (
    <article className="rounded-3xl bg-white p-8 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-12 print:rounded-none print:p-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-navy-950/10 pb-8">
        <div className="flex items-center gap-3">
          <Crest className="h-12 w-auto" />
          <div>
            <p className="font-serif text-2xl font-semibold">{company.legalName}</p>
            <p className="text-sm text-ink-muted">{company.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif text-4xl">Invoice</p>
          <p className="mt-1 font-mono text-sm">{invoice.number ?? "Draft"}</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              status === "Paid" ? "bg-[#e3f3e8] text-[#1d6b3a]" : status === "Overdue" ? "bg-[#fbeae8] text-[#8c1d18]" : status === "Void" || status === "Draft" ? "bg-cream-200 text-ink-muted" : "bg-[#fff4d6] text-[#7a5a00]"
            }`}
          >
            {status}
          </span>
        </div>
      </header>

      <section className="grid gap-6 py-8 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Billed to</p>
          <p className="mt-2 font-semibold">{customer?.name ?? "—"}</p>
          {customer?.contactName && <p>{customer.contactName}</p>}
          {customer?.address && <p className="whitespace-pre-line">{customer.address}</p>}
          {customer?.email && <p>{customer.email}</p>}
        </div>
        <dl className="space-y-1 sm:text-right">
          {invoice.issuedAt && <div><dt className="inline text-ink-muted">Issued: </dt><dd className="inline">{when(invoice.issuedAt)}</dd></div>}
          <div>
            <dt className="inline text-ink-muted">Due: </dt>
            <dd className="inline font-semibold">{invoice.dueDays === 0 ? "On receipt" : invoice.dueAt ? when(invoice.dueAt) : `${invoice.dueDays} days after issue`}</dd>
          </div>
          {invoice.paidAt && <div><dt className="inline text-ink-muted">Paid: </dt><dd className="inline">{when(invoice.paidAt)}</dd></div>}
        </dl>
      </section>

      <table className="w-full text-left text-sm">
        <thead className="border-y border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
          <tr>
            <th className="py-3">Description</th>
            <th className="py-3 text-right">Qty</th>
            <th className="py-3 text-right">Price</th>
            <th className="py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-950/5">
          {invoice.lines.map((l, i) => (
            <tr key={i} className="align-top">
              <td className="py-3 pr-4">{l.description}</td>
              <td className="py-3 text-right">{qty(l.quantity)}</td>
              <td className="py-3 text-right">{formatPrice(l.unitPence)}</td>
              <td className="py-3 text-right">{formatPrice(Math.round(l.quantity * l.unitPence))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-navy-950">
            <td className="py-4 text-base font-semibold" colSpan={3}>Total due</td>
            <td className="py-4 text-right text-base font-semibold">{formatPrice(total)}</td>
          </tr>
        </tfoot>
      </table>

      {invoice.notes && <p className="mt-4 whitespace-pre-line text-sm text-ink-muted">{invoice.notes}</p>}

      {invoice.status !== "void" && (
        <section className="mt-8 rounded-2xl bg-cream-200 p-6 text-sm print:border print:border-navy-950/20 print:bg-transparent">
          <p className="font-semibold">Pay by bank transfer</p>
          <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
            <dt className="text-ink-muted">Account name</dt><dd className="font-semibold">{bankDetails.accountName ?? "—"}</dd>
            <dt className="text-ink-muted">Sort code</dt><dd className="font-mono font-semibold">{bankDetails.sortCode ?? "—"}</dd>
            <dt className="text-ink-muted">Account number</dt><dd className="font-mono font-semibold">{bankDetails.accountNumber ?? "—"}</dd>
            <dt className="text-ink-muted">Reference</dt><dd className="font-mono font-semibold">{invoice.number ?? "—"}</dd>
          </dl>
          <p className="mt-4 text-ink-muted">Our bank details will never change by email.</p>
        </section>
      )}

      <footer className="mt-10 border-t border-navy-950/10 pt-6 text-xs text-ink-muted">
        {company.legalName} · Company number {company.companyNumber}
        {company.registeredOffice ? ` · Registered office: ${company.registeredOffice}` : ""} · {company.email} · {site.url.replace(/^https?:\/\//, "")}
      </footer>
    </article>
  );
}
