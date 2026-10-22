import { findSlot, getBlock, longDate, shortDate, timeLabel } from "../../data/partners";
import { sendPartnerBookingConfirmation } from "../email";
import { getPartnerStore, type NetBooking } from "./store";

/**
 * Confirms a partner payment and, the first time it lands (not on Stripe's retries),
 * emails the partner a confirmation and HillRisers a notification.
 */
export async function confirmPartnerPayment(bookingId: string, paymentIntentId: string | undefined, stage: "initial" | "balance") {
  const store = getPartnerStore();
  const before = await store.getBooking(bookingId);
  const after = await store.confirm(bookingId, paymentIntentId, stage);
  if (!after || !before || before.status === after.status) return after;
  const partner = (await store.listPartners()).find((p) => p.id === after.partnerId);
  if (partner) {
    await sendPartnerBookingConfirmation(partner, describe(after, stage)).catch((err) =>
      console.error("[hillrisers] partner booking email failed", bookingId, err),
    );
  }
  return after;
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
    balanceDue: kind === "deposit" && b.balanceDueDate ? longDate(b.balanceDueDate) : undefined,
    machineCoach: b.machineCoach,
    reference: b.id.slice(0, 8).toUpperCase(),
  } as const;
}
