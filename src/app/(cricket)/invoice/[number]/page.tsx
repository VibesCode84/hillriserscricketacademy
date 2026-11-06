import { notFound } from "next/navigation";
import { getPartnerStore } from "@/lib/partners/store";
import { CustomerInvoiceDocument } from "@/components/invoices/CustomerInvoiceDocument";
import { PrintButton } from "@/components/partners/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice", robots: { index: false, follow: false } };

/** The customer's view of an invoice raised in admin: needs the secret key from the emailed link */
export default async function CustomerInvoicePage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ key?: string }> }) {
  const [{ number }, { key }] = await Promise.all([params, searchParams]);
  if (!key) notFound();
  const found = await getPartnerStore().manualInvoiceByNumber(number, key);
  if (!found || found.invoice.status === "draft") notFound();
  return (
    <div className="container-x max-w-3xl py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex justify-end print:hidden"><PrintButton /></div>
      <CustomerInvoiceDocument invoice={found.invoice} customer={found.customer} />
    </div>
  );
}
