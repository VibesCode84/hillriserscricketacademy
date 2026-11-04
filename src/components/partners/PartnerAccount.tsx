"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { monthLabel, timeLabel, type PartnerBlock } from "@/data/partners";
import { formatPrice } from "@/data/site";
import type { NetBooking } from "@/lib/partners/store";
import { invoiceDescription, monthsToInvoice, paidToDate, termsLabel } from "@/lib/partners/describe";
import { isPast, ukDateTime } from "@/data/invoicing";
import { buttonClass } from "../Button";

type Profile = { id: string; orgName: string; contactName: string; email: string; phone: string; hasPassword: boolean };

/** Name, sign-out and the switch between booking sessions and the account page */
export function AccountHeader({ partner, current }: { partner: Pick<Profile, "orgName" | "contactName">; current: "book" | "account" }) {
  const router = useRouter();
  const signOut = async () => {
    await fetch("/api/partners/access", { method: "DELETE" });
    router.replace("/partners");
    router.refresh();
  };
  const tab = (href: string, label: string, on: boolean) => (
    <Link href={href} aria-current={on ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-navy-950 text-cream" : "bg-white text-navy-950 hover:bg-cream-200"}`}>
      {label}
    </Link>
  );
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {partner.orgName !== partner.contactName && <p className="text-sm text-ink-muted">Signed in as {partner.contactName}</p>}
        <h1 className="text-4xl md:text-5xl">{partner.orgName}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {tab("/partners/account", "My account", current === "account")}
        {tab("/partners/portal", "Book sessions", current === "book")}
        <button type="button" onClick={signOut} className="ml-2 text-sm font-semibold underline underline-offset-4">Sign out</button>
      </div>
    </div>
  );
}

