import { NextResponse } from "next/server";
import { allowedUploadTypes, documentKinds, MAX_UPLOAD_BYTES, type DocumentKind } from "@/data/partners";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Upload a document (multipart: kind, file, expiresOn?) */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid upload" }, { status: 400 });
  }
  const kind = String(form.get("kind") ?? "") as DocumentKind;
  const file = form.get("file");
  const expiresOn = String(form.get("expiresOn") ?? "") || undefined;
  if (!documentKinds.some((k) => k.value === kind)) return NextResponse.json({ ok: false, message: "Please choose the document type" }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ ok: false, message: "Please choose a file" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ ok: false, message: "Files must be 10 MB or smaller" }, { status: 400 });
  if (!allowedUploadTypes[file.type]) return NextResponse.json({ ok: false, message: "Please upload a PDF, photo (JPG, PNG, HEIC) or Word document" }, { status: 400 });
  if (expiresOn && !/^\d{4}-\d{2}-\d{2}$/.test(expiresOn)) return NextResponse.json({ ok: false, message: "Please check the expiry date" }, { status: 400 });
  const filename = (file.name || `document.${allowedUploadTypes[file.type]}`).replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  const doc = await getPartnerStore().addDocument(
    partner.id,
    { kind, filename, contentType: file.type, size: file.size, expiresOn },
    new Uint8Array(await file.arrayBuffer()),
  );
  return NextResponse.json({ ok: true, document: doc });
}
