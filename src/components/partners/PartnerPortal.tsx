"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  blockUnlocked,
  BOWLING_MACHINE_PENCE,
  documentKinds,
  firstInvoiceMonths,
  itemPricePence,
  machineKey,
  monthLabel,
  monthlySplit,
  MONTHLY_INVOICE_DAYS_BEFORE,
  FULL_PAYMENT_UNTIL,
  REFUND_DAYS_BEFORE,
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
import { INVOICE_DUE_HOURS } from "@/data/invoicing";
import { buttonClass } from "../Button";
import { AccountHeader, Notice } from "./PartnerAccount";
import { PartnerEnquiryForm } from "./PartnerEnquiryForm";

type Profile = { id: string; orgName: string; contactName: string };
type NetState = "free" | "requested" | "booked";
type Availability = { nets: Record<string, NetState>; machines: Record<string, boolean>; mine: string[]; at: string };

const POLL_MS = 8000;
const kindLabel = (k: string) => documentKinds.find((d) => d.value === k)?.label ?? k;
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function PartnerPortal(props: {
  partner: Profile;
  documents: PartnerDocument[];
  bookings: NetBooking[];
  blocks: PartnerBlock[];
  /** Priority window: open until `ends` ("11:59pm on Sunday 8 November"); the partner's code, if any */
  priority: { open: boolean; ends: string; code?: string };
  banner?: { kind: "welcome" };
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

  return (
    <div className="container-x py-10 md:py-14">
      <AccountHeader partner={props.partner} current="book" />

      {banner?.kind === "welcome" && (
        <Notice tone="good" onClose={() => setBanner(undefined)}>
          <strong>Your account is ready.</strong> Choose your nets below, then upload your documents. You can sign in any time at the partner
          page with your email and password.
        </Notice>
      )}
      <PriorityPanel {...props.priority} />

      <div className="mt-8 rounded-2xl border border-gold/30 bg-white p-5 md:p-6">
        <h2 className="text-2xl">Block bookings only</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-ink-muted">
          We only accept block bookings: you book the same net, at the same time, every week of the block. Our block rate is{" "}
          <strong className="text-navy-950">{formatPrice(PARTNER_RATE_PENCE)} per net per hour</strong>, with the bowling machine{" "}
          {formatPrice(BOWLING_MACHINE_PENCE)} per hour on top. We don&rsquo;t take one-off or weekly bookings, so there&rsquo;s no
          separate session rate.
        </p>
      </div>

      <HowBookingWorks />

      {props.blocks.map((block) => (
        <BookingGrid
          key={block.id}
          block={block}
          onBooked={refreshMe}
          lockedBy={blockUnlocked(block, bookings) ? undefined : props.blocks.find((b) => b.id === block.requiresBlock)?.label}
          priorityOnly={!block.test && props.priority.open && !props.priority.code ? props.priority.ends : undefined}
        />
      ))}

      <Documents documents={documents} onChange={refreshMe} />

      <section className="mt-14 max-w-2xl">
        <h2 className="text-3xl">Want to talk first?</h2>
        <p className="mt-2 text-ink-muted">Send us a message and we&rsquo;ll be in touch.</p>
        <div className="mt-5 rounded-2xl bg-white p-5"><PartnerEnquiryForm defaults={{ name: props.partner.contactName, orgName: props.partner.orgName }} /></div>
      </section>
    </div>
  );
}


/* ── Live booking grid ─────────────────────────────────────────────────── */

type Who = { ageGroup: string; ability: string; gender: string };
type Selection = Record<string, { bowlingMachine: boolean } & Who>;
const noWho: Who = { ageGroup: "", ability: "", gender: "" };

/** Priority booking: who can book now, and where to enter a code */
function PriorityPanel({ open, ends, code }: { open: boolean; ends: string; code?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!open && !code) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/partners/priority", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: value }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && json.ok) router.refresh();
    else setError(json.errors?.code ?? json.message ?? "Something went wrong.");
  };
  return (
    <div className={`mt-6 rounded-2xl p-5 text-sm ${code ? "bg-[#e3f3e8] text-[#1d4f2f]" : "bg-[#fff4d6] text-[#5c4300]"}`}>
      {code ? (
        <p>
          <strong>Priority access ✓</strong> (code {code}).
          {open ? ` Priority booking is open until ${ends}.` : ""}
        </p>
      ) : (
        <>
          <p>
            <strong>Priority booking for invited partners until {ends}.</strong> Booking opens to everyone after that.
          </p>
          <form onSubmit={submit} className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="priority-code" className="sr-only">Priority code</label>
            <input id="priority-code" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Priority code, e.g. HR-7K3M9P" className="field !mt-0 max-w-xs uppercase" />
            <button type="submit" disabled={busy || value.trim().length < 3} className={buttonClass("dark")}>{busy ? "Checking…" : "Add code"}</button>
          </form>
          {error && <p className="mt-2 text-[#8c1d18]" role="alert">{error}</p>}
        </>
      )}
    </div>
  );
}

