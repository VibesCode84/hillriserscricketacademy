import { terms } from "./term";

/**
 * Specialist holiday camps. Details (times, ages, price, focus) are to follow —
 * until a camp has `bookable: true` the site takes interest registrations only.
 */
export type Camp = {
  id: string;
  name: string;
  /** First and last day of the camp (YYYY-MM-DD) */
  from: string;
  to: string;
  bookable: boolean;
};

const springHalfTerm = terms.find((t) => t.id === "spring-2027")!.noSessions.find((n) => n.label === "Half term")!;

export const camps: Camp[] = [
  {
    id: "spring-half-term-2027",
    name: "Spring Half Term Camp",
    from: springHalfTerm.from, // Mon 15 Feb 2027
    to: springHalfTerm.to, // Fri 19 Feb 2027
    bookable: false,
  },
];

/** Option for families who want to hear about any future camp */
export const FUTURE_CAMPS = "future";

export function getCamp(id: string) {
  return camps.find((c) => c.id === id);
}
