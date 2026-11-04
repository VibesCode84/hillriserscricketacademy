import { NextResponse } from "next/server";
import { parseJson } from "@/lib/http";
import { partnerEnquirySchema } from "@/lib/validation";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { sendPartnerEnquiry } from "@/lib/email";

export const dynamic = "force-dynamic";

/** "I'd like to talk first": an enquiry from a coach or partner, short of a booking request */
export async function POST(req: Request) {
  const parsed = await parseJson(req, partnerEnquirySchema);
  if ("error" in parsed) return parsed.error;
  const { company, ...input } = parsed.data;
  if (company) return NextResponse.json({ ok: true }); // honeypot
  const partner = await currentPartner();
  const enquiry = await getPartnerStore().addEnquiry({ ...input, partnerId: partner?.id });
  await sendPartnerEnquiry(enquiry).catch((err) => console.error("[hillrisers] partner enquiry email failed", err));
  return NextResponse.json({ ok: true });
}
