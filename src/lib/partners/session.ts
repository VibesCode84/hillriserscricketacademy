import { cookies } from "next/headers";
import { getPartnerStore, SESSION_DAYS } from "./store";

/** The partner's session token lives in an httpOnly cookie (set by sign-in, registration or a sign-in link) */
export const PARTNER_COOKIE = "hr_partner";
export const PARTNER_COOKIE_MAX_AGE = 60 * 60 * 24 * SESSION_DAYS;

export async function currentPartner() {
  const key = (await cookies()).get(PARTNER_COOKIE)?.value;
  return getPartnerStore().partnerBySession(key);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: PARTNER_COOKIE_MAX_AGE,
};
