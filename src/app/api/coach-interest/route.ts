import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking";
import { sendCoachInterestConfirmation } from "@/lib/email";
import { parseJson } from "@/lib/http";
import { coachInterestSchema } from "@/lib/validation";

/** Coach with us — expressions of interest. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, coachInterestSchema);
  if ("error" in parsed) return parsed.error;
  const { company, ...d } = parsed.data;
  if (company) return NextResponse.json({ ok: true }); // honeypot
  const entry = await getStore().createCoachInterest(d);
  try {
    await sendCoachInterestConfirmation(entry);
  } catch (err) {
    console.error("[hillrisers] coach interest email failed", err);
  }
  return NextResponse.json({ ok: true });
}
