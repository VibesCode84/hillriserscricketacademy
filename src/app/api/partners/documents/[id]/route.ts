import { NextResponse } from "next/server";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { fileResponse } from "@/lib/partners/files";

export const dynamic = "force-dynamic";

/** A partner downloading one of their own documents */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const partner = await currentPartner();
  if (!partner) return new NextResponse("Please sign in", { status: 401 });
  const found = await getPartnerStore().getDocument((await params).id);
  if (!found || found.doc.partnerId !== partner.id) return new NextResponse("Not found", { status: 404 });
  return fileResponse(found.doc.filename, found.doc.contentType, found.bytes);
}
