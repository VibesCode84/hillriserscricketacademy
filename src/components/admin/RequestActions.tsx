"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Admin: approve a booking request (emails the invoice) or decline it (releases the nets) */
export function RequestActions({ bookingId, label }: { bookingId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "approve" | "decline">("");
  const [error, setError] = useState("");
  const act = async (action: "approve" | "decline") => {
    const ask = action === "approve" ? `Approve ${label}? The invoice will be emailed now, payable within 24 hours.` : `Decline ${label}? The nets will be released and the partner told.`;
    if (!window.confirm(ask)) return;
    setBusy(action);
    setError("");
    const res = await fetch("/api/admin/partners/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, action }) });
    const json = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok || !json.ok) setError(json.message ?? "Something went wrong.");
    else router.refresh();
  };
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex gap-2">
        <button type="button" disabled={!!busy} onClick={() => act("approve")} className="rounded-full bg-[#1d6b3a] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {busy === "approve" ? "Sending…" : "Approve & send invoice"}
        </button>
        <button type="button" disabled={!!busy} onClick={() => act("decline")} className="rounded-full border border-[#8c1d18]/40 px-4 py-1.5 text-xs font-semibold text-[#8c1d18] disabled:opacity-50">
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
      </span>
      {error && <span className="max-w-xs text-right text-xs text-[#8c1d18]" role="alert">{error}</span>}
    </span>
  );
}

/** Admin: mark a partner enquiry as dealt with */
export function EnquiryHandled({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    await fetch("/api/admin/partners/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, handled: !handled }) });
    setBusy(false);
    router.refresh();
  };
  return (
    <button type="button" disabled={busy} onClick={toggle} className="rounded-full border border-navy-950/20 px-3 py-1 text-xs font-semibold disabled:opacity-50">
      {handled ? "Reopen" : "Mark dealt with"}
    </button>
  );
}
