import { NextResponse } from "next/server";
import { parseJson } from "@/lib/http";
import { draftInvoiceSchema } from "@/lib/validation";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Admin: create or update a draft invoice */
export async function POST(req: Request) {
  const parsed = await parseJson(req, draftInvoiceSchema);
  if ("error" in parsed) return parsed.error;
  const r = await getPartnerStore().saveDraftInvoice(parsed.data);
  if (!r.ok) return NextResponse.json({ ok: false, message: r.message }, { status: 400 });
  return NextResponse.json({ ok: true, invoice: r.invoice });
}
