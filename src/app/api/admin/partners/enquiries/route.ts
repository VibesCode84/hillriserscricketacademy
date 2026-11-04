import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Admin: mark a partner enquiry as dealt with */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ id: z.string().uuid(), handled: z.boolean() }));
  if ("error" in parsed) return parsed.error;
  await getPartnerStore().setEnquiryHandled(parsed.data.id, parsed.data.handled);
  return NextResponse.json({ ok: true });
}
