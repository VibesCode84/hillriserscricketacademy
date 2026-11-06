import { getPartnerStore, invoiceTotal } from "../partners/store";
import { invoiceDescription } from "../partners/describe";

export type LedgerStatus = "draft" | "unpaid" | "overdue" | "paid" | "void" | "lapsed";

export type LedgerRow = {
  id: string;
  number?: string;
  source: "invoice" | "partner";
  party: string;
  email?: string;
  description: string;
  totalPence: number;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  status: LedgerStatus;
  /** Admin page for the invoice */
  href: string;
};

/** Every invoice — raised in admin and from partner bookings — newest first */
export async function ledger(at = Date.now()): Promise<LedgerRow[]> {
  const store = getPartnerStore();
  const [manual, customers, partnerInvoices] = await Promise.all([store.listManualInvoices(), store.listCustomers(), store.allPartnerInvoices()]);
  const open = (dueAt?: string): LedgerStatus => (dueAt && Date.parse(dueAt) < at ? "overdue" : "unpaid");
  const rows: LedgerRow[] = [
    ...manual.map((i) => {
      const c = customers.find((x) => x.id === i.customerId);
      return {
        id: i.id,
        number: i.number,
        source: "invoice" as const,
        party: c?.name ?? "?",
        email: c?.email,
        description: i.lines.map((l) => l.description).join("; "),
        totalPence: invoiceTotal(i),
        issuedAt: i.issuedAt,
        dueAt: i.dueAt,
        paidAt: i.paidAt,
        status: (i.status === "sent" ? open(i.dueAt) : i.status) as LedgerStatus,
        href: `/admin/invoices/${i.id}`,
      };
    }),
    ...partnerInvoices.map(({ invoice: i, booking: b, partner: p }) => ({
      id: i.number,
      number: i.number,
      source: "partner" as const,
      party: p?.orgName ?? "?",
      email: p?.email,
      description: invoiceDescription(b, i),
      totalPence: i.amountPence,
      issuedAt: i.issuedAt,
      dueAt: i.dueAt,
      paidAt: i.paidAt,
      status: (i.paidAt
        ? "paid"
        : ["expired", "cancelled", "declined", "forfeited"].includes(b.status)
          ? "lapsed"
          : open(i.dueAt)) as LedgerStatus,
      href: `/admin/partners/invoice/${i.number}`,
    })),
  ];
  return rows.sort((a, b) => (b.issuedAt ?? "9999").localeCompare(a.issuedAt ?? "9999"));
}

export const statusLabel: Record<LedgerStatus, string> = { draft: "Draft", unpaid: "Unpaid", overdue: "Overdue", paid: "Paid", void: "Void", lapsed: "Lapsed" };
