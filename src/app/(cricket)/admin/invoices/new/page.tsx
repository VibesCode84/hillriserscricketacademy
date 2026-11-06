import { getPartnerStore } from "@/lib/partners/store";
import { InvoiceEditor } from "@/components/invoices/InvoiceEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "New invoice" };

export default async function NewInvoicePage() {
  const customers = await getPartnerStore().listCustomers();
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="mb-6 text-3xl">New invoice</h1>
      <InvoiceEditor customers={customers} />
    </div>
  );
}
