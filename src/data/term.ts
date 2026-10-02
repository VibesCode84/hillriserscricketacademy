import type { Day } from "./sessions";

/**
 * Academy terms, following the John Lyon School calendar
 * (https://www.johnlyon.org/information/term-dates/). Edit here each year.
 *
 * - Sessions run from `startsOn` to `endsOn` inclusive, on each slot's weekday.
 * - `noSessions` ranges (half terms, closures) are skipped. Half terms are the
 *   school's Monday–Friday dates; extend a range to cover the weekends either
 *   side if weekend sessions should also stop.
 * - Fees are paid termly and due `paymentDueDaysBefore` days before `startsOn`.
 * - The term fee is the number of sessions in the term × the session fee
 *   (£25, or £15 for Little Cricketers).
 */
export type AcademyTerm = {
  id: string;
  name: string;
  /** First date sessions can run (YYYY-MM-DD) */
  startsOn: string;
  /** Last date sessions can run (YYYY-MM-DD) */
  endsOn: string;
  noSessions: { from: string; to: string; label: string }[];
  /** How the start is described to families */
  startLabel?: string;
};

export const PAYMENT_DUE_DAYS_BEFORE = 7;

export const terms: AcademyTerm[] = [
  {
    id: "autumn-2026",
    name: "Autumn term 2026",
    // Academy launch: sessions start w/c 1 November (school term: Thu 3 Sep – Fri 11 Dec,
    // half term Mon 19 – Fri 30 Oct)
    startsOn: "2026-11-01",
    endsOn: "2026-12-11",
    noSessions: [],
    startLabel: "week commencing 1 November",
  },
  {
    id: "spring-2027",
    name: "Spring term 2027",
    startsOn: "2027-01-07",
    endsOn: "2027-03-25",
    noSessions: [{ from: "2027-02-15", to: "2027-02-19", label: "Half term" }],
  },
  {
    id: "summer-2027",
    name: "Summer term 2027",
    startsOn: "2027-04-16",
    endsOn: "2027-07-09",
    noSessions: [{ from: "2027-05-31", to: "2027-06-04", label: "Half term" }],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY: Record<Day, number> = { Sunday: 0, Tuesday: 2, Wednesday: 3, Saturday: 6 };

const parse = (date: string) => new Date(`${date}T12:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** YYYY-MM-DD of the termly payment deadline */
export function paymentDueDate(t: AcademyTerm) {
  return iso(new Date(parse(t.startsOn).getTime() - PAYMENT_DUE_DAYS_BEFORE * DAY_MS));
}

/** "1 November", or with options "Sunday 25 October 2026" */
export function formatTermDate(date: string, opts: { weekday?: boolean; year?: boolean } = {}) {
  return parse(date).toLocaleDateString("en-GB", {
    weekday: opts.weekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: opts.year ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

/** Every date in the term that a slot on `day` would run. */
export function sessionDates(t: AcademyTerm, day: Day) {
  const dates: string[] = [];
  const end = parse(t.endsOn).getTime();
  for (let d = parse(t.startsOn); d.getTime() <= end; d = new Date(d.getTime() + DAY_MS)) {
    if (d.getUTCDay() !== WEEKDAY[day]) continue;
    const s = iso(d);
    if (t.noSessions.some((n) => s >= n.from && s <= n.to)) continue;
    dates.push(s);
  }
  return dates;
}

/** Term fee for a weekly slot on `day` at `pricePence` per session. */
export function termFee(t: AcademyTerm, day: Day, pricePence: number) {
  return sessionDates(t, day).length * pricePence;
}

export function termStartLabel(t: AcademyTerm) {
  return t.startLabel ?? formatTermDate(t.startsOn, { weekday: true });
}

/**
 * The term families should be thinking about now: the next term whose fees
 * aren't yet overdue, otherwise the term in progress.
 */
export function upcomingTerm(now = new Date()) {
  const today = iso(now);
  return (
    terms.find((t) => paymentDueDate(t) >= today) ??
    terms.find((t) => t.endsOn >= today) ??
    terms[terms.length - 1]
  );
}
