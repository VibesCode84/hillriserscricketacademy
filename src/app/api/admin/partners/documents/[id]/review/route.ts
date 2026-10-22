import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Approve or reject a partner document */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = await parseJson(req, z.object({ review: z.enum(["pending", "approved", "rejected"]), note: z.string().trim().max(300).optional() }));
  if ("error" in parsed) return parsed.error;
  const doc = await getPartnerStore().reviewDocument((await params).id, parsed.data.review, parsed.data.note);
  if (!doc) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, document: doc });
}
