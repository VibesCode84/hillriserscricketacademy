import { cookies } from "next/headers";
import { getPartnerStore } from "./store";

/** The partner's private key lives in an httpOnly cookie; the portal link (?key=) sets it */
export const PARTNER_COOKIE = "hr_partner";
export const PARTNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function currentPartner() {
  const key = (await cookies()).get(PARTNER_COOKIE)?.value;
  return getPartnerStore().partnerByKey(key);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: PARTNER_COOKIE_MAX_AGE,
};