/** My account: invoices to pay, bookings, payment history and account details */
export function PartnerAccount(props: {
  partner: Profile;
  bookings: NetBooking[];
  blocks: PartnerBlock[];
  banner?: { kind: "invoice"; number: string };
}) {
  const { bookings } = props;
  const [banner, setBanner] = useState(props.banner);
  const label = (id: string) => props.blocks.find((b) => b.id === id)?.label ?? id;
  const issued = banner ? bookings.flatMap((b) => b.invoices ?? []).find((i) => i.number === banner.number) : undefined;
  // Unpaid invoices: a first invoice while its nets are held; monthly invoices on a confirmed booking
  const toPay = bookings.flatMap((b) =>
    (b.invoices ?? [])
      .filter((i) => !i.paidAt && ((i.stage === "initial" && b.status === "pending_payment") || (i.stage === "month" && b.status === "confirmed")))
      .map((i) => ({ b, i })),
  );
  const live = bookings.filter((b) => b.status !== "cancelled" && b.status !== "expired");

  return (
    <div className="container-x py-10 md:py-14">
      <AccountHeader partner={props.partner} current="account" />

      {banner && (
        <Notice tone="good" onClose={() => setBanner(undefined)}>
          <strong>Booked — invoice {banner.number} is on its way to your email.</strong>{" "}
          {issued ? `Please pay ${formatPrice(issued.amountPence)} by bank transfer by ${dueText(issued.dueAt)}, using ${issued.number} as the reference.` : ""}
        </Notice>
      )}

      <section className="mt-10">
        <h2 className="text-3xl">To pay</h2>
        {toPay.length === 0 ? (
          <p className="mt-3 text-ink-muted">Nothing to pay — you&rsquo;re all up to date.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {toPay.map(({ b, i }) => {
              const overdue = isPast(i.dueAt);
              return (
                <li key={i.number} className={`rounded-2xl border p-5 ${overdue ? "border-[#8c1d18]/25 bg-[#fbeae8]" : "border-[#1d3f7a]/20 bg-[#e6eefc]"}`}>
                  <p className="font-semibold">{invoiceDescription(b, i)}</p>
                  <p className="mt-1 text-sm">
                    Please pay <strong>{formatPrice(i.amountPence)}</strong> by bank transfer {overdue ? <strong>now — it was due by {dueText(i.dueAt)}</strong> : <>by {dueText(i.dueAt)}</>}
                    , using <strong>{i.number}</strong> as the reference.
                    {i.stage === "initial" && " Your nets are held until then."}
                  </p>
                  <p className="mt-2 text-sm">
                    <Link href={`/partners/invoice/${i.number}`} className="font-semibold underline underline-offset-4">View invoice {i.number}</Link> (with our bank details)
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="text-3xl">Your bookings</h2>
        {live.length === 0 ? (
          <p className="mt-3 text-ink-muted">No bookings yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {live.map((b) => {
              const next = b.status === "confirmed" ? monthsToInvoice(b)[0] : undefined;
              return (
                <li key={b.id} className="rounded-2xl bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{label(b.blockId)}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        b.status === "confirmed" ? "bg-[#e3f3e8] text-[#1d6b3a]" : b.status === "forfeited" ? "bg-[#fbeae8] text-[#8c1d18]" : b.status === "reserved" ? "bg-[#e6eefc] text-[#1d3f7a]" : "bg-[#fff4d6] text-[#7a5a00]"
                      }`}
                    >
                      {b.status === "confirmed"
                        ? "Booked"
                        : b.status === "forfeited"
                          ? "Not paid · nets released"
                          : b.status === "reserved"
                            ? "Deposit paid"
                            : `Awaiting payment${b.holdExpiresAt ? ` · due ${dueText(b.holdExpiresAt)}` : ""}`}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                    {b.items.map((i) => (
                      <li key={i.slotKey}>
                        {i.day} {timeLabel(i.start)}–{timeLabel(i.end)} · Net {i.net}{i.bowlingMachine ? " + bowling machine" : ""} · {i.weeks} weeks · {formatPrice(i.pricePence)}
                      </li>
                    ))}
                  </ul>
                  {b.machineCoach && <p className="mt-2 text-sm">Bowling machine operator (Level 2): {b.machineCoach}</p>}
                  <p className="mt-2 font-semibold">Total {formatPrice(b.totalPence)}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {termsLabel(b)} · paid {formatPrice(paidToDate(b))}
                    {next ? ` · next invoice: ${monthLabel(next.month)} (${formatPrice(next.pence)}), issued ${ukDateTime(new Date(next.issueAt).toISOString(), "short")}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <PaymentHistory bookings={bookings} blocks={props.blocks} />

      <Account partner={props.partner} />
    </div>
  );
}

/* ── Payment history ───────────────────────────────────────────────────── */

function PaymentHistory({ bookings, blocks }: { bookings: NetBooking[]; blocks: PartnerBlock[] }) {
  const label = (id: string) => blocks.find((b) => b.id === id)?.label ?? id;
  const rows = bookings
    .flatMap((b) => [
      ...(b.invoices ?? []).filter((i) => i.paidAt).map((i) => ({ at: i.paidAt!, what: `${invoiceDescription(b, i)} (bank transfer)`, pence: i.amountPence, ref: i.number })),
      // Earlier card payments
      ...(b.method === "card" && b.paidAt ? [{ at: b.paidAt, what: `${label(b.blockId)} (card)`, pence: (b.plan === "deposit" ? (b.depositPence ?? 0) : b.totalPence) + (b.cardFeePence ?? 0), ref: b.paymentIntentId }] : []),
      ...(b.balanceMethod === "card" && b.balancePaidAt ? [{ at: b.balancePaidAt, what: `${label(b.blockId)} — balance (card)`, pence: b.totalPence - (b.depositPence ?? 0) + (b.balanceCardFeePence ?? 0), ref: b.balancePaymentIntentId }] : []),
    ])
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <section className="mt-14">
      <h2 className="text-3xl">Payment history</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-ink-muted">No payments yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-950/5">
              {rows.map((r) => (
                <tr key={`${r.at}${r.what}`}>
                  <td className="whitespace-nowrap px-5 py-3">{new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}</td>
                  <td className="px-5 py-3">{r.what}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPrice(r.pence)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-muted">{r.ref ? r.ref.slice(-10) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ── Account ───────────────────────────────────────────────────────────── */

function Account({ partner }: { partner: Profile }) {
  const [hasPassword, setHasPassword] = useState(partner.hasPassword);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const { password, confirm } = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (password !== confirm) {
      setMessage("The passwords don't match.");
      setState("error");
      return;
    }
    setState("saving");
    const res = await fetch("/api/partners/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      form.reset();
      setHasPassword(true);
      setState("saved");
    } else {
      setMessage(json.errors?.password ?? json.message ?? "Something went wrong.");
      setState("error");
    }
  };
  return (
    <section className="mt-14">
      <h2 className="text-3xl">Account</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <dl className="self-start rounded-2xl bg-white p-5 text-sm">
          {[
            ["Name", partner.contactName],
            ["Organisation", partner.orgName],
            ["Email (sign-in)", partner.email],
            ["Phone", partner.phone],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-navy-950/5 py-2 last:border-0">
              <dt className="text-ink-muted">{k}</dt>
              <dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-5">
          <h3 className="text-xl">{hasPassword ? "Change your password" : "Set a password"}</h3>
          {!hasPassword && (
            <p className="text-sm text-ink-muted">Set a password so you can sign in with your email at any time.</p>
          )}
          <div>
            <label htmlFor="acc-password" className="label">New password</label>
            <input id="acc-password" name="password" type="password" required minLength={10} autoComplete="new-password" className="field" placeholder="At least 10 characters" />
          </div>
          <div>
            <label htmlFor="acc-confirm" className="label">Confirm new password</label>
            <input id="acc-confirm" name="confirm" type="password" required autoComplete="new-password" className="field" />
          </div>
          {state === "error" && <p className="error-text" role="alert">{message}</p>}
          {state === "saved" && <p className="text-sm text-[#1d6b3a]" role="status">Password saved.</p>}
          <button type="submit" disabled={state === "saving"} className={buttonClass("dark")}>
            {state === "saving" ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </section>
  );
}

const dueText = (iso: string) => ukDateTime(iso, "short");

export function Notice({ tone, children, onClose }: { tone: "good" | "warn"; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="status" className={`mt-6 flex items-start gap-4 rounded-2xl p-4 text-sm ${tone === "good" ? "bg-[#e3f3e8] text-[#1d4f2f]" : "bg-[#fff4d6] text-[#5c4300]"}`}>
      <p className="flex-1">{children}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-lg leading-none">×</button>
    </div>
  );
}
