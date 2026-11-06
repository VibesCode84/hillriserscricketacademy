"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/data/site";
import type { Customer, ManualInvoice } from "@/lib/partners/store";

type Line = { description: string; quantity: string; unit: string };
const TERMS = [
  { days: 0, label: "Due on receipt" },
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];
const toPence = (v: string) => Math.round(Number(v.replace(/[£,\s]/g, "")) * 100);

/** Admin: write a draft invoice, then save it or save and send it */
export function InvoiceEditor({ customers, invoice }: { customers: Customer[]; invoice?: ManualInvoice }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(invoice?.customerId ?? "");
  const [lines, setLines] = useState<Line[]>(
    invoice?.lines.map((l) => ({ description: l.description, quantity: String(l.quantity), unit: (l.unitPence / 100).toFixed(2) })) ?? [{ description: "", quantity: "1", unit: "" }],
  );
  const [dueDays, setDueDays] = useState(invoice?.dueDays ?? 14);
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [busy, setBusy] = useState<"" | "save" | "send">("");
  const [error, setError] = useState("");

  const parsed = lines.map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity), unitPence: toPence(l.unit) }));
  const valid = parsed.filter((l) => l.description && l.quantity > 0 && Number.isFinite(l.unitPence));
  const total = valid.reduce((n, l) => n + Math.round(l.quantity * l.unitPence), 0);
  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const save = async (andSend: boolean) => {
    setError("");
    if (!customerId) return setError("Choose a customer.");
    if (valid.length !== lines.filter((l) => l.description || l.unit).length || !valid.length) return setError("Each line needs a description, quantity and price.");
    if (andSend && !window.confirm(`Send this invoice for ${formatPrice(total)}? It will be numbered and emailed to the customer.`)) return;
    setBusy(andSend ? "send" : "save");
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoice?.id, customerId, lines: valid, notes: notes || undefined, dueDays }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setBusy("");
      return setError(json.message ?? "Something went wrong.");
    }
    const id = json.invoice.id as string;
    if (andSend) {
      const sent = await fetch("/api/admin/invoices/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "send" }) });
      const sj = await sent.json().catch(() => ({}));
      if (!sent.ok || !sj.ok) setError(sj.message ?? "Saved, but it couldn't be sent.");
    }
    setBusy("");
    router.push(`/admin/invoices/${id}`);
    router.refresh();
  };

  return (
    <div className="space-y-6 rounded-2xl border border-navy-950/10 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inv-customer" className="label">Customer</label>
          <select id="inv-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="field">
            <option value="">Choose…</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {customers.length === 0 && <p className="hint">Add a customer on the Invoices page first.</p>}
        </div>
        <div>
          <label htmlFor="inv-terms" className="label">Payment terms</label>
          <select id="inv-terms" value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} className="field">
            {TERMS.map((t) => <option key={t.days} value={t.days}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <p className="label">Lines</p>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_7rem_2rem] items-center gap-2">
              <input aria-label="Description" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="e.g. Sports hall, Sundays 9–11am, November (4 sessions)" className="field !mt-0" />
              <input aria-label="Quantity" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} inputMode="decimal" className="field !mt-0 text-right" />
              <input aria-label="Price (£)" value={l.unit} onChange={(e) => setLine(i, { unit: e.target.value })} inputMode="decimal" placeholder="£0.00" className="field !mt-0 text-right" />
              <button type="button" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))} aria-label="Remove line" className="text-lg text-ink-muted">×</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => setLines((ls) => [...ls, { description: "", quantity: "1", unit: "" }])} className="text-sm font-semibold underline underline-offset-4">+ Add line</button>
          <p className="text-lg font-semibold">Total {formatPrice(total)}</p>
        </div>
      </div>

      <div>
        <label htmlFor="inv-notes" className="label">Notes <span className="font-normal text-ink-muted">(optional, shown on the invoice)</span></label>
        <textarea id="inv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="field" />
      </div>

      {error && <p className="error-text" role="alert">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={!!busy} onClick={() => save(true)} className="rounded-full bg-[#1d6b3a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy === "send" ? "Sending…" : "Save and send"}
        </button>
        <button type="button" disabled={!!busy} onClick={() => save(false)} className="rounded-full border border-navy-950/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
          {busy === "save" ? "Saving…" : "Save draft"}
        </button>
      </div>
    </div>
  );
}
