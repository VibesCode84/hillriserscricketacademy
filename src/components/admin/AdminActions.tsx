"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sessions, formatTimeRange, getSession, sessionLabel } from "@/data/sessions";
import type { BookingStatus, DepositStatus, TrialRequestStatus, TrialRequestView, WaitlistEntry } from "@/lib/booking/types";
import { formatPrice } from "@/data/site";

async function adminPost(body: unknown) {
  const res = await fetch("/api/admin/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json.ok, message: json.message as string | undefined, errors: json.errors as Record<string, string> | undefined };
}

export function BookingRowActions({ booking }: { booking: { id: string; status: BookingStatus; attended?: boolean; sessionId: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (body: unknown, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError("");
    const r = await adminPost(body);
    if (!r.ok) setError(r.message ?? "Action failed");
    setBusy(false);
    router.refresh();
  };

  const active = booking.status === "confirmed" || booking.status === "part_refunded";

  return (
    <div className="space-y-2">
      {active && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled={busy}
            checked={!!booking.attended}
            onChange={(e) => run({ action: "attendance", bookingId: booking.id, attended: e.target.checked })}
            className="h-4 w-4 accent-[#0b2345]"
          />
          Attended
        </label>
      )}
      {(active || booking.status === "pending_payment") && (
        <select
          aria-label="Move to another session"
          disabled={busy}
          className="w-full rounded-lg border border-navy-950/15 bg-white px-2 py-1.5 text-xs"
          value=""
          onChange={(e) => e.target.value && run({ action: "move", bookingId: booking.id, toSessionId: e.target.value }, "Move this player to the selected session?")}
        >
          <option value="">Move to…</option>
          {sessions
            .filter((s) => s.id !== booking.sessionId && s.active)
            .map((s) => (
              <option key={s.id} value={s.id}>{s.day} {formatTimeRange(s)} · {sessionLabel(s)}</option>
            ))}
        </select>
      )}
      {(active || booking.status === "pending_payment") && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run({ action: "cancel", bookingId: booking.id }, "Cancel this booking? Refunds must be issued separately in Stripe.")}
          className="text-xs font-semibold text-[#8c1d18] underline"
        >
          Cancel booking
        </button>
      )}
      {error && <p className="text-xs text-[#8c1d18]">{error}</p>}
    </div>
  );
}

