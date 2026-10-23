import { NextResponse } from "next/server";
import { z } from "zod";
import { baseUrl, parseJson } from "@/lib/http";
import { createPartnerCheckout } from "@/lib/payments";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Pay an open bank-transfer invoice by card instead (adds the card processing fee) */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid() }));
  if ("error" in parsed) return parsed.error;
  const store = getPartnerStore();
  const booking = await store.getBooking(parsed.data.bookingId);
  if (!booking || booking.partnerId !== partner.id) return NextResponse.json({ ok: false, message: "Booking not found" }, { status: 404 });
  if (booking.status !== "pending_payment") return NextResponse.json({ ok: false, message: "This booking isn't awaiting payment any more." }, { status: 400 });
  try {
    const checkout = await createPartnerCheckout(booking, partner, baseUrl(req));
    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    console.error("[hillrisers] partner card checkout failed", err);
    return NextResponse.json({ ok: false, message: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
