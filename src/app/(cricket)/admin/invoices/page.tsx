/* eslint-disable @next/next/no-html-link-for-pages -- the CSV is a download, not a page */
import Link from "next/link";
import { formatPrice } from "@/data/site";
import { daysAgo, ukDateTime } from "@/data/invoicing";
import { getPartnerStore } from "@/lib/partners/store";
import { ledger, statusLabel, type LedgerStatus } from "@/lib/invoices/ledger";
import { CustomerForm } from "@/components/invoices/CustomerForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoices" };

const badge: Record<LedgerStatus, string> = {
  draft: "bg-cream-200 text-ink-muted",
  unpaid: "bg-[#fff4d6] text-[#7a5a00]",
  overdue: "bg-[#fbeae8] text-[#8c1d18]",
  paid: "bg-[#e3f3e8] text-[#1d6b3a]",
  void: "bg-cream-200 text-ink-muted line-through",
  lapsed: "bg-cream-200 text-ink-muted",
};
const filters: { key: string; label: string; match: (s: LedgerStatus) => boolean }[] = [
  { key: "open", label: "To be paid", match: (s) => s === "unpaid" || s === "overdue" },
  { key: "overdue", label: "Overdue", match: (s) => s === "overdue" },
  { key: "draft", label: "Drafts", match: (s) => s === "draft" },
  { key: "paid", label: "Paid", match: (s) => s === "paid" },
  { key: "all", label: "All", match: () => true },
];
const day = (iso?: string) => (iso ? ukDateTime(iso, "short").replace(/^\S+ /, "") : "—");

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ show?: string; type?: string }> }) {
  const sp = await searchParams;
  const [rows, customers] = await Promise.all([ledger(), getPartnerStore().listCustomers()]);
  const filter = filters.find((f) => f.key === sp.show) ?? filters[0];
  const type = sp.type === "partner" || sp.type === "invoice" ? sp.type : undefined;
  const shown = rows.filter((r) => filter.match(r.status) && (!type || r.source === type));
  const sum = (match: (s: LedgerStatus) => boolean, since?: string) => rows.filter((r) => match(r.status) && (!since || (r.paidAt ?? "") > since)).reduce((n, r) => n + r.totalPence, 0);
  const href = (q: Record<string, string | undefined>) => `/admin/invoices?${new URLSearchParams(Object.entries({ show: filter.key, type, ...q }).filter(([, v]) => v) as [string, string][])}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Invoices</h1>
        <div className="flex gap-3">
          <Link href="/admin/invoices/new" className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream">New invoice</Link>
          <a href="/api/admin/invoices/export" className="rounded-full border border-navy-950/20 px-5 py-2.5 text-sm font-semibold">Download CSV</a>
        </div>
      </header>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["To be paid", sum((s) => s === "unpaid" || s === "overdue")],
          ["Overdue", sum((s) => s === "overdue")],
          ["Paid in the last 30 days", sum((s) => s === "paid", daysAgo(30))],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-navy-950/10 bg-white p-5">
            <dt className="text-sm text-ink-muted">{k}</dt>
            <dd className="mt-1 font-serif text-3xl">{formatPrice(v as number)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
        {filters.map((f) => (
          <Link key={f.key} href={href({ show: f.key })} className={`rounded-full px-3 py-1.5 font-semibold ${f.key === filter.key ? "bg-navy-950 text-cream" : "bg-white"}`}>{f.label}</Link>
        ))}
        <span className="mx-2 text-ink-muted">·</span>
        {[
          [undefined, "Everything"],
          ["invoice", "Raised here"],
          ["partner", "Partner bookings"],
        ].map(([k, label]) => (
          <Link key={label} href={href({ type: k })} className={`rounded-full px-3 py-1.5 font-semibold ${type === k ? "bg-navy-950 text-cream" : "bg-white"}`}>{label}</Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
        {shown.length === 0 ? (
          <p className="p-5 text-sm text-ink-muted">No invoices here.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
              <tr><th className="px-4 py-3">Number</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">For</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {shown.map((r) => (
                <tr key={`${r.source}${r.id}`}>
                  <td className="px-4 py-3 font-mono"><Link href={r.href} className="underline">{r.number ?? "Draft"}</Link></td>
                  <td className="px-4 py-3">{r.party}{r.source === "partner" && <span className="ml-1 text-xs text-ink-muted">(partner)</span>}</td>
                  <td className="max-w-xs truncate px-4 py-3" title={r.description}>{r.description}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(r.totalPence)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{day(r.issuedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{day(r.dueAt)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.status]}`}>{statusLabel[r.status]}{r.status === "paid" && r.paidAt ? ` ${day(r.paidAt)}` : ""}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-muted">Partner booking invoices are marked as paid on the Delivery partners page.</p>

      <section className="mt-12">
        <h2 className="text-2xl">Customers</h2>
        {customers.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {customers.map((c) => (
              <li key={c.id} className="rounded-2xl border border-navy-950/10 bg-white p-4 text-sm">
                <strong>{c.name}</strong>
                <span className="block text-ink-muted">{[c.contactName, c.email].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4"><CustomerForm /></div>
      </section>
    </div>
  );
}
