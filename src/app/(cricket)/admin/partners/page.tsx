/* eslint-disable @next/next/no-html-link-for-pages -- document links and the CSV are downloads, not pages */
import Link from "next/link";
import { documentKinds, getBlock, machineKey, priorityEndsLabel, releasedBlocks, requiredDocumentKinds, slotKey, timeLabel } from "@/data/partners";
import { formatPrice } from "@/data/site";
import { getPartnerStore, holds, partnerStorageIsPermanent } from "@/lib/partners/store";
import { DocumentReview } from "@/components/admin/DocumentReview";
import { MarkPaid } from "@/components/admin/MarkPaid";
import { PriorityCodes } from "@/components/admin/PriorityCodes";
import { EnquiryHandled, RequestActions } from "@/components/admin/RequestActions";
import { invoiceDescription, monthsToInvoice, paidToDate, termsLabel } from "@/lib/partners/describe";
import { daysAgo, isPast, ukDateTime } from "@/data/invoicing";
import { Crest } from "@/components/Logo";

export const dynamic = "force-dynamic";

const kindLabel = (k: string) => documentKinds.find((d) => d.value === k)?.label ?? k;
const reviewBadge = { pending: "bg-[#fff4d6] text-[#7a5a00]", approved: "bg-[#e3f3e8] text-[#1d6b3a]", rejected: "bg-[#fbeae8] text-[#8c1d18]" };
const statusBadge: Record<string, string> = { requested: "bg-[#fdf0d5] text-[#8a5a00]", declined: "bg-cream-200 text-ink-muted", confirmed: "bg-[#e3f3e8] text-[#1d6b3a]", reserved: "bg-[#e6eefc] text-[#1d3f7a]", forfeited: "bg-[#fbeae8] text-[#8c1d18]", pending_payment: "bg-[#fff4d6] text-[#7a5a00]", cancelled: "bg-cream-200 text-ink-muted", expired: "bg-cream-200 text-ink-muted" };

