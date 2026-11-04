import { getBlock, monthInvoiceAt, monthLabel, monthlySplit } from "../../data/partners";
import type { NetBooking, PartnerInvoice } from "./store";

/** Shared by the server and the partner pages: no server-only imports here */

/** A booking's months still to be invoiced (monthly terms), with when each invoice is due to be issued */
export function monthsToInvoice(b: Pick<NetBooking, "plan" | "invoices" | "items" | "blockId">) {
  if (b.plan !== "monthly") return [];
  const invoiced = new Set((b.invoices ?? []).flatMap((i) => i.months ?? []));
  return monthlySplit(b.items, b.blockId)
    .filter((m) => !invoiced.has(m.month))
    .map((m) => ({ ...m, issueAt: monthInvoiceAt(m.firstSession).getTime() }));
}

/** Amount paid so far on a booking */
export const paidToDate = (b: NetBooking) =>
  b.invoices?.length ? b.invoices.filter((i) => i.paidAt).reduce((n, i) => n + i.amountPence, 0) : b.paidAt ? b.totalPence : 0;

/** What an invoice is for, e.g. "Autumn block 2026 — November 2026 (monthly, in advance)" */
export function invoiceDescription(b: NetBooking, inv: PartnerInvoice) {
  const block = getBlock(b.blockId)?.label ?? b.blockId;
  if (inv.months?.length) return `${block} — ${inv.months.map(monthLabel).join(" and ")} (monthly, in advance)`;
  if (inv.stage === "balance") return `${block} — balance`;
  if (b.plan === "deposit") return `${block} — deposit`;
  return `${block} — termly, in advance`;
}

/** "Termly in advance" / "Monthly in advance" (earlier bookings: "Paid in full" / "Deposit") */
export const termsLabel = (b: NetBooking) =>
  b.plan === "monthly" ? "Monthly in advance" : b.plan === "termly" ? "Termly in advance" : b.plan === "deposit" ? "Deposit" : "Paid in full";
