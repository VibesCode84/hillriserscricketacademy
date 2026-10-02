import { NextResponse } from "next/server";
import { getSession } from "@/data/sessions";
import { getStore, HOLD_MINUTES } from "@/lib/booking";
import { parseJson } from "@/lib/http";
import { createBookingSchema } from "@/lib/validation";

/** Step 3 — atomically reserve a place and create a pending booking. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, createBookingSchema);
  if ("error" in parsed) return parsed.error;
  const { playerId, parentId, sessionId, isTrial } = parsed.data;

  const session = getSession(sessionId);
  if (!session || !session.active) {
    return NextResponse.json({ ok: false, message: "That session is not available." }, { status: 404 });
  }
  if (!session.confirmed) {
    return NextResponse.json(
      { ok: false, reason: "unconfirmed", message: "Times for this session are being finalised — register your interest and we'll be in touch." },
      { status: 409 },
    );
  }

  const store = getStore();
  const player = await store.getPlayer(playerId);
  if (!player || player.parentId !== parentId) {
    return NextResponse.json({ ok: false, message: "We couldn't find that player profile." }, { status: 404 });
  }

  const result = await store.reservePlace({ sessionId, parentId, playerId, holdMinutes: HOLD_MINUTES, isTrial });
  if (!result.ok) {
    if (result.reason === "full") {
      return NextResponse.json(
        { ok: false, reason: "full", message: "This group has just filled up. Join the waiting list and we'll contact you as soon as a place opens." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, message: "That session is not available." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, bookingId: result.booking.id, holdExpiresAt: result.booking.holdExpiresAt });
}
