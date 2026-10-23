import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { markBankTransferPaid } from "@/lib/partners/notify";

export const dynamic = "force-dynamic";

/** Admin: a bank transfer has arrived (behind the admin password, see middleware) */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ bookingId: z.string().uuid(), stage: z.enum(["initial", "balance"]) }));
  if ("error" in parsed) return parsed.error;
  const result = await markBankTransferPaid(parsed.data.bookingId, parsed.data.stage);
  if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
  return NextResponse.json({ ok: true });
}
