import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking";
import type { ChildInterest } from "@/lib/booking/types";
import { sendInterestConfirmation } from "@/lib/email";
import { parseJson } from "@/lib/http";
import { interestRegistrationSchema } from "@/lib/validation";

/**
 * Register your interest — the launch enquiry form. One parent, one or more
 * children. Stored server-side; exportable as CSV from /admin/bookings.
 */
export async function POST(req: Request) {
  const parsed = await parseJson(req, interestRegistrationSchema);
  if ("error" in parsed) return parsed.error;
  const { company, ...d } = parsed.data;
  if (company) return NextResponse.json({ ok: true }); // honeypot

  const registration = await getStore().createInterestRegistration({
    parentName: d.parentName,
    email: d.email,
    mobile: d.mobile,
    postcode: d.postcode.replace(/\s*(\d[A-Z]{2})$/, " $1"),
    heardAbout: d.heardAbout,
    children: d.children as ChildInterest[],
    contactConsent: true,
    marketingConsent: d.marketingConsent,
  });

  try {
    await sendInterestConfirmation(registration);
  } catch (err) {
    console.error("[hillrisers] interest confirmation email failed", err);
  }
  return NextResponse.json({ ok: true });
}
