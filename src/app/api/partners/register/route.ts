import { NextResponse } from "next/server";
import { partnerRegistrationSchema } from "@/lib/validation";
import { getPartnerStore } from "@/lib/partners/store";
import { cookieOptions, PARTNER_COOKIE } from "@/lib/partners/session";
import { sendPartnerWelcome } from "@/lib/email";
import { parseJson } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Creates a partner account and signs them in (session token in an httpOnly cookie) */
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
  const { partner, token } = await getPartnerStore().createPartner({ ...input, orgName: input.orgName || input.contactName }); // sole traders needn't give one
  await sendPartnerWelcome(partner).catch((err) => console.error("[hillrisers] partner welcome email failed", err));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, token, cookieOptions);
  return res;
}
