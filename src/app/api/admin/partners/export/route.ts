import { NextResponse } from "next/server";
import { getBlock, timeLabel } from "@/data/partners";
import { formatPrice } from "@/data/site";
import { getPartnerStore } from "@/lib/partners/store";
import { paidToDate, termsLabel } from "@/lib/partners/describe";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV: one row per net booked (confirmed and pending) */
export async function GET() {
  const store = getPartnerStore();
  const [partners, bookings] = await Promise.all([store.listPartners(), store.bookingsFor()]);
  const rows = [["Booked at", "Status", "Partner", "Contact", "Email", "Phone", "Block", "Day", "Time", "Net", "Weeks", "Age group", "Ability", "Gender", "Bowling machine", "Machine coach (Level 2)", "Price", "Booking total", "Payment terms", "Paid to date", "Invoices", "Confirmed at", "Booking ref"]];
  for (const b of bookings) {
    const p = partners.find((x) => x.id === b.partnerId);
    for (const i of b.items) {
      rows.push([b.createdAt, b.status, p?.orgName ?? "", p?.contactName ?? "", p?.email ?? "", p?.phone ?? "", getBlock(b.blockId)?.label ?? b.blockId, i.day, `${timeLabel(i.start)}–${timeLabel(i.end)}`, String(i.net), String(i.weeks), i.ageGroup ?? "", i.ability ?? "", i.gender ?? "", i.bowlingMachine ? "Yes" : "", b.machineCoach ?? "", formatPrice(i.pricePence), formatPrice(b.totalPence), termsLabel(b), formatPrice(paidToDate(b)), (b.invoices ?? []).map((v) => `${v.number} ${formatPrice(v.amountPence)}${v.paidAt ? " paid" : " unpaid"}`).join("; "), b.paidAt ?? "", b.id.slice(0, 8)]);
    }
  }
  return new NextResponse(rows.map((r) => r.map(cell).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="hillrisers-net-bookings.csv"` },
  });
}
