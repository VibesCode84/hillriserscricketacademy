import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/booking";
import { parseJson } from "@/lib/http";
import { profileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Protected by HTTP Basic auth in src/middleware.ts

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("attendance"), bookingId: z.string().uuid(), attended: z.boolean() }),
  z.object({ action: z.literal("move"), bookingId: z.string().uuid(), toSessionId: z.string().min(1) }),
  z.object({ action: z.literal("cancel"), bookingId: z.string().uuid() }),
  z.object({
    action: z.literal("trialStatus"),
    requestId: z.string().uuid(),
    status: z.enum(["new", "contacted", "booked", "closed"]),
  }),
  z.object({
    action: z.literal("manual"),
    sessionId: z.string().min(1),
    notes: z.string().max(500).optional(),
    profile: profileSchema.omit({ safeguardingConsent: true, termsConsent: true }),
  }),
]);

export async function POST(req: Request) {
  const parsed = await parseJson(req, actionSchema);
  if ("error" in parsed) return parsed.error;
  const store = getStore();
  const a = parsed.data;

  switch (a.action) {
    case "attendance":
      await store.setAttendance(a.bookingId, a.attended);
      return NextResponse.json({ ok: true });
    case "trialStatus":
      await store.setTrialRequestStatus(a.requestId, a.status);
      return NextResponse.json({ ok: true });
    case "cancel":
      await store.cancelBooking(a.bookingId, "cancelled");
      return NextResponse.json({ ok: true });
    case "move": {
      const r = await store.moveBooking(a.bookingId, a.toSessionId);
      return r.ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ ok: false, message: r.reason === "full" ? "That session is full." : "Could not move booking." }, { status: 409 });
    }
    case "manual": {
      const p = a.profile;
      const { parent, player } = await store.createProfile({
        parent: { name: p.parentName, email: p.email, mobile: p.mobile },
        player: {
          name: p.playerName,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          experience: p.experience,
          interest: p.interest,
          emergencyContactName: p.emergencyContactName,
          emergencyContactPhone: p.emergencyContactPhone,
          medicalNotes: p.medicalNotes || undefined,
          photoConsent: p.photoConsent,
        },
      });
      const r = await store.addManualBooking({ sessionId: a.sessionId, parentId: parent.id, playerId: player.id, notes: a.notes });
      return r.ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ ok: false, message: r.reason === "full" ? "That session is full." : "Could not add booking." }, { status: 409 });
    }
  }
}
