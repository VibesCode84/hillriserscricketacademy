import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { approveRequest, declineRequest } from "@/lib/partners/notify";

export const dynamic = "force-dynamic";

/** Admin (behind the admin password, see middleware): approve a booking request (sends the invoice) or decline it */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid(), action: z.enum(["approve", "decline"]) }));
  if ("error" in parsed) return parsed.error;
  const r = parsed.data.action === "approve" ? await approveRequest(parsed.data.bookingId) : await declineRequest(parsed.data.bookingId);
  if (!r.ok) return NextResponse.json({ ok: false, message: r.message }, { status: 409 });
  return NextResponse.json({ ok: true });
}
