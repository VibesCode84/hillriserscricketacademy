import { NextResponse } from "next/server";

/** Sends an uploaded document as a download (never rendered inline) */
export function fileResponse(filename: string, contentType: string, bytes: Uint8Array) {
  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
