import { NextResponse } from "next/server";
import { parseJson } from "@/lib/http";
import { cookieOptions, currentPartner, PARTNER_COOKIE } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { partnerPasswordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Sets or changes the signed-in partner's password */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  const parsed = await parseJson(req, partnerPasswordSchema);
  if ("error" in parsed) return parsed.error;
  // Signs out every other device; this one gets a fresh session
  const updated = await getPartnerStore().setPassword(partner.id, parsed.data.password);
  const res = NextResponse.json({ ok: true });
  if (updated) res.cookies.set(PARTNER_COOKIE, updated.token, cookieOptions);
  return res;
}
