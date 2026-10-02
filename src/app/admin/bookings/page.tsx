import Link from "next/link";
import { sessions, formatTimeRange, getSession, sessionLabel, DAYS } from "@/data/sessions";
import { getAcademy } from "@/data/academies";
import { FUTURE_CAMPS, getCamp } from "@/data/camps";
import { formatPrice } from "@/data/site";
import { availabilityFor, getStore, type BookingStatus } from "@/lib/booking";
import { Crest } from "@/components/Logo";
import { BookingRowActions, ManualBookingForm, TrialRequestRow, WaitlistRow } from "@/components/admin/AdminActions";
import { getPaymentProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

const statusStyle: Record<BookingStatus, string> = {
  confirmed: "bg-[#e3f3ea] text-[#1d5b3a]",
  pending_payment: "bg-[#fdf3dc] text-[#7a5600]",
  cancelled: "bg-[#eef0f3] text-[#4d5664]",
  expired: "bg-[#eef0f3] text-[#4d5664]",
  refunded: "bg-[#fbeae8] text-[#8c1d18]",
  part_refunded: "bg-[#fbeae8] text-[#8c1d18]",
  waitlist: "bg-[#e7eefb] text-[#1c3f6e]",
};
const statusLabel: Record<BookingStatus, string> = {
  confirmed: "Paid",
  pending_payment: "Awaiting payment",
  cancelled: "Cancelled",
  expired: "Expired",
  refunded: "Refunded",
  part_refunded: "Part refunded",
  waitlist: "Waiting list",
};

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ session?: string; show?: string }> }) {
  const { session: sessionFilter, show } = await searchParams;
  const store = getStore();
  const [counts, bookings, waitlist, enquiries, trialRequests, campInterests] = await Promise.all([
    store.sessionCounts(),
    store.listBookings({ sessionId: sessionFilter }),
    store.listWaitlist({ sessionId: sessionFilter }),
    store.listEnquiries(),
    store.listTrialRequests(),
    store.listCampInterests(),
  ]);
  const openTrials = trialRequests.filter((t) => t.status === "new" || t.status === "contacted");
  const securedTrials = openTrials.filter((t) => t.depositStatus === "paid");
  const activeOnly = show !== "all";
  const visible = bookings.filter((b) => !activeOnly || ["confirmed", "pending_payment", "part_refunded"].includes(b.status));
  const selected = sessionFilter ? getSession(sessionFilter) : undefined;
  const provider = getPaymentProvider()?.name ?? "none";
  const qs = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({ session: sessionFilter, show, ...o }).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-navy-950 p-2"><Crest className="h-8 w-auto" /></div>
          <div>
            <h1 className="text-3xl">Academy bookings</h1>
            <p className="text-sm text-ink-muted">
              Payments: {provider === "stripe" ? "Stripe" : provider === "dev" ? "Development checkout" : "Not configured"} · Storage:{" "}
              {process.env.DATABASE_URL ? "PostgreSQL" : "Local file"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href={`/api/admin/export${sessionFilter ? `?sessionId=${sessionFilter}` : ""}`} className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream">
            Export CSV
          </a>
          <Link href="/" className="rounded-full border border-navy-950/20 px-5 py-2.5 text-sm font-semibold">View site</Link>
        </div>
      </header>

      {/* Trial requests — taken while the weekly programme is being finalised */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl">Trial requests</h2>
            <p className="text-sm text-ink-muted">
              {openTrials.length} open ({securedTrials.length} with a deposit paid) · families waiting for a confirmed day and time. Preferred days help decide which academy runs when.
            </p>
          </div>
          <a href="/api/admin/export?type=trials" className="rounded-full border border-navy-950/20 px-4 py-2 text-sm font-semibold">Export trial requests</a>
        </div>
        <div className="mt-4 divide-y divide-navy-950/10 rounded-2xl border border-navy-950/10 bg-white">
          {trialRequests.length === 0 && <p className="p-5 text-sm text-ink-muted">No trial requests yet.</p>}
          {trialRequests.map((t) => (
            <TrialRequestRow key={t.id} request={t} academyName={getAcademy(t.academy)?.name ?? t.academy} />
          ))}
        </div>
      </section>

      {/* Capacity overview */}
      <section className="mt-10">
        <h2 className="text-2xl">Sessions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS.flatMap((d) => sessions.filter((s) => s.day === d)).map((s) => {
            const a = availabilityFor(s, counts[s.id]);
            const c = counts[s.id];
            const pct = Math.min(100, Math.round((a.taken / s.capacity) * 100));
            return (
              <Link
                key={s.id}
                href={`/admin/bookings${qs({ session: sessionFilter === s.id ? undefined : s.id })}`}
                className={`rounded-2xl border bg-white p-4 transition hover:border-navy-950/40 ${sessionFilter === s.id ? "border-navy-950 ring-2 ring-gold" : "border-navy-950/10"}`}
              >
                <p className="text-sm font-semibold text-gold-deep">
                  {s.day} {formatTimeRange(s)} {!s.confirmed && <span className="font-normal text-ink-muted">· unconfirmed</span>}
                  {!s.active && <span className="font-normal text-[#8c1d18]"> · inactive</span>}
                </p>
                <p className="mt-1 font-serif text-xl">{sessionLabel(s)}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-950/10">
                  <div className={`h-full ${a.status === "full" ? "bg-[#8c1d18]" : "bg-gold"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  <strong className="text-navy-950">{c?.confirmed ?? 0} / {s.capacity} booked</strong>
                  {c?.held ? ` · ${c.held} held` : ""}
                  {c?.waitlist ? ` · ${c.waitlist} waiting` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bookings */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">{selected ? `${sessionLabel(selected)} — ${selected.day} ${formatTimeRange(selected)}` : "All bookings"}</h2>
            {selected && <p className="text-sm text-ink-muted">{(counts[selected.id]?.confirmed ?? 0)} / {selected.capacity} booked</p>}
          </div>
          <div className="flex gap-2 text-sm">
            <Link href={`/admin/bookings${qs({ show: undefined })}`} className={`rounded-full px-4 py-2 ${activeOnly ? "bg-navy-950 text-cream" : "border border-navy-950/20"}`}>Active</Link>
            <Link href={`/admin/bookings${qs({ show: "all" })}`} className={`rounded-full px-4 py-2 ${!activeOnly ? "bg-navy-950 text-cream" : "border border-navy-950/20"}`}>All statuses</Link>
            {sessionFilter && <Link href="/admin/bookings" className="rounded-full border border-navy-950/20 px-4 py-2">Clear filter</Link>}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {visible.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-muted">No bookings yet.</td></tr>
              )}
              {visible.map((b, i) => {
                const s = getSession(b.sessionId);
                return (
                  <tr key={b.id} className="align-top">
                    <td className="px-4 py-4 text-ink-muted">{i + 1}</td>
                    <td className="px-4 py-4">
                      <details>
                        <summary className="cursor-pointer font-semibold">{b.player?.name ?? "—"}</summary>
                        <dl className="mt-2 space-y-1 text-xs text-ink-muted">
                          <div>DOB: {b.player?.dateOfBirth} · {b.player?.gender}</div>
                          <div>Experience: {b.player?.experience} · Interest: {b.player?.interest}</div>
                          {b.player?.recommendedPathway && <div>Pathway: {b.player.recommendedPathway}</div>}
                          {b.player?.clubOrSchool && <div>Club/school: {b.player.clubOrSchool}</div>}
                          {b.player?.playingProfile && <div>Profile: {b.player.playingProfile}</div>}
                          <div>Emergency: {b.player?.emergencyContactName} · {b.player?.emergencyContactPhone}</div>
                          {b.player?.medicalNotes && <div className="font-semibold text-[#8c1d18]">Medical: {b.player.medicalNotes}</div>}
                          <div>Photo consent: {b.player?.photoConsent ? "Yes" : "No"}</div>
                          {b.player?.heardAbout && <div>Heard via: {b.player.heardAbout}</div>}
                          {b.notes && <div>Notes: {b.notes}</div>}
                        </dl>
                      </details>
                      {b.isTrial && <span className="mt-1 inline-block rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">Trial</span>}
                    </td>
                    <td className="px-4 py-4">{s ? <>{sessionLabel(s)}<br /><span className="text-ink-muted">{s.day} {formatTimeRange(s)}</span></> : b.sessionId}</td>
                    <td className="px-4 py-4">
                      {b.parent?.name}
                      <br />
                      <a href={`mailto:${b.parent?.email}`} className="text-ink-muted underline">{b.parent?.email}</a>
                      <br />
                      <a href={`tel:${b.parent?.mobile}`} className="text-ink-muted">{b.parent?.mobile}</a>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[b.status]}`}>{statusLabel[b.status]}</span>
                      <p className="mt-1 text-xs text-ink-muted">
                        {b.amountPaidPence !== undefined && formatPrice(b.amountPaidPence)}
                        {b.amountRefundedPence ? ` · refunded ${formatPrice(b.amountRefundedPence)}` : ""}
                        {b.paymentType === "manual" && "Manual booking"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <BookingRowActions booking={{ id: b.id, status: b.status, attended: b.attended, sessionId: b.sessionId }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl">Waiting list &amp; interest</h2>
          <div className="mt-4 divide-y divide-navy-950/10 rounded-2xl border border-navy-950/10 bg-white">
            {waitlist.length === 0 && <p className="p-5 text-sm text-ink-muted">Nobody waiting.</p>}
            {waitlist.map((w) => (
              <WaitlistRow key={w.id} entry={w} sessionLabel={(() => { const s = getSession(w.sessionId); return s ? `${sessionLabel(s)} · ${s.day} ${formatTimeRange(s)}` : w.sessionId; })()} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl">Add manual booking</h2>
          <div className="mt-4 rounded-2xl border border-navy-950/10 bg-white p-5">
            <ManualBookingForm defaultSessionId={sessionFilter} />
          </div>
        </section>
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl">Holiday camp interest <span className="text-base text-ink-muted">({campInterests.length})</span></h2>
          <a href="/api/admin/export?type=camps" className="rounded-full border border-navy-950/20 px-4 py-2 text-sm font-semibold">Export camp interest</a>
        </div>
        <div className="mt-4 divide-y divide-navy-950/10 rounded-2xl border border-navy-950/10 bg-white">
          {campInterests.length === 0 && <p className="p-5 text-sm text-ink-muted">No registrations yet.</p>}
          {campInterests.slice(0, 100).map((c) => (
            <div key={c.id} className="p-5 text-sm">
              <p className="font-semibold">
                {c.childName} <span className="font-normal text-ink-muted">· age {c.childAge} · {c.interest}</span>
              </p>
              <p className="text-ink-muted">
                {c.camps.map((id) => (id === FUTURE_CAMPS ? "Future camps" : getCamp(id)?.name ?? id)).join(", ")}
              </p>
              <p className="text-ink-muted">
                {c.parentName} · <a href={`mailto:${c.email}`} className="underline">{c.email}</a>
                {c.mobile && <> · {c.mobile}</>}
              </p>
              {c.notes && <p className="mt-1 text-ink-muted">Notes: {c.notes}</p>}
              <p className="mt-1 text-xs text-ink-muted">{new Date(c.createdAt).toLocaleString("en-GB")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Enquiries</h2>
        <div className="mt-4 divide-y divide-navy-950/10 rounded-2xl border border-navy-950/10 bg-white">
          {enquiries.length === 0 && <p className="p-5 text-sm text-ink-muted">No enquiries yet.</p>}
          {enquiries.slice(0, 50).map((e) => (
            <div key={e.id} className="p-5 text-sm">
              <p className="font-semibold">
                {e.parentName} · <a href={`mailto:${e.email}`} className="underline">{e.email}</a>
                {e.mobile && <> · {e.mobile}</>}
                {e.childAge && <> · child age {e.childAge}</>}
              </p>
              <p className="mt-1 whitespace-pre-line text-ink-muted">{e.message}</p>
              <p className="mt-1 text-xs text-ink-muted">{new Date(e.createdAt).toLocaleString("en-GB")} · {e.source}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
