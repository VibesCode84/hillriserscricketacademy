import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking";
import { sendEnquiryNotification } from "@/lib/email";
import { parseJson } from "@/lib/http";
import { enquirySchema } from "@/lib/validation";

/** "I'd rather speak to someone" / "Tell us about your child" */
export async function POST(req: Request) {
  const parsed = await parseJson(req, enquirySchema);
  if ("error" in parsed) return parsed.error;
  const { company, ...data } = parsed.data;
  if (company) return NextResponse.json({ ok: true }); // honeypot
  const enquiry = await getStore().createEnquiry(data);
  try {
    await sendEnquiryNotification({
      parentName: enquiry.parentName,
      email: enquiry.email,
      message: `${enquiry.message}\n\nChild age: ${enquiry.childAge ?? "—"}\nMobile: ${enquiry.mobile ?? "—"}\nSource: ${enquiry.source}`,
    });
  } catch (err) {
    console.error("[hillrisers] enquiry email failed", err);
  }
  return NextResponse.json({ ok: true });
}
