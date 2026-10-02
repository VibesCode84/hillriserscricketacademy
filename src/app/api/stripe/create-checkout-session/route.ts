import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/data/sessions";
import { getStore } from "@/lib/booking";
import { baseUrl, parseJson } from "@/lib/http";
import { getPaymentProvider } from "@/lib/payments";

/** Step 4 — send the parent to Stripe Checkout for a pending booking. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid() }));
  if ("error" in parsed) return parsed.error;

  const store = getStore();
  const booking = await store.getBooking(parsed.data.bookingId);
  if (!booking) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  if (booking.status === "confirmed") {
    return NextResponse.json({ ok: false, reason: "already_confirmed", message: "This place is already confirmed." }, { status: 409 });
  }
  const holdLive = booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() > Date.now();
  if (booking.status !== "pending_payment" || !holdLive) {
    if (booking.status === "pending_payment") await store.cancelBooking(booking.id, "expired");
    return NextResponse.json(
      { ok: false, reason: "expired", message: "Your reserved place timed out. Please choose the session again." },
      { status: 409 },
    );
  }

  const session = getSession(booking.sessionId);
  const [player, parent] = await Promise.all([store.getPlayer(booking.playerId), store.getParent(booking.parentId)]);
  if (!session || !player || !parent) {
    return NextResponse.json({ ok: false, message: "Booking details are incomplete." }, { status: 400 });
  }

  const provider = getPaymentProvider();
  if (!provider) {
    console.error("[hillrisers] No payment provider configured (STRIPE_SECRET_KEY missing)");
    return NextResponse.json(
      { ok: false, message: "Online payment is temporarily unavailable. We've kept your details — please call us to confirm your place." },
      { status: 503 },
    );
  }

  try {
    const checkout = await provider.createCheckout({ booking, session, player, parent, baseUrl: baseUrl(req) });
    // Hold the place for as long as the Checkout page can be completed, so a
    // late payment can never push the group over capacity.
    await store.attachCheckout(booking.id, checkout.id, checkout.expiresAt);
    // A parent returning from Stripe gets a fresh checkout; close the old one
    // (after attaching the new id, so its expiry webhook is ignored).
    if (booking.stripeCheckoutSessionId && booking.stripeCheckoutSessionId !== checkout.id) {
      await provider.expireCheckout(booking.stripeCheckoutSessionId);
    }
    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    console.error("[hillrisers] checkout creation failed", err);
    return NextResponse.json({ ok: false, message: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
