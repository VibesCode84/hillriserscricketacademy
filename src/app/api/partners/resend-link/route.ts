import { NextResponse } from "next/server";
import { z } from "zod";
import { baseUrl, parseJson } from "@/lib/http";
import { getPartnerStore } from "@/lib/partners/store";
import { emailConfigured, sendPartnerLink } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Emails a fresh portal link (only when email is set up). Always answers the same, so emails can't be probed. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ email: z.string().trim().email("Please enter a valid email") }));
  if ("error" in parsed) return parsed.error;
  if (!emailConfigured()) return NextResponse.json({ ok: false, message: "Email isn't set up yet — please contact HillRisers for a new link." }, { status: 503 });
  const rotated = await getPartnerStore().rotateKey(parsed.data.email);
  if (rotated) await sendPartnerLink(rotated.partner, `${baseUrl(req)}/api/partners/access?key=${rotated.key}`);
  return NextResponse.json({ ok: true });
}
