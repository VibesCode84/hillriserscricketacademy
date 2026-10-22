"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  blockUnlocked,
  BOWLING_MACHINE_PENCE,
  depositFor,
  lastSessionDate,
  longDate,
  documentKinds,
  itemPricePence,
  machineKey,
  PARTNER_HOLD_MINUTES,
  PARTNER_RATE_PENCE,
  sessionAbilities,
  sessionAgeGroups,
  sessionGenders,
  shortDate,
  slotKey,
  timeLabel,
  type PartnerBlock,
  type SlotTemplate,
} from "@/data/partners";
import { formatPrice } from "@/data/site";
import type { NetBooking, PartnerDocument } from "@/lib/partners/store";
import { buttonClass } from "../Button";

type Profile = { id: string; orgName: string; contactName: string; email: string; phone: string; hasPassword: boolean };
type Availability = { nets: Record<string, boolean>; machines: Record<string, boolean>; at: string };

const POLL_MS = 8000;
const kindLabel = (k: string) => documentKinds.find((d) => d.value === k)?.label ?? k;
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function PartnerPortal(props: {
  partner: Profile;
  documents: PartnerDocument[];
  bookings: NetBooking[];
  blocks: PartnerBlock[];
  portalLink?: string;
  banner?: { kind: "paid" | "cancelled" | "welcome"; bookingId?: string; balance?: boolean };
}) {
  const [documents, setDocuments] = useState(props.documents);
  const [bookings, setBookings] = useState(props.bookings);
  const [banner, setBanner] = useState(props.banner);

  const refreshMe = useCallback(async () => {
    const res = await fetch("/api/partners/me", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setDocuments(json.documents);
    setBookings(json.bookings);
    return json.bookings as NetBooking[];
  }, []);

  // After returning from Stripe, the webhook confirms the booking — check until it does (up to ~1 minute)
  useEffect(() => {
    if (banner?.kind !== "paid" || !banner.bookingId) return;
    let tries = 0;
    const t = setInterval(async () => {
      const list = await refreshMe();
      const b = list?.find((x) => x.id === banner.bookingId);
      const settled = b?.status === "confirmed" || (!banner.balance && b?.status === "reserved");
      if (settled || ++tries > 20) clearInterval(t);
    }, 3000);
    return () => clearInterval(t);
  }, [banner, refreshMe]);

  const router = useRouter();
  const signOut = async () => {
    await fetch("/api/partners/access", { method: "DELETE" });
    router.replace("/partners");
    router.refresh();
  };

  const paidBooking = banner?.bookingId ? bookings.find((b) => b.id === banner.bookingId) : undefined;

  return (
    <main className="container-x py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Signed in as {props.partner.contactName}</p>
          <h1 className="text-4xl md:text-5xl">{props.partner.orgName}</h1>
        </div>
        <button type="button" onClick={signOut} className="text-sm font-semibold underline underline-offset-4">Sign out</button>
      </div>

      {banner?.kind === "welcome" && (
        <Notice tone="good" onClose={() => setBanner(undefined)}>
          <strong>Your account is ready.</strong> Choose your nets below, then upload your documents. You can sign in any time at the partner
          page with your email and password.
        </Notice>
      )}
      {banner?.kind === "paid" && (
        <Notice tone="good" onClose={() => setBanner(undefined)}>
          {paidBooking?.status === "confirmed" && paidBooking.balancePaidAt ? (
            <><strong>Balance received — your nets are confirmed.</strong> They&rsquo;re listed under Your bookings.</>
          ) : paidBooking?.status === "confirmed" ? (
            <><strong>Payment received — your sessions are booked.</strong> They&rsquo;re listed under Your bookings.</>
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
      {banner?.kind === "cancelled" && (
        <Notice tone="warn" onClose={() => setBanner(undefined)}>
          Payment wasn&rsquo;t completed, so those nets have been released. You can choose them again below if they&rsquo;re still free.
        </Notice>
      )}

      {props.portalLink && (
        <details className="mt-6 rounded-2xl bg-white p-5 text-sm">
          <summary className="cursor-pointer font-semibold">Your private portal link</summary>
          <p className="mt-2 text-ink-muted">This link signs you in on any device. Keep it private.</p>
          <input readOnly value={props.portalLink} onFocus={(e) => e.currentTarget.select()} className="field mt-3 font-mono text-xs" aria-label="Portal link" />
        </details>
      )}

      <div className="mt-8 rounded-2xl border border-gold/30 bg-white p-5 md:p-6">
        <h2 className="text-2xl">Block bookings only</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-ink-muted">
          We only accept block bookings: you book the same net, at the same time, every week of the block. Our block rate is{" "}
          <strong className="text-navy-950">{formatPrice(PARTNER_RATE_PENCE)} per net per hour</strong>, with the bowling machine{" "}
          {formatPrice(BOWLING_MACHINE_PENCE)} per hour on top. We don&rsquo;t take one-off or weekly bookings, so there&rsquo;s no
          separate session rate.
        </p>
      </div>

      {props.blocks.map((block) => (
        <BookingGrid
          key={block.id}
          block={block}
          onBooked={refreshMe}
          bookings={bookings}
          lockedBy={blockUnlocked(block, bookings) ? undefined : props.blocks.find((b) => b.id === block.requiresBlock)?.label}
        />
      ))}

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
                            : `Awaiting payment${b.holdExpiresAt ? ` · held until ${new Date(b.holdExpiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}`}
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
                    {b.status === "reserved" && <PayBalance bookingId={b.id} amount={b.totalPence - (b.depositPence ?? 0)} />}
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <PaymentHistory bookings={bookings} blocks={props.blocks} />

      <Documents documents={documents} onChange={refreshMe} />

      <Account partner={props.partner} />
    </main>
  );
}

/* ── Payment history ───────────────────────────────────────────────────── */

function PaymentHistory({ bookings, blocks }: { bookings: NetBooking[]; blocks: PartnerBlock[] }) {
  const label = (id: string) => blocks.find((b) => b.id === id)?.label ?? id;
  const rows = bookings
    .flatMap((b) => [
      ...(b.paidAt
        ? [{ at: b.paidAt, what: `${label(b.blockId)} — ${b.plan === "deposit" ? "deposit" : "paid in full"}`, pence: b.plan === "deposit" ? (b.depositPence ?? 0) : b.totalPence, ref: b.paymentIntentId }]
        : []),
      ...(b.balancePaidAt ? [{ at: b.balancePaidAt, what: `${label(b.blockId)} — balance`, pence: b.totalPence - (b.depositPence ?? 0), ref: b.balancePaymentIntentId }] : []),
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
          <p className="mt-3 text-ink-muted">To change these details, email HillRisers.</p>
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

function PayBalance({ bookingId, amount }: { bookingId: string; amount: number }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pay = async () => {
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/partners/balance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.url) {
      window.location.href = json.url;
      return;
    }
    setBusy(false);
    setMessage(json.message ?? "Something went wrong. Please try again.");
  };
  return (
    <div className="mt-3">
      <button type="button" disabled={busy} onClick={pay} className={buttonClass("dark")}>
        {busy ? "Opening payment…" : `Pay balance ${formatPrice(amount)}`}
      </button>
      {message && <p className="mt-2 text-sm text-[#8c1d18]" role="alert">{message}</p>}
    </div>
  );
}

function Notice({ tone, children, onClose }: { tone: "good" | "warn"; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="status" className={`mt-6 flex items-start gap-4 rounded-2xl p-4 text-sm ${tone === "good" ? "bg-[#e3f3e8] text-[#1d4f2f]" : "bg-[#fff4d6] text-[#5c4300]"}`}>
      <p className="flex-1">{children}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-lg leading-none">×</button>
    </div>
  );
}

/* ── Live booking grid ─────────────────────────────────────────────────── */

type Who = { ageGroup: string; ability: string; gender: string };
type Selection = Record<string, { bowlingMachine: boolean } & Who>;
const noWho: Who = { ageGroup: "", ability: "", gender: "" };

function BookingGrid({ block, onBooked, bookings, lockedBy }: { block: PartnerBlock; onBooked: () => void; bookings: NetBooking[]; lockedBy?: string }) {
  const [avail, setAvail] = useState<Availability | null>(null);
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<Selection>({});
  const [notice, setNotice] = useState("");
  const [coach, setCoach] = useState("");
  const [ownBalls, setOwnBalls] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState<"full" | "deposit">("full");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const clearError = (k: string) => setErrors(({ [k]: _gone, ...rest }) => (void _gone, rest));

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/partners/availability?block=${block.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json: Availability = await res.json();
      setAvail(json);
      setLive(true);
      // Drop anything someone else has just taken
      setSelected((sel) => {
        const next = { ...sel };
        let lost = false;
        for (const key of Object.keys(next)) {
          const s = parseKey(block, key);
          if (json.nets[key]) {
            delete next[key];
            lost = true;
          } else if (s && next[key].bowlingMachine && json.machines[machineKey(block.id, s)]) {
            next[key] = { ...next[key], bowlingMachine: false };
            lost = true;
          }
        }
        if (lost) setNotice("Someone has just booked one of your choices — it has been removed from your selection.");
        return lost ? next : sel;
      });
    } catch {
      setLive(false);
    }
  }, [block]);

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const days = useMemo(() => {
    const map = new Map<string, SlotTemplate[]>();
    for (const s of block.slots) map.set(s.day, [...(map.get(s.day) ?? []), s]);
    return [...map.entries()];
  }, [block]);

  const toggleNet = (s: SlotTemplate, net: number) => {
    const key = slotKey(block.id, s, net);
    setNotice("");
    setSelected((sel) => {
      const next = { ...sel };
      if (next[key]) delete next[key];
      else {
        // Start from the last session's details — partners often book several for the same group
        const last = Object.values(next).at(-1);
        next[key] = { bowlingMachine: false, ...(last ? { ageGroup: last.ageGroup, ability: last.ability, gender: last.gender } : noWho) };
      }
      return next;
    });
  };

  /** The one bowling machine goes on one selected net in the slot */
  const setMachine = (s: SlotTemplate, net: number | null) => {
    setSelected((sel) => {
      const next = { ...sel };
      for (const n of s.nets) {
        const key = slotKey(block.id, s, n);
        if (next[key]) next[key] = { ...next[key], bowlingMachine: n === net };
      }
      return next;
    });
  };

  const setWho = (key: string, idx: number, field: keyof Who, value: string) => {
    setSelected((sel) => (sel[key] ? { ...sel, [key]: { ...sel[key], [field]: value } } : sel));
    clearError(`items.${idx}.${field}`);
  };

  const items = Object.entries(selected)
    .map(([key, v]) => ({ key, slot: parseKey(block, key), net: Number(key.split(":n").at(-1)), ...v }))
    .filter((i) => i.slot) as ({ key: string; slot: SlotTemplate; net: number; bowlingMachine: boolean } & Who)[];
  const total = items.reduce((n, i) => n + itemPricePence(i.slot, i.bowlingMachine), 0);
  const anyMachine = items.some((i) => i.bowlingMachine);
  // Deposit option: the balance is due by midnight at the end of the partner's last paid session in the earlier block
  const balanceDate = block.deposit ? lastSessionDate(block.deposit.dueAfterBlock, bookings) : undefined;
  const depositPlan = plan === "deposit" && !!balanceDate;
  const deposit = depositFor(block, total);

  const pay = async () => {
    setBusy(true);
    setErrors({});
    setNotice("");
    const res = await fetch("/api/partners/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockId: block.id,
        items: items.map((i) => ({ slotKey: i.key, bowlingMachine: i.bowlingMachine, ageGroup: i.ageGroup, ability: i.ability, gender: i.gender })),
        machineCoach: coach || undefined,
        plan: depositPlan ? "deposit" : "full",
        ownBalls,
        noVideo,
        agreeTerms: agree,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok && json.url) {
      window.location.href = json.url;
      return;
    }
    setBusy(false);
    setErrors(json.errors ?? {});
    setNotice(json.message ?? "Something went wrong. Please try again.");
    if (res.status === 409) {
      await load();
      onBooked();
    }
  };

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl">{block.label}</h2>
          <p className="text-ink-muted">{block.summary} · block rate {formatPrice(PARTNER_RATE_PENCE)} per net per hour · bowling machine +{formatPrice(BOWLING_MACHINE_PENCE)} per hour</p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-ink-muted" aria-live="polite">
          <span className={`h-2.5 w-2.5 rounded-full ${live ? "animate-pulse bg-[#1d9b4b]" : "bg-[#b0b0b0]"}`} aria-hidden="true" />
          {live ? `Live${avail ? ` · updated ${clock(avail.at)}` : ""}` : "Reconnecting…"}
        </p>
      </div>
      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
        {block.notes.map((n) => <li key={n}>{n}</li>)}
      </ul>
      {lockedBy && (
        <p className="mt-4 rounded-2xl bg-[#fff4d6] p-4 text-sm text-[#5c4300]">
          <strong>Book {lockedBy} first.</strong> {block.label} is only open to partners who have booked {lockedBy}. Once your payment
          for {lockedBy} has gone through, you can choose your {block.label.toLowerCase()} nets here.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {days.map(([day, slots]) => (
            <div key={day} className="overflow-hidden rounded-2xl bg-white">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-navy-950/10 px-4 py-3">
                <h3 className="text-xl">{day}s</h3>
                <p className="text-xs text-ink-muted">{slots[0].dates.length} weeks: {slots[0].dates.map(shortDate).join(", ")}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-sm">
                  <thead className="text-xs uppercase tracking-wider text-ink-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Time</th>
                      {[1, 2, 3].map((n) => <th key={n} className="px-2 py-2 font-semibold">Net {n}</th>)}
                      <th className="px-2 py-2 font-semibold">Bowling machine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-950/5">
                    {slots.map((s) => {
                      const mTaken = avail?.machines[machineKey(block.id, s)] ?? false;
                      const selNets = s.nets.filter((n) => selected[slotKey(block.id, s, n)]);
                      const machineOn = selNets.find((n) => selected[slotKey(block.id, s, n)].bowlingMachine) ?? null;
                      return (
                        <tr key={s.start}>
                          <td className="whitespace-nowrap px-4 py-2 font-semibold">{timeLabel(s.start)}–{timeLabel(s.end)}</td>
                          {[1, 2, 3].map((n) => {
                            if (!s.nets.includes(n)) return <td key={n} className="px-2 py-2 text-center text-xs text-ink-muted/60">Not available</td>;
                            const key = slotKey(block.id, s, n);
                            const taken = avail?.nets[key] ?? false;
                            const on = !!selected[key];
                            return (
                              <td key={n} className="px-2 py-1.5 text-center">
                                <button
                                  type="button"
                                  disabled={taken || !avail || !!lockedBy}
                                  onClick={() => toggleNet(s, n)}
                                  aria-pressed={on}
                                  aria-label={`${day} ${timeLabel(s.start)} net ${n}: ${taken ? "booked" : on ? "selected" : "available"}`}
                                  className={`w-full rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                                    taken
                                      ? "cursor-not-allowed border-transparent bg-cream-200 text-ink-muted line-through"
                                      : on
                                        ? "border-navy-950 bg-navy-950 text-cream"
                                        : "border-[#1d9b4b]/40 bg-[#e3f3e8] text-[#1d6b3a] hover:border-[#1d6b3a]"
                                  }`}
                                >
                                  {taken ? "Booked" : on ? "Selected ✓" : "Available"}
                                </button>
                              </td>
                            );
                          })}
                          <td className="px-2 py-1.5 text-center">
                            {mTaken ? (
                              <span className="text-xs text-ink-muted">Booked</span>
                            ) : selNets.length === 0 ? (
                              <span className="text-xs text-ink-muted">Available</span>
                            ) : selNets.length === 1 ? (
                              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
                                <input type="checkbox" checked={machineOn !== null} onChange={(e) => setMachine(s, e.target.checked ? selNets[0] : null)} className="h-4 w-4 accent-[#0b2345]" />
                                Add (+{formatPrice(BOWLING_MACHINE_PENCE * s.dates.length)})
                              </label>
                            ) : (
                              <select
                                value={machineOn ?? ""}
                                onChange={(e) => setMachine(s, e.target.value ? Number(e.target.value) : null)}
                                className="rounded-lg border border-navy-950/20 bg-white px-2 py-1.5 text-xs"
                                aria-label={`${day} ${timeLabel(s.start)} bowling machine`}
                              >
                                <option value="">No machine</option>
                                {selNets.map((n) => <option key={n} value={n}>On net {n}</option>)}
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <aside className="self-start rounded-3xl bg-navy-950 p-6 text-cream lg:sticky lg:top-6">
          <h3 className="text-2xl">Your selection</h3>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-slate">Choose available nets on the grid. Each one is booked for every week of the block.</p>
          ) : (
            <>
              <p className="mt-2 text-xs text-slate">For each session, tell us who you&rsquo;re providing for.</p>
              <ul className="mt-3 space-y-3 text-sm">
                {items.map((i, idx) => (
                  <li key={i.key} className="border-b border-cream/10 pb-3">
                    <div className="flex justify-between gap-3">
                      <span>
                        {i.slot.day.slice(0, 3)} {timeLabel(i.slot.start)} · Net {i.net}
                        {i.bowlingMachine && <span className="block text-xs text-gold">+ bowling machine</span>}
                        <span className="block text-xs text-slate">{i.slot.dates.length} weeks</span>
                      </span>
                      <span className="font-semibold">{formatPrice(itemPricePence(i.slot, i.bowlingMachine))}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {(
                        [
                          ["ageGroup", "Age group", sessionAgeGroups],
                          ["ability", "Ability", sessionAbilities],
                          ["gender", "Gender", sessionGenders],
                        ] as const
                      ).map(([field, label, options]) => {
                        const err = errors[`items.${idx}.${field}`];
                        return (
                          <select
                            key={field}
                            value={i[field]}
                            onChange={(e) => setWho(i.key, idx, field, e.target.value)}
                            aria-label={`${i.slot.day} ${timeLabel(i.slot.start)} net ${i.net}: ${label}`}
                            aria-invalid={!!err}
                            className={`w-full min-w-0 rounded-lg border bg-navy-900 px-1.5 py-1.5 text-xs text-cream ${err ? "border-[#ff8a80]" : "border-cream/20"}`}
                          >
                            <option value="">{label}…</option>
                            {options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        );
                      })}
                    </div>
                    {(["ageGroup", "ability", "gender"] as const).some((f) => errors[`items.${idx}.${f}`]) && (
                      <p className="error-text">Please choose the age group, ability and gender.</p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(total)}</span></p>

          {block.deposit && balanceDate && !lockedBy && items.length > 0 && (
            <fieldset className="mt-5 space-y-2 rounded-2xl bg-navy-900 p-4 text-sm">
              <legend className="sr-only">How would you like to pay?</legend>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="radio" name={`plan-${block.id}`} checked={!depositPlan} onChange={() => setPlan("full")} className="mt-0.5 h-4 w-4 accent-[#d5a93f]" />
                <span><strong>Pay in full</strong> — {formatPrice(total)} now. Your nets are confirmed.</span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="radio" name={`plan-${block.id}`} checked={depositPlan} onChange={() => setPlan("deposit")} className="mt-0.5 h-4 w-4 accent-[#d5a93f]" />
                <span>
                  <strong>Reserve with a {block.deposit.percent}% deposit</strong> — {formatPrice(deposit)} now. The balance of{" "}
                  {formatPrice(total - deposit)} must be paid by midnight on {longDate(balanceDate)} (your last autumn session), or the nets are
                  released and the deposit isn&rsquo;t refunded.
                </span>
              </label>
            </fieldset>
          )}

          {anyMachine && (
            <div className="mt-5 space-y-3 rounded-2xl bg-navy-900 p-4 text-sm">
              <p className="font-semibold text-gold">Bowling machine</p>
              <div>
                <label htmlFor={`coach-${block.id}`} className="label !text-cream">Level 2 coach operating the machine</label>
                <input id={`coach-${block.id}`} value={coach} onChange={(e) => (setCoach(e.target.value), clearError("machineCoach"))} className="field" placeholder="Full name" />
                {errors.machineCoach && <p className="error-text">{errors.machineCoach}</p>}
              </div>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="checkbox" checked={ownBalls} onChange={(e) => (setOwnBalls(e.target.checked), clearError("ownBalls"))} className="mt-0.5 h-4 w-4 accent-[#d5a93f]" />
                <span>We will supply our own balls.</span>
              </label>
              {errors.ownBalls && <p className="error-text">{errors.ownBalls}</p>}
            </div>
          )}

          <div className="mt-5 space-y-3 text-sm">
            <label className="flex cursor-pointer items-start gap-2">
              <input type="checkbox" checked={noVideo} onChange={(e) => (setNoVideo(e.target.checked), clearError("noVideo"))} className="mt-0.5 h-4 w-4 accent-[#d5a93f]" />
              <span><strong>No filming or video.</strong> I confirm no filming or video recording of any kind will take place, including on phones.</span>
            </label>
            {errors.noVideo && <p className="error-text">{errors.noVideo}</p>}
            <label className="flex cursor-pointer items-start gap-2">
              <input type="checkbox" checked={agree} onChange={(e) => (setAgree(e.target.checked), clearError("agreeTerms"))} className="mt-0.5 h-4 w-4 accent-[#d5a93f]" />
              <span>I agree to the <Link href="/partners/terms" target="_blank" className="underline">partner terms</Link>. Payments, including deposits, are non-refundable.</span>
            </label>
            {errors.agreeTerms && <p className="error-text">{errors.agreeTerms}</p>}
          </div>

          <button type="button" disabled={busy || items.length === 0} onClick={pay} className={`${buttonClass("primary")} mt-6 w-full`}>
            {busy ? "Holding your nets…" : depositPlan ? `Pay deposit ${formatPrice(deposit)}` : `Book and pay ${items.length ? formatPrice(total) : ""}`}
          </button>
          <p className="mt-3 text-xs text-slate">Secure card payment by Stripe. Your slots are held for {PARTNER_HOLD_MINUTES} minutes while you pay.</p>
          {notice && <p className="mt-3 rounded-xl bg-[#fff4d6] p-3 text-xs text-[#5c4300]" role="alert">{notice}</p>}
        </aside>
      </div>
    </section>
  );
}

function parseKey(block: PartnerBlock, key: string) {
  const [, day, hh, mm] = key.split(":");
  return block.slots.find((s) => s.day === day && s.start === `${hh}:${mm}`);
}

/* ── Documents ─────────────────────────────────────────────────────────── */

function Documents({ documents, onChange }: { documents: PartnerDocument[]; onChange: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    const res = await fetch("/api/partners/documents", { method: "POST", body: new FormData(form) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setMessage(json.message ?? "Upload failed. Please try again.");
      setState("error");
      return;
    }
    form.reset();
    setState("done");
    onChange();
  };

  const missing = documentKinds.filter((k) => k.value !== "other" && k.value !== "first-aid" && !documents.some((d) => d.kind === k.value && d.review !== "rejected"));

  return (
    <section className="mt-14">
      <h2 className="text-3xl">Your documents</h2>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Upload documents for everyone who will coach in your sessions. You can book straight away; HillRisers checks documents before your first
        session.
      </p>
      {missing.length > 0 && (
        <p className="mt-3 rounded-2xl bg-[#fff4d6] p-4 text-sm text-[#5c4300]">Still needed: {missing.map((m) => m.label.replace(/ \(.*\)/, "")).join(", ")}.</p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="self-start rounded-2xl bg-white">
          {documents.length === 0 ? (
            <p className="p-5 text-sm text-ink-muted">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-navy-950/10">
              {documents.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.review === "approved" ? "bg-[#e3f3e8] text-[#1d6b3a]" : d.review === "rejected" ? "bg-[#fbeae8] text-[#8c1d18]" : "bg-[#fff4d6] text-[#7a5a00]"}`}>
                    {d.review === "approved" ? "Approved" : d.review === "rejected" ? "Not accepted" : "Being checked"}
                  </span>
                  <span className="font-semibold">{kindLabel(d.kind)}</span>
                  <a href={`/api/partners/documents/${d.id}`} className="underline">{d.filename}</a>
                  {d.expiresOn && <span className="text-ink-muted">expires {d.expiresOn}</span>}
                  {d.reviewNote && <span className="w-full text-[#8c1d18]">{d.reviewNote}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4 self-start rounded-2xl bg-white p-5">
          <h3 className="text-xl">Upload a document</h3>
          <div>
            <label htmlFor="doc-kind" className="label">Type</label>
            <select id="doc-kind" name="kind" required defaultValue="" className="field">
              <option value="" disabled>Choose a type</option>
              {documentKinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="doc-expiry" className="label">Expiry date <span className="font-normal text-ink-muted">(if it has one)</span></label>
            <input id="doc-expiry" name="expiresOn" type="date" className="field" />
          </div>
          <div>
            <label htmlFor="doc-file" className="label">File</label>
            <input id="doc-file" name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.doc,.docx" className="block w-full text-sm" />
            <p className="hint">PDF, photo or Word document, up to 10 MB.</p>
          </div>
          <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>{state === "sending" ? "Uploading…" : "Upload"}</button>
          {state === "done" && <p className="text-sm text-[#1d6b3a]">Uploaded — thank you.</p>}
          {state === "error" && <p className="error-text" role="alert">{message}</p>}
        </form>
      </div>
    </section>
  );
}
