import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { site } from "@/data/site";
import { getPartnerStore, invoiceTotal } from "@/lib/partners/store";
import { sendCustomerInvoice } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Admin: send an invoice (emails the customer), send a reminder, mark it paid or unpaid, or void it */
export async function POST(req: Request) {
  const parsed = await parseJson(
    req,
    z.object({ id: z.string().uuid(), action: z.enum(["send", "paid", "unpaid", "void", "remind"]), paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }),
  );
  if ("error" in parsed) return parsed.error;
  const store = getPartnerStore();
  const r = await store.invoiceAction(parsed.data.id, parsed.data.action, Date.now(), parsed.data.paidOn);
  if (!r.ok) return NextResponse.json({ ok: false, message: r.message }, { status: 409 });
  if (parsed.data.action === "send" || parsed.data.action === "remind") {
    const found = await store.getManualInvoice(r.invoice.id);
    const inv = r.invoice;
    if (found?.customer && inv.number && inv.dueAt) {
      const link = `${site.url}/invoice/${inv.number}?key=${inv.key}`;
      try {
        await sendCustomerInvoice(found.customer, { number: inv.number, totalPence: invoiceTotal(inv), dueAt: inv.dueAt, dueDays: inv.dueDays, link }, parsed.data.action === "remind");
      } catch (err) {
        console.error("[hillrisers] customer invoice email failed", inv.number, err);
        return NextResponse.json({ ok: false, message: "Saved, but the email couldn't be sent. Copy the link and send it yourself." }, { status: 502 });
      }
    }
  }
  return NextResponse.json({ ok: true });
}
