import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { devPaymentsEnabled } from "@/lib/payments";
import { getPartnerStore } from "@/lib/partners/store";
import { confirmPartnerPayment } from "@/lib/partners/notify";
import { cardFeePence } from "@/data/invoicing";

/** Development only: stands in for Stripe's webhook so the journey can be tried without keys */
export async function POST(req: Request) {
  if (!devPaymentsEnabled()) return NextResponse.json({ ok: false }, { status: 404 });
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid(), outcome: z.enum(["paid", "cancel"]) }));
  if ("error" in parsed) return parsed.error;
  const store = getPartnerStore();
  const booking = await store.getBooking(parsed.data.bookingId);
  const stage = booking?.status === "reserved" ? "balance" : "initial";
  if (parsed.data.outcome === "paid" && booking) {
    const base = stage === "balance" ? booking.totalPence - (booking.depositPence ?? 0) : booking.plan === "deposit" ? (booking.depositPence ?? booking.totalPence) : booking.totalPence;
    await confirmPartnerPayment(parsed.data.bookingId, `dev_pi_${stage}_${parsed.data.bookingId}`, stage, cardFeePence(base));
  }
  else if (stage === "initial") await store.release(parsed.data.bookingId, "cancelled");
  else return NextResponse.json({ ok: true, redirect: "/partners/account" });
  return NextResponse.json({ ok: true, redirect: parsed.data.outcome === "paid" ? `/partners/account?paid=${parsed.data.bookingId}${stage === "balance" ? "&balance=1" : ""}` : `/partners/portal?cancelled=${parsed.data.bookingId}` });
}
