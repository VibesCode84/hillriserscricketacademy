"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DocumentReview as Review } from "@/lib/partners/store";

/** Approve / reject buttons for one partner document */
export function DocumentReview({ id, review }: { id: string; review: Review }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const set = async (next: Review) => {
    const note = next === "rejected" ? (window.prompt("Reason (shown to the partner):") ?? undefined) : undefined;
    setBusy(true);
    await fetch(`/api/admin/partners/documents/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review: next, note }),
    });
    setBusy(false);
    router.refresh();
  };
  const btn = "rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50";
  return (
    <span className="inline-flex gap-2">
      {review !== "approved" && (
        <button type="button" disabled={busy} onClick={() => set("approved")} className={`${btn} border-[#1d6b3a] text-[#1d6b3a]`}>
          Approve
        </button>
      )}
      {review !== "rejected" && (
        <button type="button" disabled={busy} onClick={() => set("rejected")} className={`${btn} border-[#8c1d18] text-[#8c1d18]`}>
          Reject
        </button>
      )}
    </span>
  );
}
