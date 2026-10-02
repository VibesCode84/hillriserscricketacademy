"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Re-checks the server until the webhook has confirmed payment. */
export function AutoRefresh({ intervalMs = 2500, maxTries = 12 }: { intervalMs?: number; maxTries?: number }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= maxTries) return;
    const t = setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, intervalMs);
    return () => clearTimeout(t);
  }, [tries, maxTries, intervalMs, router]);
  return tries >= maxTries ? (
    <p className="mt-4 text-sm text-ink-muted">
      This is taking longer than usual. Your payment is safe — we&rsquo;ll email your confirmation as soon as it comes through.
    </p>
  ) : null;
}
