import { redirect } from "next/navigation";
import { partnerBlocks, priorityEndsLabel, priorityWindowOpen } from "@/data/partners";
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
  const [documents, bookings, code] = await Promise.all([store.documentsFor(partner.id), store.bookingsFor(partner.id), store.priorityFor(partner.id)]);
  return (
    <PartnerPortal
      partner={{ id: partner.id, orgName: partner.orgName, contactName: partner.contactName }}
      documents={documents}
      bookings={bookings}
      blocks={partnerBlocks.filter((b) => !b.test || isTestPartner(partner.email))}
      priority={{ open: priorityWindowOpen(), ends: priorityEndsLabel(), code: code?.code }}
      banner={sp.welcome ? { kind: "welcome" } : undefined}
    />
  );
}
