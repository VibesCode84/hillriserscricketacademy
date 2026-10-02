import path from "node:path";
import { sessions, type AcademySession } from "../../data/sessions";
import { FileBookingStore } from "./file-store";
import { PgBookingStore } from "./pg-store";
import type { BookingStore, SessionCounts } from "./types";

export * from "./types";

/** Minutes a place is held while a parent completes payment. */
export const HOLD_MINUTES = 10;
/** Stripe requires Checkout Sessions to last at least 30 minutes; we expire the hold sooner ourselves. */
export const STRIPE_CHECKOUT_MINUTES = 30;

const globalForStore = globalThis as unknown as { __hillrisersStore?: BookingStore };

export function getStore(): BookingStore {
  if (!globalForStore.__hillrisersStore) {
    const url = process.env.DATABASE_URL;
    if (url) {
      globalForStore.__hillrisersStore = new PgBookingStore(url);
    } else {
      if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
        console.warn("[hillrisers] DATABASE_URL is not set — bookings are stored in /tmp and will not persist.");
      }
      const dir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
      globalForStore.__hillrisersStore = new FileBookingStore(
        process.env.BOOKING_STORE_FILE ?? path.join(dir, "store.json"),
      );
    }
  }
  return globalForStore.__hillrisersStore;
}

export type Availability = "available" | "limited" | "full";

export type SessionAvailability = {
  sessionId: string;
  capacity: number;
  taken: number;
  remaining: number;
  status: Availability;
  waitlist: number;
};

/** Number of remaining places at or below which we show "Limited places". */
export const LIMITED_THRESHOLD = 4;

export function availabilityFor(session: AcademySession, counts?: SessionCounts): SessionAvailability {
  const taken = (counts?.confirmed ?? 0) + (counts?.held ?? 0);
  const remaining = Math.max(0, session.capacity - taken);
  const status: Availability = remaining === 0 ? "full" : remaining <= LIMITED_THRESHOLD ? "limited" : "available";
  return { sessionId: session.id, capacity: session.capacity, taken, remaining, status, waitlist: counts?.waitlist ?? 0 };
}

/** Availability for every session, from real booking data. Never throws — falls back to "unknown". */
export async function getAvailability(): Promise<Record<string, SessionAvailability> | null> {
  try {
    const counts = await getStore().sessionCounts();
    return Object.fromEntries(sessions.map((s) => [s.id, availabilityFor(s, counts[s.id])]));
  } catch (err) {
    console.error("[hillrisers] availability unavailable", err);
    return null;
  }
}
