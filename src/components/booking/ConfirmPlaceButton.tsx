"use client";

import { useState } from "react";
import { buttonClass } from "../Button";

export function ConfirmPlaceButton({ bookingId, label }: { bookingId: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onClick = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.assign(json.url);
        return;
      }
      if (json.reason === "expired" || json.reason === "already_confirmed") {
        window.location.reload();
        return;
      }
      setError(json.message ?? "We couldn't start the payment. Please try again.");
    } catch {
      setError("We couldn't connect. Please check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <div>
      <button type="button" onClick={onClick} disabled={busy} className={buttonClass("primary", "w-full sm:w-auto")}>
        {busy ? "Opening secure payment…" : label}
      </button>
      {error && <p className="error-text mt-3" role="alert">{error}</p>}
    </div>
  );
}
