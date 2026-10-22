"use client";

import { buttonClass } from "../Button";

export function DevPartnerCheckoutButtons({ bookingId }: { bookingId: string }) {
  const go = async (outcome: "paid" | "cancel") => {
    const res = await fetch("/api/partners/dev-complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, outcome }) });
    const json = await res.json();
    window.location.href = json.redirect;
  };
  return (
    <div className="mt-8 flex gap-3">
      <button type="button" onClick={() => go("paid")} className={buttonClass("dark")}>Simulate successful payment</button>
      <button type="button" onClick={() => go("cancel")} className="rounded-full border border-navy-950/20 px-6 py-3 font-semibold">Cancel</button>
    </div>
  );
}
