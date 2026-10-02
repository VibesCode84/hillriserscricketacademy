"use client";

import { useState } from "react";

export function DevCheckoutButtons({ bookingId, trialRequestId }: { bookingId?: string; trialRequestId?: string }) {
  const [busy, setBusy] = useState(false);
  const act = async (outcome: "paid" | "cancel") => {
    setBusy(true);
    const res = await fetch("/api/dev/complete-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, trialRequestId, outcome }),
    });
    const json = await res.json();
    window.location.assign(json.redirect ?? "/");
  };
  return (
    <div className="mt-6 space-y-3">
      <button type="button" disabled={busy} onClick={() => act("paid")} className="w-full rounded-lg bg-[#635bff] py-3 font-semibold text-white disabled:opacity-60">
        Simulate successful payment
      </button>
      <button type="button" disabled={busy} onClick={() => act("cancel")} className="w-full rounded-lg border border-[#e3e8ee] py-3 font-semibold text-[#1a1f36]">
        Cancel and go back
      </button>
    </div>
  );
}
