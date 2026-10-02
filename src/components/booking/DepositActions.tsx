"use client";

import { useState } from "react";
import { buttonClass } from "../Button";

export function DepositActions({ requestId, amountLabel }: { requestId: string; amountLabel: string }) {
  const [busy, setBusy] = useState<"pay" | "skip" | null>(null);
  const [error, setError] = useState("");
  const [skipped, setSkipped] = useState(false);

  const act = async (action: "pay" | "skip") => {
    setBusy(action);
    setError("");
    try {
      const res = await fetch("/api/trial-request/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const json = await res.json();
      if (action === "pay" && res.ok && json.url) {
        window.location.assign(json.url);
        return;
      }
      if (action === "skip" && res.ok) {
        setSkipped(true);
      } else if (json.reason === "already_paid") {
        window.location.reload();
        return;
      } else {
        setError(json.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("We couldn't connect. Please check your connection and try again.");
    }
    setBusy(null);
  };

  if (skipped) {
    return (
      <p role="status" className="rounded-2xl bg-white p-6 text-lg text-navy-950">
        Thank you — your trial request is saved without a deposit. A coach will be in touch to confirm a day and time.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <button type="button" onClick={() => act("pay")} disabled={!!busy} className={buttonClass("dark")}>
        {busy === "pay" ? "Opening secure payment…" : `Secure the place — ${amountLabel} refundable deposit`}
      </button>
      <button type="button" onClick={() => act("skip")} disabled={!!busy} className="text-sm font-semibold text-navy-950 underline underline-offset-4">
        {busy === "skip" ? "Saving…" : "Continue without a deposit"}
      </button>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
}
