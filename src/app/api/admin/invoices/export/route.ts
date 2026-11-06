import { NextResponse } from "next/server";
import { formatPrice } from "@/data/site";
import { ledger, statusLabel } from "@/lib/invoices/ledger";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" }) : "");

/** Admin: every invoice as CSV, for the accounts */
export async function GET() {
  const rows = [["Number", "Status", "Type", "Customer", "Email", "Description", "Amount", "Issued", "Due", "Paid"]];
  for (const r of await ledger()) {
    rows.push([r.number ?? "(draft)", statusLabel[r.status], r.source === "partner" ? "Partner booking" : "Invoice", r.party, r.email ?? "", r.description, formatPrice(r.totalPence), day(r.issuedAt), day(r.dueAt), day(r.paidAt)]);
  }
  return new NextResponse(rows.map((r) => r.map(cell).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="hillrisers-invoices.csv"` },
  });
}
