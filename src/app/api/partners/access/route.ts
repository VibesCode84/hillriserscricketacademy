import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPartnerStore } from "@/lib/partners/store";
import { cookieOptions, PARTNER_COOKIE } from "@/lib/partners/session";

export const dynamic = "force-dynamic";

/** Emailed sign-in link: /api/partners/access?key=… works once, within an hour, and signs the partner in on this device */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const session = await getPartnerStore().useSignInLink(url.searchParams.get("key") ?? "");
  const res = NextResponse.redirect(new URL(session ? "/partners/account" : "/partners?link=invalid", url));
  if (session) res.cookies.set(PARTNER_COOKIE, session.token, cookieOptions);
  return res;
}

/** Sign out (ends this device's session) */
export async function DELETE() {
  await getPartnerStore().endSession((await cookies()).get(PARTNER_COOKIE)?.value);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
