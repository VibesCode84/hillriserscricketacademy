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
  const profile = { id: partner.id, orgName: partner.orgName, contactName: partner.contactName, email: partner.email, phone: partner.phone, type: partner.type };
  return NextResponse.json({ ok: true, partner: { ...profile, hasPassword: !!partner.passwordHash }, documents, bookings });
}
