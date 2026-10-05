import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStore } from "@/lib/booking";
import { confirmPaidBooking } from "@/lib/booking/confirm";
import { getStripe } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the only thing that confirms a payment. The browser
 * redirect to /book/success is never treated as proof of payment.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ ok: false, message: "Stripe is not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ ok: false }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.warn("[hillrisers] webhook signature verification failed", (err as Error).message);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const store = getStore();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.payment_status !== "paid") break; // async methods confirm later
      const paymentIntentId = typeof cs.payment_intent === "string" ? cs.payment_intent : cs.payment_intent?.id;
      const bookingId = cs.metadata?.bookingId ?? cs.client_reference_id;
      if (!bookingId) break;
      const booking = await confirmPaidBooking(bookingId, {
        paymentIntentId,
        amountPaidPence: cs.amount_total ?? undefined,
      });
      if (!booking) console.error("[hillrisers] paid checkout for unknown booking", bookingId, cs.id);
      break;
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      const bookingId = cs.metadata?.bookingId ?? cs.client_reference_id;
      if (!bookingId) break;
      const booking = await store.getBooking(bookingId);
      // Ignore superseded checkouts — the parent may have started a newer one.
      if (booking && booking.stripeCheckoutSessionId === cs.id && booking.status === "pending_payment") {
        await store.cancelBooking(booking.id, "expired");
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!pi) break;
      const booking =
        (await store.findBookingByPaymentIntent(pi)) ??
        (charge.metadata?.bookingId ? await store.getBooking(charge.metadata.bookingId) : undefined);
      if (booking) await store.recordRefund(booking.id, charge.amount_refunded);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
