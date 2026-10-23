import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPartnerStore } from "@/lib/partners/store";
import { cookieOptions, PARTNER_COOKIE } from "@/lib/partners/session";

export const dynamic = "force-dynamic";

/** Private portal link: /api/partners/access?key=… signs the partner in on this device */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const partner = await getPartnerStore().partnerByKey(key);
  const res = NextResponse.redirect(new URL(partner ? "/partners/account" : "/partners?link=invalid", url));
  if (partner) res.cookies.set(PARTNER_COOKIE, key, cookieOptions);
  return res;
}

/** Sign out (ends a password session; portal links keep working) */
export async function DELETE() {
  await getPartnerStore().endSession((await cookies()).get(PARTNER_COOKIE)?.value);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
