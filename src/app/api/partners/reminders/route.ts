import { NextResponse } from "next/server";
import { getBlock, timeLabel } from "@/data/partners";
import { sendBalanceReminder } from "@/lib/email";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/**
 * Sends the balance reminders due now. Run by the Worker's daily cron (see custom-worker.ts) at
 * 07:00 and 08:00 UTC, so one run lands on 8am UK time in both GMT and BST. Safe to call any time:
 * each reminder is sent once, and only after its 8am.
 */
export async function POST() {
  const store = getPartnerStore();
  const due = await store.dueBalanceReminders();
  if (!due.length) return NextResponse.json({ ok: true, sent: 0 });
  const partners = await store.listPartners();
  let sent = 0;
  for (const { booking, date, finalDay } of due) {
    const partner = partners.find((p) => p.id === booking.partnerId);
    if (!partner || !(await store.claimReminder(booking.id, date))) continue;
    try {
      await sendBalanceReminder(partner, {
        blockLabel: getBlock(booking.blockId)?.label ?? "Spring block",
        balancePence: booking.totalPence - (booking.depositPence ?? 0),
        dueDate: booking.balanceDueDate!,
        nets: booking.items.map((i) => `${i.day} ${timeLabel(i.start)}–${timeLabel(i.end)}, net ${i.net}${i.bowlingMachine ? " + bowling machine" : ""}`),
        finalDay,
      });
      sent++;
    } catch (err) {
      console.error("[hillrisers] balance reminder failed", booking.id, date, err);
    }
  }
  return NextResponse.json({ ok: true, sent });
}
