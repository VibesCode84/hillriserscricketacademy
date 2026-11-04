import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** A signed-in partner adds their priority code */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  const parsed = await parseJson(req, z.object({ code: z.string().trim().min(3, "Please enter your code").max(20) }));
  if ("error" in parsed) return parsed.error;
  const r = await getPartnerStore().redeemPriorityCode(partner.id, parsed.data.code);
  if (!r.ok) return NextResponse.json({ ok: false, message: r.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
