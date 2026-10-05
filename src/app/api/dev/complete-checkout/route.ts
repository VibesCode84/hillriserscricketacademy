import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/data/sessions";
import { getStore } from "@/lib/booking";
import { confirmPaidBooking } from "@/lib/booking/confirm";
import { parseJson } from "@/lib/http";
import { devPaymentsEnabled } from "@/lib/payments";

/** Development-only: simulates Stripe's checkout.session.completed webhook. */
export async function POST(req: Request) {
  if (!devPaymentsEnabled()) return NextResponse.json({ ok: false }, { status: 404 });
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid(), outcome: z.enum(["paid", "cancel"]) }));
  if ("error" in parsed) return parsed.error;
  const store = getStore();
  const booking = await store.getBooking(parsed.data.bookingId);
  if (!booking) return NextResponse.json({ ok: false }, { status: 404 });
  if (parsed.data.outcome === "cancel") {
    return NextResponse.json({ ok: true, redirect: `/book/checkout?booking=${booking.id}` });
  }
  await confirmPaidBooking(booking.id, {
    paymentIntentId: `dev_pi_${booking.id}`,
    amountPaidPence: getSession(booking.sessionId)?.pricePence,
  });
  return NextResponse.json({ ok: true, redirect: `/book/success?session_id=${booking.stripeCheckoutSessionId}` });
}