function BookingGrid({ block, onBooked, lockedBy, priorityOnly }: { block: PartnerBlock; onBooked: () => void; lockedBy?: string; priorityOnly?: string }) {
  const [avail, setAvail] = useState<Availability | null>(null);
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<Selection>({});
  const [notice, setNotice] = useState("");
  const [coach, setCoach] = useState("");
  const [ownBalls, setOwnBalls] = useState(false);
  const [agree, setAgree] = useState(false);
  const [terms, setTerms] = useState<"" | "termly" | "monthly">("");
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
          if (json.nets[key] !== "free" && !json.mine.includes(key)) {
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
  const months = monthlySplit(items.map((i) => ({ slotKey: i.key, pricePence: itemPricePence(i.slot, i.bowlingMachine), weeks: i.slot.dates.length })), block.id);
  const firstPence = firstInvoiceMonths(months).reduce((n, m) => n + m.pence, 0);
  const blocked = lockedBy ? `Book ${lockedBy} first.` : priorityOnly ? `Priority booking only until ${priorityOnly}. Booking opens to everyone after that.` : "";

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
        terms: terms || undefined,
        ownBalls,
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
          <p className="text-ink-muted">{block.test ? block.summary : <>{block.summary} · block rate {formatPrice(PARTNER_RATE_PENCE)} per net per hour · bowling machine +{formatPrice(BOWLING_MACHINE_PENCE)} per hour</>}</p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-ink-muted" aria-live="polite">
          <span className={`h-2.5 w-2.5 rounded-full ${live ? "animate-pulse bg-[#1d9b4b]" : "bg-[#b0b0b0]"}`} aria-hidden="true" />
          {live ? `Live${avail ? ` · updated ${clock(avail.at)}` : ""}` : "Reconnecting…"}
        </p>
      </div>
      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
        {block.notes.map((n) => <li key={n}>{n}</li>)}
      </ul>
      {blocked && (
        <p className="mt-4 rounded-2xl bg-[#fff4d6] p-4 text-sm text-[#5c4300]">
          <strong>{blocked}</strong>
        </p>
      )}

      <NetLegend />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_22rem]">
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
                            if (!s.nets.includes(n)) return <td key={n} className="px-2 py-2 text-center text-ink-muted/40" aria-hidden="true">–</td>;
                            const key = slotKey(block.id, s, n);
                            const state = avail?.nets[key] ?? "free";
                            const mine = avail?.mine.includes(key) ?? false;
                            const taken = state !== "free";
                            const on = !!selected[key];
                            return (
                              <td key={n} className="px-2 py-1.5 text-center">
                                <button
                                  type="button"
                                  disabled={taken || !avail || !!blocked}
                                  onClick={() => toggleNet(s, n)}
                                  aria-pressed={on}
                                  aria-label={`${day} ${timeLabel(s.start)} net ${n}: ${taken ? (mine ? `your ${state}` : state) : on ? "selected" : "available"}`}
                                  className={`w-full rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                                    state === "booked"
                                      ? "cursor-not-allowed border-[#c0392b]/40 bg-[#fbeae8] text-[#8c1d18]"
                                      : state === "requested"
                                        ? "cursor-not-allowed border-[#d4880f]/50 bg-[#fdf0d5] text-[#8a5a00]"
                                      : on
                                        ? "border-navy-950 bg-navy-950 text-cream"
                                        : "border-[#1d9b4b]/40 bg-[#e3f3e8] text-[#1d6b3a] hover:border-[#1d6b3a]"
                                  }`}
                                >
                                  {state === "booked" ? (mine ? "Yours ✓" : "Booked") : state === "requested" ? (mine ? "Your request" : "Requested") : on ? "Selected ✓" : "Available"}
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
                                Add (+{formatPrice((s.machinePence ?? BOWLING_MACHINE_PENCE) * s.dates.length)})
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
            <p className="mt-3 text-sm text-slate">Choose nets on the grid.</p>
          ) : (
            <>
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

          {items.length > 0 && !blocked && (
            <fieldset className="mt-5 space-y-2 rounded-2xl bg-navy-900 p-4 text-sm">
              <legend className="mb-2 font-semibold text-gold">Payment terms</legend>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="radio" name={`terms-${block.id}`} checked={terms === "termly"} onChange={() => (setTerms("termly"), clearError("terms"))} className="mt-0.5 h-4 w-4 accent-[#e8b84e]" />
                <span><strong>Termly in advance</strong> — one invoice for {formatPrice(total)}</span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="radio" name={`terms-${block.id}`} checked={terms === "monthly"} onChange={() => (setTerms("monthly"), clearError("terms"))} className="mt-0.5 h-4 w-4 accent-[#e8b84e]" />
                <span>
                  <strong>Monthly in advance</strong> — first invoice {formatPrice(firstPence)}
                  {firstPence < total && (
                    <span className="block text-xs text-slate">
                      Then {months.filter((m) => !firstInvoiceMonths(months).includes(m)).map((m) => `${monthLabel(m.month).split(" ")[0]} ${formatPrice(m.pence)}`).join(", ")}, each invoiced {MONTHLY_INVOICE_DAYS_BEFORE} days before
                      that month&rsquo;s first session.
                    </span>
                  )}
                </span>
              </label>
              {months.some((m) => m.firstSession <= FULL_PAYMENT_UNTIL) && <p className="text-xs text-slate">Sessions up to Christmas are invoiced in full.</p>}
              {errors.terms && <p className="error-text">{errors.terms}</p>}
              <p className="pt-1 text-xs text-slate">
                We&rsquo;ll review your request and email the invoice, payable by bank transfer within {INVOICE_DUE_HOURS} hours. Your first payment confirms the booking.
              </p>
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
                <input type="checkbox" checked={ownBalls} onChange={(e) => (setOwnBalls(e.target.checked), clearError("ownBalls"))} className="mt-0.5 h-4 w-4 accent-[#e8b84e]" />
                <span>We will supply our own balls.</span>
              </label>
              {errors.ownBalls && <p className="error-text">{errors.ownBalls}</p>}
            </div>
          )}

          <div className="mt-5 space-y-3 text-sm">
            <label className="flex cursor-pointer items-start gap-2">
              <input type="checkbox" checked={agree} onChange={(e) => (setAgree(e.target.checked), clearError("agreeTerms"))} className="mt-0.5 h-4 w-4 accent-[#e8b84e]" />
              <span>I agree to the <Link href="/partners/terms" target="_blank" className="underline">partner terms</Link>. Refunds only if I cancel more than {REFUND_DAYS_BEFORE} days before my first session.</span>
            </label>
            {errors.agreeTerms && <p className="error-text">{errors.agreeTerms}</p>}
          </div>

          <button type="button" disabled={busy || items.length === 0 || !!blocked} onClick={pay} className={`${buttonClass("primary")} mt-6 w-full`}>
            {busy
              ? "Sending your request…"
              : "Send booking request"}
          </button>
          {notice && <p className="mt-3 rounded-xl bg-[#fff4d6] p-3 text-xs text-[#5c4300]" role="alert">{notice}</p>}
        </aside>
      </div>
    </section>
  );
}

