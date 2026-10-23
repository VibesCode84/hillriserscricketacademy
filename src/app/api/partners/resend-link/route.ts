import { NextResponse } from "next/server";
import { z } from "zod";
import { baseUrl, parseJson } from "@/lib/http";
import { getPartnerStore } from "@/lib/partners/store";
import { emailConfigured, sendPartnerLink } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Emails a single-use sign-in link (only when email is set up). Always answers the same, so emails can't be probed. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ email: z.string().trim().email("Please enter a valid email") }));
  if ("error" in parsed) return parsed.error;
  if (!emailConfigured()) return NextResponse.json({ ok: false, message: "Email isn't set up yet — please contact HillRisers for a new link." }, { status: 503 });
  const link = await getPartnerStore().issueSignInLink(parsed.data.email);
  if (link) await sendPartnerLink(link.partner, `${baseUrl(req)}/api/partners/access?key=${link.key}`);
  return NextResponse.json({ ok: true });
}
