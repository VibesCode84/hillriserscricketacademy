import { NextResponse } from "next/server";
import { partnerRegistrationSchema } from "@/lib/validation";
import { getPartnerStore } from "@/lib/partners/store";
import { cookieOptions, PARTNER_COOKIE } from "@/lib/partners/session";
import { sendPartnerWelcome } from "@/lib/email";
import { baseUrl, parseJson } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Creates a partner account and signs them in (private key in an httpOnly cookie) */
export async function POST(req: Request) {
  const parsed = await parseJson(req, partnerRegistrationSchema);
  if ("error" in parsed) return parsed.error;
  const { agreeTerms: _t, company, ...input } = parsed.data;
  void _t;
  if (company) return NextResponse.json({ ok: true });
  if (await getPartnerStore().partnerByEmail(input.email)) {
    return NextResponse.json(
      { ok: false, message: "There's already an account with this email.", errors: { email: "There's already an account with this email — sign in instead." } },
      { status: 409 },
    );
  }
  const { partner, key } = await getPartnerStore().createPartner(input);
  const portalLink = `${baseUrl(req)}/api/partners/access?key=${key}`;
  await sendPartnerWelcome(partner, portalLink).catch((err) => console.error("[hillrisers] partner welcome email failed", err));
  const res = NextResponse.json({ ok: true, portalLink });
  res.cookies.set(PARTNER_COOKIE, key, cookieOptions);
  return res;
}
