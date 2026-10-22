import { NextResponse } from "next/server";
import { parseJson } from "@/lib/http";
import { getPartnerStore } from "@/lib/partners/store";
import { cookieOptions, PARTNER_COOKIE } from "@/lib/partners/session";
import { partnerLoginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Email and password sign-in for delivery partners */
export async function POST(req: Request) {
  const parsed = await parseJson(req, partnerLoginSchema);
  if ("error" in parsed) return parsed.error;
  const session = await getPartnerStore().login(parsed.data.email, parsed.data.password);
  if (!session) {
    // Same answer for an unknown email and a wrong password
    return NextResponse.json({ ok: false, message: "That email and password don't match. Check them, or email yourself a sign-in link." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, session.token, cookieOptions);
  return res;
}
