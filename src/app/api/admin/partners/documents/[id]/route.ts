import { NextResponse } from "next/server";
import { getPartnerStore } from "@/lib/partners/store";
import { fileResponse } from "@/lib/partners/files";

export const dynamic = "force-dynamic";

/** Admin download of a partner document (admin auth is applied in src/middleware.ts) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await getPartnerStore().getDocument((await params).id);
  if (!found) return new NextResponse("Not found", { status: 404 });
  return fileResponse(found.doc.filename, found.doc.contentType, found.bytes);
}
