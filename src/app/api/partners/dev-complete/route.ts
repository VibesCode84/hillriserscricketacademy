import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { devPaymentsEnabled } from "@/lib/payments";
import { getPartnerStore } from "@/lib/partners/store";
import { confirmPartnerPayment } from "@/lib/partners/notify";

/** Development only: stands in for Stripe's webhook so the journey can be tried without keys */
export async function POST(req: Request) {
  if (!devPaymentsEnabled()) return NextResponse.json({ ok: false }, { status: 404 });
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid(), outcome: z.enum(["paid", "cancel"]) }));
  if ("error" in parsed) return parsed.error;
  const store = getPartnerStore();
  const booking = await store.getBooking(parsed.data.bookingId);
  const stage = booking?.status === "reserved" ? "balance" : "initial";
  if (parsed.data.outcome === "paid") await confirmPartnerPayment(parsed.data.bookingId, `dev_pi_${stage}_${parsed.data.bookingId}`, stage);
  else if (stage === "initial") await store.release(parsed.data.bookingId, "cancelled");
  else return NextResponse.json({ ok: true, redirect: "/partners/portal" });
  return NextResponse.json({ ok: true, redirect: `/partners/portal?${parsed.data.outcome === "paid" ? "paid" : "cancelled"}=${parsed.data.bookingId}${stage === "balance" ? "&balance=1" : ""}` });
}
