import { NextResponse } from "next/server";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** The signed-in partner's profile, documents and bookings */
export async function GET() {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false }, { status: 401 });
  const store = getPartnerStore();
  const [documents, bookings] = await Promise.all([store.documentsFor(partner.id), store.bookingsFor(partner.id)]);
  const { keyHash: _k, ...profile } = partner;
  void _k;
  return NextResponse.json({ ok: true, partner: profile, documents, bookings });
}
