import { notFound, redirect } from "next/navigation";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { InvoiceDocument } from "@/components/partners/InvoiceDocument";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  return { title: `Invoice ${(await params).number}` };
}

export default async function PartnerInvoicePage({ params }: { params: Promise<{ number: string }> }) {
  const partner = await currentPartner();
  if (!partner) redirect("/partners#sign-in");
  const found = await getPartnerStore().findInvoice((await params).number);
  if (!found || found.booking.partnerId !== partner.id) notFound();
  return <InvoiceDocument booking={found.booking} invoice={found.invoice} partner={partner} />;
}