function NetLegend() {
  const item = (cls: string, label: string) => (
    <span className="inline-flex items-center gap-2"><span className={`h-3.5 w-3.5 rounded border ${cls}`} aria-hidden="true" />{label}</span>
  );
  return (
    <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
      {item("border-[#1d9b4b]/40 bg-[#e3f3e8]", "Available")}
      {item("border-[#d4880f]/50 bg-[#fdf0d5]", "Requested")}
      {item("border-[#c0392b]/40 bg-[#fbeae8]", "Booked")}
    </p>
  );
}

/** How booking works: request, invoice, payment — first come, first served */
export function HowBookingWorks({ tone = "light" }: { tone?: "light" | "cream" }) {
  return (
    <div className={`mt-6 rounded-2xl p-5 md:p-6 ${tone === "light" ? "bg-white" : "bg-cream-200"}`}>
      <h2 className="text-2xl">How booking works</h2>
      <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 leading-relaxed text-ink-muted">
        <li><strong className="text-navy-950">Send a booking request.</strong> Choose your nets and termly or monthly payment. Requests are first come, first served, and a requested net shows amber.</li>
        <li><strong className="text-navy-950">We review it and email your invoice.</strong> Pay by bank transfer within {INVOICE_DUE_HOURS} hours.</li>
        <li><strong className="text-navy-950">Your first payment confirms the booking.</strong> Once your documents are in too, the net shows red.</li>
      </ol>
      <p className="mt-3 max-w-3xl text-sm text-ink-muted">
        Sessions up to Christmas are invoiced in full. Refunds only if you cancel more than {REFUND_DAYS_BEFORE} days before your first session.
      </p>
    </div>
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
        For everyone coaching in your sessions.
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
