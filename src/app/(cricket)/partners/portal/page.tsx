import { redirect } from "next/navigation";
import { partnerBlocks } from "@/data/partners";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { PartnerPortal } from "@/components/partners/PartnerPortal";
import { isTestPartner } from "@/lib/partners/test-access";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book sessions" };


export default async function PortalPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const partner = await currentPartner();
  if (!partner) redirect("/partners#sign-in");
  const sp = await searchParams;
  const store = getPartnerStore();
  const [documents, bookings] = await Promise.all([store.documentsFor(partner.id), store.bookingsFor(partner.id)]);
  return (
    <PartnerPortal
      partner={{ id: partner.id, orgName: partner.orgName, contactName: partner.contactName }}
      documents={documents}
      bookings={bookings}
      blocks={partnerBlocks.filter((b) => !b.test || isTestPartner(partner.email))}
      banner={sp.welcome ? { kind: "welcome" } : undefined}
    />
  );
}
