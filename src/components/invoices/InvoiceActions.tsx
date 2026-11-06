"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Action = "send" | "paid" | "unpaid" | "void" | "remind";

/** Admin: what can be done with a sent invoice */
export function InvoiceActions({ id, status, link, today }: { id: string; status: "draft" | "sent" | "paid" | "void"; link?: string; today: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | "">("");
  const [error, setError] = useState("");
  const [paidOn, setPaidOn] = useState(today);
  const [copied, setCopied] = useState(false);
  const go = async (action: Action, ask?: string) => {
    if (ask && !window.confirm(ask)) return;
    setBusy(action);
    setError("");
    const res = await fetch("/api/admin/invoices/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, paidOn: action === "paid" ? paidOn : undefined }) });
    const json = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok || !json.ok) setError(json.message ?? "Something went wrong.");
    if (action === "void" && status === "draft" && res.ok) router.push("/admin/invoices");
    router.refresh();
  };
  const btn = "rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50";
  return (
    <div className="space-y-3 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        {status === "sent" && (
          <>
            <span className="inline-flex items-center gap-2">
              <input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} aria-label="Date paid" className="rounded-lg border border-navy-950/20 px-2 py-1.5 text-sm" />
              <button type="button" disabled={!!busy} onClick={() => go("paid")} className={`${btn} bg-[#1d6b3a] text-white`}>{busy === "paid" ? "Saving…" : "Mark as paid"}</button>
            </span>
            <button type="button" disabled={!!busy} onClick={() => go("remind", "Email the customer a reminder?")} className={`${btn} border border-navy-950/20`}>{busy === "remind" ? "Sending…" : "Send reminder"}</button>
            <button type="button" disabled={!!busy} onClick={() => go("void", "Void this invoice? It stays in the records as void.")} className={`${btn} border border-[#8c1d18]/40 text-[#8c1d18]`}>Void</button>
          </>
        )}
        {status === "paid" && (
          <button type="button" disabled={!!busy} onClick={() => go("unpaid", "Mark this invoice as unpaid again?")} className={`${btn} border border-navy-950/20`}>Mark as unpaid</button>
        )}
        {status === "draft" && (
          <button type="button" disabled={!!busy} onClick={() => go("void", "Delete this draft?")} className={`${btn} border border-[#8c1d18]/40 text-[#8c1d18]`}>Delete draft</button>
        )}
        {link && status !== "draft" && (
          <button type="button" onClick={async () => { await navigator.clipboard?.writeText(link).catch(() => undefined); setCopied(true); }} className="text-sm font-semibold underline underline-offset-4">
            {copied ? "Link copied" : "Copy customer link"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-[#8c1d18]" role="alert">{error}</p>}
    </div>
  );
}
