import { findSlot, getBlock, longDate, shortDate, timeLabel } from "../../data/partners";
import { sendPartnerBookingConfirmation, sendPartnerInvoice } from "../email";
import { ukDateTime } from "../../data/invoicing";
import { getPartnerStore, type NetBooking, type PartnerInvoice } from "./store";

/**
 * Confirms a partner payment and, the first time it lands (not on Stripe's retries),
 * emails the partner a confirmation and HillRisers a notification.
 */
export async function confirmPartnerPayment(bookingId: string, paymentIntentId: string | undefined, stage: "initial" | "balance", cardFeePence?: number) {
  const store = getPartnerStore();
  const before = await store.getBooking(bookingId);
  const after = await store.confirm(bookingId, paymentIntentId, stage, cardFeePence);
  if (after && before && before.status !== after.status) {
    await sendConfirmation(after, stage);
    // A holding deposit has just been paid: send the invoice for the balance
    const invoice = after.holding && stage === "initial" ? after.invoices?.find((i) => i.stage === "balance" && !i.paidAt) : undefined;
    if (invoice) await sendInvoice(after, invoice);
  }
  return after;
}

/** Admin has marked a bank transfer as received */
export async function markBankTransferPaid(bookingId: string, stage: "initial" | "balance") {
  const result = await getPartnerStore().markBankPaid(bookingId, stage);
  if (result.ok) await sendConfirmation(result.booking, stage);
  return result;
}

async function sendConfirmation(b: NetBooking, stage: "initial" | "balance") {
  const partner = (await getPartnerStore().listPartners()).find((p) => p.id === b.partnerId);
  if (!partner) return;
  await sendPartnerBookingConfirmation(partner, describe(b, stage)).catch((err) => console.error("[hillrisers] partner booking email failed", b.id, err));
}

/** Emails a bank-transfer invoice to the partner (and lets HillRisers know it's been issued) */
export async function sendInvoice(b: NetBooking, invoice: PartnerInvoice) {
  const partner = (await getPartnerStore().listPartners()).find((p) => p.id === b.partnerId);
  if (!partner) return;
  const d = describe(b, invoice.stage);
  await sendPartnerInvoice(partner, { ...invoice, blockLabel: d.blockLabel, nets: d.nets, kind: d.stage, totalPence: b.totalPence }).catch((err) =>
    console.error("[hillrisers] partner invoice email failed", invoice.number, err),
  );
}

function describe(b: NetBooking, stage: "initial" | "balance") {
  const block = getBlock(b.blockId);
  const kind = stage === "balance" ? "balance" : b.plan === "deposit" ? "deposit" : "full";
  return {
    stage: kind,
    blockLabel: block?.label ?? b.blockId,
    nets: b.items.map((i) => {
      const dates = findSlot(b.blockId, i.slotKey)?.slot.dates ?? [];
      const who = i.ageGroup ? ` (${[i.ageGroup, i.ability, i.gender].join(", ")})` : "";
      const span = dates.length ? `, ${shortDate(dates[0])}${dates.length > 1 ? ` – ${shortDate(dates.at(-1)!)}` : ""}` : "";
      return `${i.day} ${timeLabel(i.start)}–${timeLabel(i.end)}, net ${i.net}${i.bowlingMachine ? " + bowling machine" : ""}${who} — ${i.weeks} week${i.weeks === 1 ? "" : "s"}${span}`;
    }),
    paidPence: kind === "deposit" ? (b.depositPence ?? b.totalPence) : kind === "balance" ? b.totalPence - (b.depositPence ?? 0) : b.totalPence,
    totalPence: b.totalPence,
    balancePence: kind === "deposit" ? b.totalPence - (b.depositPence ?? 0) : undefined,
    balanceDue:
      kind !== "deposit" ? undefined : b.holding && b.balanceDueAt ? ukDateTime(b.balanceDueAt) : b.balanceDueDate ? `midnight on ${longDate(b.balanceDueDate)}` : undefined,
    holding: !!b.holding,
    machineCoach: b.machineCoach,
    method: (stage === "balance" ? b.balanceMethod : b.method) ?? "card",
    cardFeePence: stage === "balance" ? b.balanceCardFeePence : b.cardFeePence,
    reference: b.id.slice(0, 8).toUpperCase(),
  } as const;
}
