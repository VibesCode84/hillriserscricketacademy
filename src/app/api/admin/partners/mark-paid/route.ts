import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { markInvoicePaid } from "@/lib/partners/notify";

export const dynamic = "force-dynamic";

/** Admin: the bank transfer for an invoice has arrived (behind the admin password, see middleware) */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ number: z.string().min(3).max(20) }));
  if ("error" in parsed) return parsed.error;
  const result = await markInvoicePaid(parsed.data.number);
  if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
  return NextResponse.json({ ok: true });
}