export default async function AdminPartnersPage() {
  const store = getPartnerStore();
  const [partners, documents, bookings, codes, enquiries] = await Promise.all([store.listPartners(), store.documentsFor(), store.bookingsFor(), store.listPriorityCodes(), store.listEnquiries()]);
  const docsIn = (partnerId: string) => requiredDocumentKinds.every((k) => documents.some((d) => d.partnerId === partnerId && d.kind === k && d.review !== "rejected"));
  const requests = bookings.filter((b) => b.status === "requested").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-navy-950 p-2"><Crest className="h-8 w-auto" /></div>
          <div>
            <h1 className="text-3xl">Delivery partners</h1>
            <p className="text-sm text-ink-muted">{partners.length} partners · {bookings.filter((b) => b.status === "confirmed").length} paid bookings</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="/api/admin/partners/export" className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream">Download bookings (CSV)</a>
          <Link href="/admin/bookings" className="rounded-full border border-navy-950/20 px-5 py-2.5 text-sm font-semibold">Academy admin</Link>
        </div>
      </header>

      {!partnerStorageIsPermanent() && (
        <p className="mt-6 rounded-2xl border border-[#8c1d18]/30 bg-[#fbeae8] p-4 text-sm text-[#8c1d18]" role="alert">
          <strong>Partner data is not being saved permanently.</strong> Connect the Cloudflare D1 database (binding DB).
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-2xl">Booking requests</h2>
        <p className="mt-1 text-sm text-ink-muted">First come, first served — oldest first. Approving emails the invoice, payable within 24 hours.</p>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">No requests waiting.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
                <tr><th className="px-4 py-3">Received</th><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Nets</th><th className="px-4 py-3">Terms</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Documents</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-navy-950/10 align-top">
                {requests.map((b) => {
                  const p = partners.find((x) => x.id === b.partnerId);
                  return (
                    <tr key={b.id}>
                      <td className="whitespace-nowrap px-4 py-3">{ukDateTime(b.createdAt, "short")}</td>
                      <td className="px-4 py-3">{p?.orgName ?? "?"}<span className="block text-xs text-ink-muted">{p?.email}</span></td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{getBlock(b.blockId)?.label}</span>
                        {b.items.map((i) => <span key={i.slotKey} className="block text-xs">{i.day.slice(0, 3)} {timeLabel(i.start)} net {i.net}{i.bowlingMachine ? " + machine" : ""}{i.ageGroup ? ` (${[i.ageGroup, i.ability, i.gender].join(", ")})` : ""}</span>)}
                      </td>
                      <td className="px-4 py-3">{termsLabel(b)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPrice(b.totalPence)}</td>
                      <td className="px-4 py-3">{docsIn(b.partnerId) ? <span className="text-[#1d6b3a]">All in</span> : <span className="text-[#8c1d18]">Missing</span>}</td>
                      <td className="px-4 py-3 text-right"><RequestActions bookingId={b.id} label={`${p?.orgName ?? "this"}'s request (${formatPrice(b.totalPence)})`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PriorityCodes
        codes={codes.map((c) => ({ ...c, redeemedBy: c.redeemedBy ? (partners.find((p) => p.id === c.redeemedBy)?.orgName ?? "?") : undefined }))}
        ends={priorityEndsLabel()}
      />

      {(() => {
        const since = daysAgo(30);
        const awaiting = bookings.flatMap((b) =>
          (b.invoices ?? [])
            .filter((i) => !i.paidAt && (i.stage === "month" ? b.status === "confirmed" : i.issuedAt > since && ["pending_payment", "expired", "reserved", "forfeited"].includes(b.status)))
            .map((i) => ({ b, i, partner: partners.find((p) => p.id === b.partnerId) })),
        );
        return (
          <section className="mt-10">
            <h2 className="text-2xl">Invoices awaiting payment</h2>
            {awaiting.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">No unpaid invoices.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
                    <tr><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Partner</th><th className="px-4 py-3">For</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Due</th><th className="px-4 py-3" /></tr>
                  </thead>
                  <tbody className="divide-y divide-navy-950/10">
                    {awaiting.map(({ b, i, partner }) => (
                      <tr key={i.number}>
                        <td className="px-4 py-3 font-mono"><Link href={`/admin/partners/invoice/${i.number}`} className="underline">{i.number}</Link></td>
                        <td className="px-4 py-3">{partner?.orgName ?? "?"}</td>
                        <td className="px-4 py-3">{invoiceDescription(b, i)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatPrice(i.amountPence)}</td>
                        <td className="px-4 py-3">
                          {ukDateTime(i.dueAt, "short")}
                          {(b.status === "expired" || b.status === "forfeited") && <span className="ml-2 rounded-full bg-[#fbeae8] px-2 py-0.5 text-xs font-semibold text-[#8c1d18]">overdue · nets released</span>}
                          {i.stage === "month" && isPast(i.dueAt) && <span className="ml-2 rounded-full bg-[#fbeae8] px-2 py-0.5 text-xs font-semibold text-[#8c1d18]">overdue</span>}
                        </td>
                        <td className="px-4 py-3 text-right"><MarkPaid number={i.number} label={`${i.number} (${formatPrice(i.amountPence)})`} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })()}

      {releasedBlocks.map((block) => {
        // Amber: requested or invoiced; red: paid and documents in
        const taken = new Map<string, { text: string; red: boolean }>();
        for (const b of bookings) {
          if (b.blockId !== block.id || !holds(b)) continue;
          const name = partners.find((p) => p.id === b.partnerId)?.orgName ?? "?";
          const red = b.status === "confirmed" && docsIn(b.partnerId);
          const note = b.status === "requested" ? " (request)" : b.status === "pending_payment" ? " (invoice due)" : b.status === "confirmed" && !red ? " (paid · documents missing)" : b.status === "reserved" ? " (deposit)" : "";
          for (const i of b.items) {
            taken.set(i.slotKey, { text: `${name}${note}`, red });
            if (i.bowlingMachine) taken.set(machineKey(block.id, i), { text: name, red });
          }
        }
        return (
          <section key={block.id} className="mt-10">
            <h2 className="text-2xl">{block.label} — net grid</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
                  <tr><th className="px-4 py-3">Slot</th><th className="px-4 py-3">Weeks</th>{[1, 2, 3].map((n) => <th key={n} className="px-4 py-3">Net {n}</th>)}<th className="px-4 py-3">Bowling machine</th></tr>
                </thead>
                <tbody className="divide-y divide-navy-950/10">
                  {block.slots.map((s) => (
                    <tr key={`${s.day}${s.start}`}>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">{s.day.slice(0, 3)} {timeLabel(s.start)}–{timeLabel(s.end)}</td>
                      <td className="px-4 py-2">{s.dates.length}</td>
                      {[1, 2, 3].map((n) => {
                        const released = s.nets.includes(n);
                        const who = taken.get(slotKey(block.id, s, n));
                        return <td key={n} className={`px-4 py-2 ${!released ? "text-ink-muted/50" : who?.red ? "bg-[#fbeae8] font-semibold text-[#8c1d18]" : who ? "bg-[#fdf0d5] font-semibold text-[#8a5a00]" : "bg-[#e3f3e8] text-[#1d6b3a]"}`}>{!released ? "—" : (who?.text ?? "Free")}</td>;
                      })}
                      <td className="px-4 py-2">{taken.get(machineKey(block.id, s))?.text ?? <span className="text-[#1d6b3a]">Free</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="text-2xl">Enquiries</h2>
        <p className="mt-1 text-sm text-ink-muted">People who&rsquo;d like to talk before sending a booking request.</p>
        {enquiries.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {enquiries.map((e) => (
              <li key={e.id} className={`rounded-2xl border border-navy-950/10 p-4 text-sm ${e.handledAt ? "bg-cream-200 text-ink-muted" : "bg-white"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    <strong>{e.name}</strong>{e.orgName ? ` (${e.orgName})` : ""} · <a className="underline" href={`mailto:${e.email}`}>{e.email}</a>{e.phone ? ` · ${e.phone}` : ""}
                    <span className="ml-2 text-xs text-ink-muted">{ukDateTime(e.createdAt, "short")}{e.handledAt ? " · dealt with" : ""}</span>
                  </p>
                  <EnquiryHandled id={e.id} handled={!!e.handledAt} />
                </div>
                <p className="mt-2 whitespace-pre-line">{e.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Partners and documents</h2>
        {partners.length === 0 && <p className="mt-3 text-ink-muted">No partners yet.</p>}
        <div className="mt-4 grid gap-4">
          {partners.map((p) => {
            const docs = documents.filter((d) => d.partnerId === p.id);
            const theirs = bookings.filter((b) => b.partnerId === p.id);
            return (
              <article key={p.id} className="rounded-2xl border border-navy-950/10 bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl">{p.orgName} <span className="text-sm font-normal text-ink-muted">· {p.type}{p.sports ? ` · ${p.sports}` : ""}</span></h3>
                  <span className="text-xs text-ink-muted">Registered {new Date(p.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
                <p className="mt-1 text-sm">{p.contactName} · <a className="underline" href={`mailto:${p.email}`}>{p.email}</a> · {p.phone}{p.website ? ` · ${p.website}` : ""}{p.priorityCode ? ` · priority code ${p.priorityCode}` : ""}</p>
                {p.about && <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{p.about}</p>}
                <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Documents</h4>
                {docs.length === 0 ? (
                  <p className="mt-1 text-sm text-[#8c1d18]">No documents uploaded yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-navy-950/10 text-sm">
                    {docs.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-3 py-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${reviewBadge[d.review]}`}>{d.review}</span>
                        <span className="font-semibold">{kindLabel(d.kind)}</span>
                        <a className="underline" href={`/api/admin/partners/documents/${d.id}`}>{d.filename}</a>
                        <span className="text-ink-muted">{kb(d.size)}{d.expiresOn ? ` · expires ${d.expiresOn}` : ""}{d.reviewNote ? ` · “${d.reviewNote}”` : ""}</span>
                        <span className="ml-auto"><DocumentReview id={d.id} review={d.review} /></span>
                      </li>
                    ))}
                  </ul>
                )}
                {theirs.length > 0 && (
                  <>
                    <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Bookings</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      {theirs.map((b) => (
                        <li key={b.id}>
                          <span className={`mr-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[b.status]}`}>
                            {b.status === "forfeited" ? "balance not paid · released" : b.status === "reserved" ? "deposit paid" : b.status === "pending_payment" ? "invoice due" : b.status === "requested" ? "request" : b.status}
                          </span>
                          {getBlock(b.blockId)?.label}: {b.items.map((i) => `${i.day.slice(0, 3)} ${timeLabel(i.start)} net ${i.net}${i.bowlingMachine ? " + machine" : ""}${i.ageGroup ? ` (${[i.ageGroup, i.ability, i.gender].join(", ")})` : ""}`).join("; ")} · {formatPrice(b.totalPence)}
                          {b.machineCoach ? ` · machine coach: ${b.machineCoach}` : ""}
                          {` · ${termsLabel(b).toLowerCase()} · paid ${formatPrice(paidToDate(b))}`}
                          {monthsToInvoice(b).length ? ` · ${monthsToInvoice(b).length} monthly invoice${monthsToInvoice(b).length === 1 ? "" : "s"} to come` : ""}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
