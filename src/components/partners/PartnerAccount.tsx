"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { longDate, timeLabel, type PartnerBlock } from "@/data/partners";
import { formatPrice } from "@/data/site";
import type { NetBooking } from "@/lib/partners/store";
import { bankTransferEnabled, cardFeePence, ukDateTime } from "@/data/invoicing";
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

/** My account: bookings, balances to pay, payment history and account details */
export function PartnerAccount(props: {
  partner: Profile;
  bookings: NetBooking[];
  blocks: PartnerBlock[];
  banner?: { kind: "paid"; bookingId: string; balance?: boolean } | { kind: "invoice"; number: string };
}) {
  const [bookings, setBookings] = useState(props.bookings);
  const [banner, setBanner] = useState(props.banner);

  const refreshMe = useCallback(async () => {
    const res = await fetch("/api/partners/me", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setBookings(json.bookings);
    return json.bookings as NetBooking[];
  }, []);

  // After returning from Stripe, the webhook confirms the payment — check until it does (up to ~1 minute)
  useEffect(() => {
    if (banner?.kind !== "paid") return;
    let tries = 0;
    const t = setInterval(async () => {
      const list = await refreshMe();
      const b = list?.find((x) => x.id === banner.bookingId);
      const settled = b?.status === "confirmed" || (!banner.balance && b?.status === "reserved");
      if (settled || ++tries > 20) clearInterval(t);
    }, 3000);
    return () => clearInterval(t);
  }, [banner, refreshMe]);

  const paidBooking = banner?.kind === "paid" ? bookings.find((b) => b.id === banner.bookingId) : undefined;
  const outstanding = bookings.filter((b) => b.status === "reserved" || (b.status === "pending_payment" && b.method === "bank"));
  const issued = banner?.kind === "invoice" ? bookings.flatMap((b) => b.invoices ?? []).find((i) => i.number === banner.number) : undefined;
  const label = (id: string) => props.blocks.find((b) => b.id === id)?.label ?? id;

  return (
    <div className="container-x py-10 md:py-14">
      <AccountHeader partner={props.partner} current="account" />

      {banner?.kind === "invoice" && (
        <Notice tone="good" onClose={() => setBanner(undefined)}>
          <strong>Invoice {banner.number} is on its way to your email.</strong>{" "}
          {issued ? `Please pay ${formatPrice(issued.amountPence)} by bank transfer by ${dueText(issued.dueAt)}, using ${issued.number} as the reference.` : ""}
        </Notice>
      )}
      {banner?.kind === "paid" && (
        <Notice tone="good" onClose={() => setBanner(undefined)}>
          {paidBooking?.status === "confirmed" && paidBooking.balancePaidAt ? (
            <><strong>Balance received — your nets are confirmed.</strong> They&rsquo;re listed below.</>
          ) : paidBooking?.status === "confirmed" ? (
            <><strong>Payment received — your sessions are booked.</strong> They&rsquo;re listed below.</>
          ) : paidBooking?.status === "reserved" && !banner.balance ? (
            <>
              <strong>Deposit received — your nets are reserved.</strong> Please pay the balance of{" "}
              {formatPrice(paidBooking.totalPence - (paidBooking.depositPence ?? 0))} by midnight on{" "}
              {paidBooking.balanceDueDate ? longDate(paidBooking.balanceDueDate) : "the due date"}.
            </>
          ) : (
            <><strong>Thanks — we&rsquo;re confirming your payment.</strong> This usually takes a few seconds.</>
          )}
        </Notice>
      )}

      <section className="mt-10">
        <h2 className="text-3xl">To pay</h2>
        {outstanding.length === 0 ? (
          <p className="mt-3 text-ink-muted">Nothing to pay — you&rsquo;re all up to date.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {outstanding.map((b) => {
              const stage = b.status === "reserved" ? "balance" : "initial";
              const amount = stage === "balance" ? b.totalPence - (b.depositPence ?? 0) : b.plan === "deposit" ? (b.depositPence ?? b.totalPence) : b.totalPence;
              const invoice = b.invoices?.find((i) => i.stage === stage && !i.paidAt);
              return (
                <li key={b.id} className="rounded-2xl border border-[#1d3f7a]/20 bg-[#e6eefc] p-5">
                  <p className="font-semibold">{label(b.blockId)}</p>
                  <p className="mt-1 text-sm text-[#1d3f7a]">
                    {stage === "balance" ? (
                      <>
                        Deposit {formatPrice(b.depositPence ?? 0)} paid. Balance of <strong>{formatPrice(amount)}</strong> due by midnight on{" "}
                        {b.balanceDueDate ? longDate(b.balanceDueDate) : "the due date"}.
                      </>
                    ) : (
                      <>
                        Awaiting bank transfer of <strong>{formatPrice(amount)}</strong>
                        {b.plan === "deposit" ? " (deposit)" : ""}
                        {b.holdExpiresAt ? ` by ${dueText(b.holdExpiresAt)}` : ""}.
                      </>
                    )}
                  </p>
                  {invoice && (
                    <p className="mt-2 text-sm">
                      Invoice{" "}
                      <Link href={`/partners/invoice/${invoice.number}`} className="font-semibold underline underline-offset-4">{invoice.number}</Link>
                      {" "}(use this as the payment reference).
                    </p>
                  )}
                  <PayOptions bookingId={b.id} stage={stage} amount={amount} hasInvoice={!!invoice} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="text-3xl">Your bookings</h2>
        {bookings.filter((b) => b.status !== "cancelled" && b.status !== "expired").length === 0 ? (
          <p className="mt-3 text-ink-muted">No bookings yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {bookings
              .filter((b) => b.status !== "cancelled" && b.status !== "expired")
              .map((b) => {
                const block = props.blocks.find((x) => x.id === b.blockId);
                return (
                  <li key={b.id} className="rounded-2xl bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{block?.label ?? b.blockId}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          b.status === "confirmed" ? "bg-[#e3f3e8] text-[#1d6b3a]" : b.status === "forfeited" ? "bg-[#fbeae8] text-[#8c1d18]" : b.status === "reserved" ? "bg-[#e6eefc] text-[#1d3f7a]" : "bg-[#fff4d6] text-[#7a5a00]"
                        }`}
                      >
                        {b.status === "confirmed"
                          ? "Paid"
                          : b.status === "forfeited"
                            ? "Balance not paid · nets released"
                            : b.status === "reserved"
                            ? "Deposit paid"
                            : b.method === "bank"
                              ? `Awaiting bank transfer${b.holdExpiresAt ? ` · due ${dueText(b.holdExpiresAt)}` : ""}`
                              : `Awaiting payment${b.holdExpiresAt ? ` · held until ${ukDateTime(b.holdExpiresAt, "short")}` : ""}`}
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
                    {b.plan === "deposit" && b.depositPence !== undefined && (
                      <p className="mt-1 text-sm text-ink-muted">
                        Deposit {formatPrice(b.depositPence)} paid · balance {formatPrice(b.totalPence - b.depositPence)}{" "}
                        {b.balancePaidAt ? "paid" : b.status === "forfeited" ? "not paid by the deadline" : `due by midnight on ${b.balanceDueDate ? longDate(b.balanceDueDate) : "the due date"}`}
                      </p>
                    )}
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
      ...(b.paidAt
        ? [
            {
              at: b.paidAt,
              what: `${label(b.blockId)} — ${b.plan === "deposit" ? "deposit" : "paid in full"}${via(b.method, b.cardFeePence)}`,
              pence: (b.plan === "deposit" ? (b.depositPence ?? 0) : b.totalPence) + (b.cardFeePence ?? 0),
              ref: b.method === "bank" ? b.invoices?.find((i) => i.stage === "initial")?.number : b.paymentIntentId,
            },
          ]
        : []),
      ...(b.balancePaidAt
        ? [
            {
              at: b.balancePaidAt,
              what: `${label(b.blockId)} — balance${via(b.balanceMethod, b.balanceCardFeePence)}`,
              pence: b.totalPence - (b.depositPence ?? 0) + (b.balanceCardFeePence ?? 0),
              ref: b.balanceMethod === "bank" ? b.invoices?.find((i) => i.stage === "balance")?.number : b.balancePaymentIntentId,
            },
          ]
        : []),
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
                  <td className="whitespace-nowrap px-5 py-3">{new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
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
            <input id="acc-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="field" placeholder="At least 8 characters" />
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

const via = (method: string | undefined, fee: number | undefined) =>
  method === "bank" ? " (bank transfer)" : fee ? ` (card, incl. ${formatPrice(fee)} card fee)` : "";

const dueText = (iso: string) => ukDateTime(iso, "short");

/** Ways to settle an outstanding payment: bank transfer (invoice, no fee) or card (plus the card fee) */
function PayOptions({ bookingId, stage, amount, hasInvoice }: { bookingId: string; stage: "initial" | "balance"; amount: number; hasInvoice: boolean }) {
  const [busy, setBusy] = useState<"" | "card" | "bank">("");
  const [message, setMessage] = useState("");
  const go = async (method: "card" | "bank") => {
    setBusy(method);
    setMessage("");
    const url = stage === "balance" ? "/api/partners/balance" : "/api/partners/pay-card";
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, method }) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.url) {
      window.location.href = json.url;
      return;
    }
    setBusy("");
    setMessage(json.message ?? "Something went wrong. Please try again.");
  };
  const fee = cardFeePence(amount);
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-3">
        {stage === "balance" && bankTransferEnabled() && !hasInvoice && (
          <button type="button" disabled={!!busy} onClick={() => go("bank")} className={buttonClass("dark")}>
            {busy === "bank" ? "Issuing invoice…" : `Pay ${formatPrice(amount)} by bank transfer (no fee)`}
          </button>
        )}
        <button type="button" disabled={!!busy} onClick={() => go("card")} className={stage === "balance" && !hasInvoice ? buttonClass("dark") : "rounded-full border border-navy-950/25 bg-white px-5 py-2.5 text-sm font-semibold"}>
          {busy === "card" ? "Opening payment…" : `${hasInvoice || stage === "initial" ? "Pay by card instead" : "Pay by card"}: ${formatPrice(amount + fee)} (incl. ${formatPrice(fee)} card fee)`}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-[#8c1d18]" role="alert">{message}</p>}
    </div>
  );
}

export function Notice({ tone, children, onClose }: { tone: "good" | "warn"; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="status" className={`mt-6 flex items-start gap-4 rounded-2xl p-4 text-sm ${tone === "good" ? "bg-[#e3f3e8] text-[#1d4f2f]" : "bg-[#fff4d6] text-[#5c4300]"}`}>
      <p className="flex-1">{children}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-lg leading-none">×</button>
    </div>
  );
}
