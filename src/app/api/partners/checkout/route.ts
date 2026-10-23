import { NextResponse } from "next/server";
import { getBlock } from "@/data/partners";
import { isTestPartner } from "@/lib/partners/test-access";
import { baseUrl, parseJson } from "@/lib/http";
import { partnerCheckoutSchema } from "@/lib/validation";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { createPartnerCheckout } from "@/lib/payments";
import { bankTransferEnabled } from "@/data/invoicing";
import { sendInvoice } from "@/lib/partners/notify";

export const dynamic = "force-dynamic";

/** Holds the chosen nets (and bowling machine), then starts Stripe Checkout or issues a bank-transfer invoice */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  const parsed = await parseJson(req, partnerCheckoutSchema);
  if ("error" in parsed) return parsed.error;
  const { blockId, items, machineCoach, plan, method } = parsed.data;
  if (method === "bank" && !bankTransferEnabled()) return NextResponse.json({ ok: false, message: "Bank transfer isn't available yet. Please pay by card." }, { status: 400 });
  if (getBlock(blockId)?.test && !isTestPartner(partner.email)) return NextResponse.json({ ok: false, message: "That block isn't available." }, { status: 400 });
  const store = getPartnerStore();
  const held = await store.reserve({ partnerId: partner.id, blockId, items, machineCoach, plan, method });
  if (!held.ok) return NextResponse.json({ ok: false, message: held.message, taken: held.keys }, { status: held.reason === "taken" ? 409 : 400 });
  if (method === "bank") {
    const invoice = held.booking.invoices![0];
    await sendInvoice(held.booking, invoice);
    return NextResponse.json({ ok: true, url: `/partners/account?invoice=${invoice.number}` });
  }
  try {
    const checkout = await createPartnerCheckout(held.booking, partner, baseUrl(req));
    await store.attachCheckout(held.booking.id, checkout.id);
    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    await store.release(held.booking.id, "cancelled");
    console.error("[hillrisers] partner checkout failed", err);
    if ((err as Error).message === "Payments are not set up yet") {
      return NextResponse.json({ ok: false, message: "Online payment isn't switched on yet. Please contact HillRisers to book." }, { status: 503 });
    }
    return NextResponse.json({ ok: false, message: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
