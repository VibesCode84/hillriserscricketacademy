import { redirect } from "next/navigation";
import { partnerBlocks } from "@/data/partners";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { PartnerAccount } from "@/components/partners/PartnerAccount";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ paid?: string; balance?: string }> }) {
  const partner = await currentPartner();
  if (!partner) redirect("/partners#sign-in");
  const sp = await searchParams;
  const bookings = await getPartnerStore().bookingsFor(partner.id);
  return (
    <PartnerAccount
      partner={{ id: partner.id, orgName: partner.orgName, contactName: partner.contactName, email: partner.email, phone: partner.phone, hasPassword: !!partner.passwordHash }}
      bookings={bookings}
      blocks={partnerBlocks}
      banner={sp.paid ? { kind: "paid", bookingId: sp.paid, balance: !!sp.balance } : undefined}
    />
  );
}
