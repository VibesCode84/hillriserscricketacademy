import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";

export const dynamic = "force-dynamic";

/** Live availability for one session (?sessionId=) or all sessions. */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  const availability = await getAvailability();
  if (!availability) return NextResponse.json({ ok: false, message: "Availability is temporarily unavailable" }, { status: 503 });
  if (sessionId) {
    const a = availability[sessionId];
    if (!a) return NextResponse.json({ ok: false, message: "Session not found" }, { status: 404 });
    return NextResponse.json({ ok: true, availability: a });
  }
  return NextResponse.json({ ok: true, availability });
}
