import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/booking";
import { continueWithoutDeposit, startDepositCheckout } from "@/lib/booking/deposit";
import { baseUrl, parseJson } from "@/lib/http";

/** Retry paying a holding deposit, or continue without one (from /book/deposit). */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ requestId: z.string().uuid(), action: z.enum(["pay", "skip"]) }));
  if ("error" in parsed) return parsed.error;
  const request = await getStore().getTrialRequest(parsed.data.requestId);
  if (!request) return NextResponse.json({ ok: false, message: "We couldn't find that request." }, { status: 404 });
  if (request.depositStatus === "paid" || request.depositStatus === "applied") {
    return NextResponse.json({ ok: false, reason: "already_paid", message: "Your deposit has already been paid." }, { status: 409 });
  }

  if (parsed.data.action === "skip") {
    await continueWithoutDeposit(request);
    return NextResponse.json({ ok: true });
  }
  try {
    const checkout = await startDepositCheckout(request, baseUrl(req));
    if (checkout) return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    console.error("[hillrisers] deposit checkout failed", err);
  }
  return NextResponse.json({ ok: false, message: "Online payment is temporarily unavailable. Your request is saved — we'll be in touch." }, { status: 503 });
}
