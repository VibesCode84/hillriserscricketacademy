"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Admin: record that a bank transfer for an invoice has arrived */
export function MarkPaid({ bookingId, stage, label }: { bookingId: string; stage: "initial" | "balance"; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mark = async () => {
    if (!window.confirm(`Mark ${label} as paid by bank transfer? The partner will get a confirmation email.`)) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/partners/mark-paid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, stage }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) setError(json.message ?? "Something went wrong.");
    else router.refresh();
  };
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" disabled={busy} onClick={mark} className="rounded-full bg-[#1d6b3a] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        {busy ? "Saving…" : "Mark as paid"}
      </button>
      {error && <span className="max-w-xs text-right text-xs text-[#8c1d18]" role="alert">{error}</span>}
    </span>
  );
}