export function WaitlistRow({ entry, sessionLabel }: { entry: WaitlistEntry; sessionLabel: string }) {
  const s = getSession(entry.sessionId);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/book?session=${entry.sessionId}`;
  const subject = `A place is available — ${s?.title ?? "HillRisers"}`;
  const body = `Hi ${entry.parentName.split(" ")[0]},\n\nGood news — a place has opened for ${entry.playerName} in ${sessionLabel}.\n\nYou can book it here: ${link}\n\nThe HillRisers coaching team`;
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-5 text-sm">
      <div>
        <p className="font-semibold">{entry.playerName} <span className="font-normal text-ink-muted">· DOB {entry.dateOfBirth}</span></p>
        <p className="text-ink-muted">{sessionLabel}</p>
        <p className="text-ink-muted">{entry.parentName} · {entry.email} · {entry.mobile}</p>
        <p className="text-xs text-ink-muted">{new Date(entry.createdAt).toLocaleString("en-GB")}{s && !s.confirmed ? " · registered interest" : ""}</p>
      </div>
      <a href={`mailto:${entry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`} className="rounded-full bg-navy-950 px-4 py-2 text-xs font-semibold text-cream">
        Send booking link
      </a>
    </div>
  );
}

const trialStatusLabel: Record<TrialRequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  closed: "Closed",
};

const depositBadge: Record<DepositStatus, { label: string; cls: string }> = {
  none: { label: "No deposit", cls: "bg-[#eef0f3] text-[#4d5664]" },
  pending: { label: "Deposit not completed", cls: "bg-[#fdf3dc] text-[#7a5600]" },
  paid: { label: "Deposit paid", cls: "bg-[#e3f3ea] text-[#1d5b3a]" },
  applied: { label: "Deposit credited", cls: "bg-[#e7eefb] text-[#1c3f6e]" },
  refunded: { label: "Deposit refunded", cls: "bg-[#fbeae8] text-[#8c1d18]" },
};

export function TrialRequestRow({ request: t, academyName }: { request: TrialRequestView; academyName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const first = t.player?.name.split(" ")[0] ?? "your child";
  const link = `${origin}/book?discipline=${t.academy}`;
  const body = `Hi ${t.parent?.name.split(" ")[0] ?? ""},\n\nThank you for your trial request for ${first}. We'd love to see ${first} at ${academyName} on [DAY] at [TIME].\n\nYou can secure the place here: ${link}\n\nThe HillRisers coaching team`;

  const setStatus = async (status: TrialRequestStatus) => {
    setBusy(true);
    await adminPost({ action: "trialStatus", requestId: t.id, status });
    setBusy(false);
    router.refresh();
  };

  const markCredited = async () => {
    if (!window.confirm("Mark this deposit as credited to a booked session? Add the session with 'Add manual booking'.")) return;
    setBusy(true);
    await adminPost({ action: "depositStatus", requestId: t.id, status: "applied" });
    setBusy(false);
    router.refresh();
  };
  const badge = depositBadge[t.depositStatus ?? "none"];

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 p-5 text-sm">
      <details className="min-w-0 flex-1">
        <summary className="cursor-pointer">
          <span className="font-semibold">{t.player?.name ?? "—"}</span>
          <span className="text-ink-muted"> · {academyName} · {t.preferredDays.length ? t.preferredDays.join(", ") : "Any day"}</span>
          <span className={`ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
            {badge.label}
            {(t.depositStatus === "paid" || t.depositStatus === "applied") && t.depositPence ? ` · ${formatPrice(t.depositPence)}` : ""}
          </span>
        </summary>
        <dl className="mt-2 space-y-1 text-xs text-ink-muted">
          <div>DOB: {t.player?.dateOfBirth} · {t.player?.gender} · {t.player?.experience} · interest: {t.player?.interest}</div>
          {t.player?.recommendedPathway && <div>Pathway: {t.player.recommendedPathway}</div>}
          {t.player?.clubOrSchool && <div>Club/school: {t.player.clubOrSchool}</div>}
          {t.player?.playingProfile && <div>Profile: {t.player.playingProfile}</div>}
          <div>Parent: {t.parent?.name} · {t.parent?.email} · {t.parent?.mobile}</div>
          <div>Emergency: {t.player?.emergencyContactName} · {t.player?.emergencyContactPhone}</div>
          {t.player?.medicalNotes && <div className="font-semibold text-[#8c1d18]">Medical: {t.player.medicalNotes}</div>}
          <div>Photo consent: {t.player?.photoConsent ? "Yes" : "No"}</div>
          {t.player?.heardAbout && <div>Heard via: {t.player.heardAbout}</div>}
          <div>Requested {new Date(t.createdAt).toLocaleString("en-GB")}</div>
          {t.depositStatus === "paid" && <div>Refunds are issued in Stripe; the status updates automatically.</div>}
        </dl>
      </details>
      <div className="flex items-center gap-2">
        <select
          aria-label="Trial request status"
          disabled={busy}
          value={t.status}
          onChange={(e) => setStatus(e.target.value as TrialRequestStatus)}
          className="rounded-lg border border-navy-950/15 bg-white px-2 py-1.5 text-xs"
        >
          {(Object.keys(trialStatusLabel) as TrialRequestStatus[]).map((k) => (
            <option key={k} value={k}>{trialStatusLabel[k]}</option>
          ))}
        </select>
        {t.depositStatus === "paid" && (
          <button type="button" disabled={busy} onClick={markCredited} className="rounded-full border border-navy-950/20 px-3 py-2 text-xs font-semibold">
            Mark deposit credited
          </button>
        )}
        {t.parent && (
          <a
            href={`mailto:${t.parent.email}?subject=${encodeURIComponent(`${first}'s HillRisers trial`)}&body=${encodeURIComponent(body)}`}
            className="rounded-full bg-navy-950 px-4 py-2 text-xs font-semibold text-cream"
          >
            Email family
          </a>
        )}
      </div>
    </div>
  );
}

export function ManualBookingForm({ defaultSessionId }: { defaultSessionId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setBusy(true);
    setMessage("");
    const r = await adminPost({
      action: "manual",
      sessionId: fd.sessionId,
      notes: fd.notes || undefined,
      profile: {
        parentName: fd.parentName,
        email: fd.email,
        mobile: fd.mobile,
        playerName: fd.playerName,
        dateOfBirth: fd.dateOfBirth,
        gender: fd.gender,
        experience: fd.experience,
        interest: "not-sure",
        emergencyContactName: fd.emergencyContactName,
        emergencyContactPhone: fd.emergencyContactPhone,
        medicalNotes: fd.medicalNotes || undefined,
        photoConsent: fd.photoConsent === "on",
      },
    });
    setBusy(false);
    if (r.ok) {
      form.reset();
      setMessage("Booking added.");
      router.refresh();
    } else {
      setMessage(r.errors ? Object.entries(r.errors).map(([k, v]) => `${k.replace("profile.", "")}: ${v}`).join(" · ") : r.message ?? "Could not add booking");
    }
  };

  const input = "w-full rounded-lg border border-navy-950/15 px-3 py-2 text-sm";
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <select name="sessionId" defaultValue={defaultSessionId} required className={`${input} sm:col-span-2`}>
        {sessions.filter((s) => s.active).map((s) => (
          <option key={s.id} value={s.id}>{s.day} {formatTimeRange(s)} · {sessionLabel(s)}</option>
        ))}
      </select>
      <input name="playerName" placeholder="Player name" required className={input} />
      <input name="dateOfBirth" type="date" required className={input} aria-label="Date of birth" />
      <select name="gender" className={input} defaultValue="unspecified" aria-label="Gender">
        <option value="boy">Boy</option>
        <option value="girl">Girl</option>
        <option value="unspecified">Prefer not to say</option>
      </select>
      <select name="experience" className={input} defaultValue="some" aria-label="Experience">
        <option value="new">New</option>
        <option value="some">Some experience</option>
        <option value="regular">Regular</option>
        <option value="performance">Performance</option>
      </select>
      <input name="parentName" placeholder="Parent name" required className={input} />
      <input name="email" type="email" placeholder="Parent email" required className={input} />
      <input name="mobile" placeholder="Mobile" required className={input} />
      <input name="emergencyContactName" placeholder="Emergency contact" required className={input} />
      <input name="emergencyContactPhone" placeholder="Emergency phone" required className={input} />
      <input name="medicalNotes" placeholder="Medical notes (optional)" className={input} />
      <input name="notes" placeholder="Admin notes, e.g. paid cash" className={`${input} sm:col-span-2`} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="photoConsent" className="h-4 w-4" /> Photo consent given
      </label>
      <button type="submit" disabled={busy} className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream sm:col-span-2">
        {busy ? "Adding…" : "Add confirmed booking"}
      </button>
      {message && <p className="text-sm sm:col-span-2">{message}</p>}
    </form>
  );
}
