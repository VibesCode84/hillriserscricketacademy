"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Code = { code: string; name: string; holdLabel?: string; createdAt: string; redeemedBy?: string; redeemedAt?: string };

/** Admin: create priority codes for invited partners, and see which have been used */
export function PriorityCodes({ codes, holds, ends }: { codes: Code[]; holds: { id: string; label: string }[]; ends: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [holdId, setHoldId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/partners/priority-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, holdId }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) return setError(json.errors?.name ?? json.message ?? "Something went wrong.");
    setName("");
    setHoldId("");
    router.refresh();
  };
  const remove = async (code: string) => {
    if (!window.confirm(`Delete ${code}? It hasn't been used.`)) return;
    const res = await fetch("/api/admin/partners/priority-codes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) window.alert(json.message ?? "Something went wrong.");
    router.refresh();
  };
  const copy = async (code: string) => {
    await navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(code);
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl">Priority codes</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Partners with a code can book before {ends}, when booking opens to everyone. A code linked to held nets also lets that partner book them. Each code works for one account.
      </p>
      <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-navy-950/10 bg-white p-4">
        <div>
          <label htmlFor="pc-name" className="label">Partner</label>
          <input id="pc-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className="field" placeholder="e.g. Sanjiv" />
        </div>
        <div>
          <label htmlFor="pc-hold" className="label">Can book held nets</label>
          <select id="pc-hold" value={holdId} onChange={(e) => setHoldId(e.target.value)} className="field">
            <option value="">None</option>
            {holds.map((h) => <option key={h.id} value={h.id}>Held for {h.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={busy} className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50">
          {busy ? "Creating…" : "Create code"}
        </button>
        {error && <p className="w-full text-sm text-[#8c1d18]" role="alert">{error}</p>}
      </form>
      {codes.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-950/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-950/10 text-xs uppercase tracking-wider text-ink-muted">
              <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">For</th><th className="px-4 py-3">Held nets</th><th className="px-4 py-3">Used by</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {codes.map((c) => (
                <tr key={c.code}>
                  <td className="px-4 py-3 font-mono font-semibold">
                    {c.code}{" "}
                    <button type="button" onClick={() => copy(c.code)} className="ml-2 text-xs font-sans font-normal underline">{copied === c.code ? "Copied" : "Copy"}</button>
                  </td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.holdLabel ?? "—"}</td>
                  <td className="px-4 py-3">{c.redeemedBy ?? <span className="text-ink-muted">Not used yet</span>}</td>
                  <td className="px-4 py-3 text-right">
                    {!c.redeemedBy && <button type="button" onClick={() => remove(c.code)} className="text-xs font-semibold text-[#8c1d18] underline">Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
