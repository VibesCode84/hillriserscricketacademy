import { NextResponse } from "next/server";
import { FUTURE_CAMPS, getCamp } from "@/data/camps";
import { getStore } from "@/lib/booking";
import { sendCampInterestConfirmation } from "@/lib/email";
import { badRequest, parseJson } from "@/lib/http";
import { campInterestSchema } from "@/lib/validation";

/** Register interest in specialist holiday camps (no payment). */
export async function POST(req: Request) {
  const parsed = await parseJson(req, campInterestSchema);
  if ("error" in parsed) return parsed.error;
  const { company, contactConsent: _consent, ...d } = parsed.data;
  void _consent;
  if (company) return NextResponse.json({ ok: true }); // honeypot
  if (d.camps.some((id) => id !== FUTURE_CAMPS && !getCamp(id))) return badRequest("Please choose a camp", { camps: "Please choose a camp" });

  const entry = await getStore().createCampInterest({
    ...d,
    mobile: d.mobile || undefined,
    notes: d.notes || undefined,
  });
  try {
    await sendCampInterestConfirmation(entry);
  } catch (err) {
    console.error("[hillrisers] camp interest email failed", err);
  }
  return NextResponse.json({ ok: true });
}
