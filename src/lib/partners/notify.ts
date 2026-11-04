import { findSlot, getBlock, shortDate, timeLabel } from "../../data/partners";
import { invoiceDescription, termsLabel } from "./describe";

export { invoiceDescription };
import { sendBookingDeclined, sendBookingRequestReceived, sendPartnerBookingConfirmation, sendPartnerInvoice, sendPartnerPaymentReceipt } from "../email";
import { getPartnerStore, monthsToInvoice, type NetBooking, type PartnerInvoice } from "./store";

/** "Saturday 2:30–3:30pm, net 1 + bowling machine (Under 11, Beginner, Mixed) — 4 weeks, 21 Nov – 12 Dec" */
export function netLines(b: NetBooking) {
  return b.items.map((i) => {
    const dates = findSlot(b.blockId, i.slotKey)?.slot.dates ?? [];
    const who = i.ageGroup ? ` (${[i.ageGroup, i.ability, i.gender].join(", ")})` : "";
    const span = dates.length ? `, ${shortDate(dates[0])}${dates.length > 1 ? ` – ${shortDate(dates.at(-1)!)}` : ""}` : "";
    return `${i.day} ${timeLabel(i.start)}–${timeLabel(i.end)}, net ${i.net}${i.bowlingMachine ? " + bowling machine" : ""}${who} — ${i.weeks} week${i.weeks === 1 ? "" : "s"}${span}`;
  });
}

export const invoiceLines = (b: NetBooking, inv: PartnerInvoice) => ({
  description: invoiceDescription(b, inv),
  blockLabel: getBlock(b.blockId)?.label ?? b.blockId,
  nets: netLines(b),
});

/** Emails an invoice to the partner (and lets HillRisers know it's been issued) */
export async function sendInvoice(b: NetBooking, inv: PartnerInvoice) {
  const partner = (await getPartnerStore().listPartners()).find((p) => p.id === b.partnerId);
  if (!partner) return;
  await sendPartnerInvoice(partner, { ...inv, ...invoiceLines(b, inv), first: inv.stage === "initial", moreToFollow: monthsToInvoice(b).length > 0 }).catch((err) =>
    console.error("[hillrisers] partner invoice email failed", inv.number, err),
  );
}

/** Admin has marked an invoice as paid: confirms the booking (first invoice) or sends a receipt */
export async function markInvoicePaid(number: string) {
  const store = getPartnerStore();
  const result = await store.markInvoicePaid(number);
  if (!result.ok) return result;
  const { booking: b, invoice } = result;
  const partner = (await store.listPartners()).find((p) => p.id === b.partnerId);
  if (!partner) return result;
  const send = result.confirmed
    ? sendPartnerBookingConfirmation(partner, {
        blockLabel: getBlock(b.blockId)?.label ?? b.blockId,
        nets: netLines(b),
        paidPence: invoice.amountPence,
        totalPence: b.totalPence,
        monthly: b.plan === "monthly" && monthsToInvoice(b).length > 0,
        machineCoach: b.machineCoach,
        reference: b.id.slice(0, 8).toUpperCase(),
      })
    : sendPartnerPaymentReceipt(partner, { number: invoice.number, amountPence: invoice.amountPence, description: invoiceDescription(b, invoice) });
  await send.catch((err) => console.error("[hillrisers] partner payment email failed", number, err));
  return result;
}

const partnerOf = async (b: NetBooking) => (await getPartnerStore().listPartners()).find((p) => p.id === b.partnerId);

/** Acknowledges a booking request (and tells HillRisers) */
export async function sendRequestReceived(b: NetBooking) {
  const partner = await partnerOf(b);
  if (!partner) return;
  await sendBookingRequestReceived(partner, {
    blockLabel: getBlock(b.blockId)?.label ?? b.blockId,
    nets: netLines(b),
    totalPence: b.totalPence,
    terms: termsLabel(b),
    reference: b.id.slice(0, 8).toUpperCase(),
  }).catch((err) => console.error("[hillrisers] booking request email failed", b.id, err));
}

/** Admin approves a request: issues and emails the first invoice */
export async function approveRequest(bookingId: string) {
  const r = await getPartnerStore().approve(bookingId);
  if (r.ok) await sendInvoice(r.booking, r.invoice);
  return r;
}

/** Admin declines a request: the nets are released and the partner is told */
export async function declineRequest(bookingId: string) {
  const r = await getPartnerStore().decline(bookingId);
  if (r.ok) {
    const partner = await partnerOf(r.booking);
    if (partner) await sendBookingDeclined(partner, { blockLabel: getBlock(r.booking.blockId)?.label ?? r.booking.blockId, nets: netLines(r.booking) }).catch((err) => console.error("[hillrisers] decline email failed", bookingId, err));
  }
  return r;
}
