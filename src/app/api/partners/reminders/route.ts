import { NextResponse } from "next/server";
import { sendInvoiceReminder } from "@/lib/email";
import { getPartnerStore } from "@/lib/partners/store";
import { invoiceLines, sendInvoice } from "@/lib/partners/notify";

export const dynamic = "force-dynamic";

/**
 * Monthly payment terms: issues each month's invoice when it's due (8am UK time, a week before the
 * month's first session) and sends a daily 8am reminder for overdue monthly invoices. Run by the
 * Worker's daily cron (see custom-worker.ts) at 07:00 and 08:00 UTC, so one run lands on 8am UK time
 * in both GMT and BST. Safe to call any time: each invoice and reminder goes out once.
 */
export async function POST() {
  const store = getPartnerStore();
  let issued = 0;
  let reminded = 0;
  for (const { booking, month } of await store.dueMonthlyInvoices()) {
    const r = await store.issueMonthInvoice(booking.id, month);
    if (!r) continue;
    await sendInvoice(r.booking, r.invoice);
    issued++;
  }
  const due = await store.dueInvoiceReminders();
  if (due.length) {
    const partners = await store.listPartners();
    for (const { booking, invoice, date } of due) {
      const partner = partners.find((p) => p.id === booking.partnerId);
      if (!partner || !(await store.claimInvoiceReminder(invoice.number, date))) continue;
      try {
        await sendInvoiceReminder(partner, { ...invoice, ...invoiceLines(booking, invoice) });
        reminded++;
      } catch (err) {
        console.error("[hillrisers] invoice reminder failed", invoice.number, err);
      }
    }
  }
  return NextResponse.json({ ok: true, issued, reminded });
}
