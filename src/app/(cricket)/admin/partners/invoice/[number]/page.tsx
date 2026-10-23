import { notFound } from "next/navigation";
import { getPartnerStore } from "@/lib/partners/store";
import { InvoiceDocument } from "@/components/partners/InvoiceDocument";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice", robots: { index: false } };

/** Admin view of any partner invoice (behind the admin password) */
export default async function AdminInvoicePage({ params }: { params: Promise<{ number: string }> }) {
  const store = getPartnerStore();
  const found = await store.findInvoice((await params).number);
  if (!found) notFound();
  const partner = (await store.listPartners()).find((p) => p.id === found.booking.partnerId);
  if (!partner) notFound();
  return <InvoiceDocument booking={found.booking} invoice={found.invoice} partner={partner} />;
}
