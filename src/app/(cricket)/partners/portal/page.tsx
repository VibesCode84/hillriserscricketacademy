import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { partnerBlocks } from "@/data/partners";
import { currentPartner, PARTNER_COOKIE } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { PartnerPortal } from "@/components/partners/PartnerPortal";
import { isTestPartner } from "@/lib/partners/test-access";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book sessions" };

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ paid?: string; balance?: string; cancelled?: string; welcome?: string }> }) {
  const partner = await currentPartner();
  if (!partner) redirect("/partners#sign-in");
  const sp = await searchParams;
  // Payments now land on the account page (older links may still arrive here)
  if (sp.paid) redirect(`/partners/account?paid=${encodeURIComponent(sp.paid)}${sp.balance ? "&balance=1" : ""}`);
  const store = getPartnerStore();
  const [documents, bookings] = await Promise.all([store.documentsFor(partner.id), store.bookingsFor(partner.id)]);
  // A cancelled Stripe checkout releases its hold straight away
  if (sp.cancelled && bookings.some((b) => b.id === sp.cancelled)) await store.release(sp.cancelled, "cancelled");
  const key = (await cookies()).get(PARTNER_COOKIE)?.value;
  const banner = sp.cancelled
    ? ({ kind: "cancelled" } as const)
    : sp.welcome
        ? ({ kind: "welcome" } as const)
        : undefined;
  return (
    <PartnerPortal
      partner={{ id: partner.id, orgName: partner.orgName, contactName: partner.contactName }}
      documents={documents}
      bookings={sp.cancelled ? await store.bookingsFor(partner.id) : bookings}
      blocks={partnerBlocks.filter((b) => !b.test || isTestPartner(partner.email))}
      portalLink={key ? `${site.url}/api/partners/access?key=${key}` : undefined}
      banner={banner}
    />
  );
}
