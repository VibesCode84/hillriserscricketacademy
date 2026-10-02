import { NextResponse } from "next/server";
import { getSession } from "@/data/sessions";
import { getStore } from "@/lib/booking";
import { sendWaitlistConfirmation } from "@/lib/email";
import { parseJson } from "@/lib/http";
import { waitlistSchema } from "@/lib/validation";

/** Waiting list and "register interest" for sessions not yet confirmed. No payment. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, waitlistSchema);
  if ("error" in parsed) return parsed.error;
  const session = getSession(parsed.data.sessionId);
  if (!session) return NextResponse.json({ ok: false, message: "Session not found." }, { status: 404 });

  const entry = await getStore().joinWaitlist(parsed.data);
  try {
    await sendWaitlistConfirmation({ to: entry.email, playerName: entry.playerName, session });
  } catch (err) {
    console.error("[hillrisers] waitlist email failed", err);
  }
  return NextResponse.json({ ok: true, id: entry.id });
}
