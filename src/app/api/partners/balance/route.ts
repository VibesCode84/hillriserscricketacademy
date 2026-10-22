import { NextResponse } from "next/server";
import { z } from "zod";
import { baseUrl, parseJson } from "@/lib/http";
import { createPartnerCheckout } from "@/lib/payments";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Starts Stripe Checkout for the balance on a deposit-reserved booking */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid() }));
  if ("error" in parsed) return parsed.error;
  const store = getPartnerStore();
  const booking = await store.getBooking(parsed.data.bookingId);
  if (!booking || booking.partnerId !== partner.id) return NextResponse.json({ ok: false, message: "Booking not found" }, { status: 404 });
  if (booking.status !== "reserved") return NextResponse.json({ ok: false, message: "There's no balance to pay on this booking." }, { status: 400 });
  if (!booking.balanceDueAt || Date.parse(booking.balanceDueAt) <= Date.now()) {
    return NextResponse.json({ ok: false, message: "The deadline for this balance has passed, so the nets have been released." }, { status: 400 });
  }
  try {
    const checkout = await createPartnerCheckout(booking, partner, baseUrl(req), "balance");
    await store.attachBalanceCheckout(booking.id, checkout.id);
    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    console.error("[hillrisers] partner balance checkout failed", err);
    if ((err as Error).message === "Payments are not set up yet") {
      return NextResponse.json({ ok: false, message: "Online payment isn't switched on yet. Please contact HillRisers." }, { status: 503 });
    }
    return NextResponse.json({ ok: false, message: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
