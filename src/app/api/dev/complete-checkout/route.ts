import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/data/sessions";
import { depositFor } from "@/data/academies";
import { getStore } from "@/lib/booking";
import { confirmPaidBooking, confirmPaidDeposit } from "@/lib/booking/confirm";
import { parseJson } from "@/lib/http";
import { devPaymentsEnabled } from "@/lib/payments";

/** Development-only: simulates Stripe's checkout.session.completed webhook. */
export async function POST(req: Request) {
  if (!devPaymentsEnabled()) return NextResponse.json({ ok: false }, { status: 404 });
  const parsed = await parseJson(
    req,
    z.object({
      bookingId: z.string().uuid().optional(),
      trialRequestId: z.string().uuid().optional(),
      outcome: z.enum(["paid", "cancel"]),
    }),
  );
  if ("error" in parsed) return parsed.error;
  const store = getStore();
  const { bookingId, trialRequestId, outcome } = parsed.data;

  if (trialRequestId) {
    const request = await store.getTrialRequest(trialRequestId);
    if (!request) return NextResponse.json({ ok: false }, { status: 404 });
    if (outcome === "cancel") return NextResponse.json({ ok: true, redirect: `/book/deposit?request=${request.id}` });
    await confirmPaidDeposit(request.id, {
      paymentIntentId: `dev_pi_dep_${request.id}`,
      amountPaidPence: request.depositPence ?? depositFor(request.academy),
    });
    return NextResponse.json({ ok: true, redirect: `/book/deposit/success?session_id=${request.stripeCheckoutSessionId}` });
  }

  const booking = bookingId ? await store.getBooking(bookingId) : undefined;
  if (!booking) return NextResponse.json({ ok: false }, { status: 404 });
  if (outcome === "cancel") {
    return NextResponse.json({ ok: true, redirect: `/book/checkout?booking=${booking.id}` });
  }
  await confirmPaidBooking(booking.id, {
    paymentIntentId: `dev_pi_${booking.id}`,
    amountPaidPence: getSession(booking.sessionId)?.pricePence,
  });
  return NextResponse.json({ ok: true, redirect: `/book/success?session_id=${booking.stripeCheckoutSessionId}` });
}
