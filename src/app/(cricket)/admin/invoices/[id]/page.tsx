import { notFound } from "next/navigation";
import { getPartnerStore } from "@/lib/partners/store";
import { site } from "@/data/site";
import { InvoiceEditor } from "@/components/invoices/InvoiceEditor";
import { InvoiceActions } from "@/components/invoices/InvoiceActions";
import { CustomerInvoiceDocument } from "@/components/invoices/CustomerInvoiceDocument";
import { PrintButton } from "@/components/partners/PrintButton";
import { londonDate } from "@/data/partners";
import { ukDateTime } from "@/data/invoicing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice" };

export default async function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const store = getPartnerStore();
  const found = await store.getManualInvoice((await params).id);
  if (!found) notFound();
  const { invoice, customer } = found;
  const link = invoice.number ? `${site.url}/invoice/${invoice.number}?key=${invoice.key}` : undefined;

  if (invoice.status === "draft") {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl">Draft invoice</h1>
          <InvoiceActions id={invoice.id} status="draft" today={londonDate(new Date())} />
        </div>
        <InvoiceEditor customers={await store.listCustomers()} invoice={invoice} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 print:max-w-none print:p-0">
      <div className="mb-6 space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl">Invoice {invoice.number}</h1>
          <PrintButton />
        </div>
        <InvoiceActions id={invoice.id} status={invoice.status} link={link} today={londonDate(new Date())} />
        {invoice.remindersSent?.length ? (
          <p className="text-xs text-ink-muted">Reminders sent: {invoice.remindersSent.map((r) => ukDateTime(r, "short")).join(", ")}</p>
        ) : null}
      </div>
      <CustomerInvoiceDocument invoice={invoice} customer={customer} />
    </div>
  );
}
