import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Admin (behind the admin password, see middleware): create a priority code */
export async function POST(req: Request) {
  const parsed = await parseJson(req, z.object({ name: z.string().trim().min(2, "Please enter a name").max(100) }));
  if ("error" in parsed) return parsed.error;
  const code = await getPartnerStore().createPriorityCode(parsed.data.name);
  return NextResponse.json({ ok: true, code });
}

/** Admin: delete a code that hasn't been used */
export async function DELETE(req: Request) {
  const parsed = await parseJson(req, z.object({ code: z.string().min(3).max(20) }));
  if ("error" in parsed) return parsed.error;
  const ok = await getPartnerStore().deletePriorityCode(parsed.data.code);
  if (!ok) return NextResponse.json({ ok: false, message: "That code has been used, so it can't be deleted." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
