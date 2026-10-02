import type { Day } from "./sessions";

/**
 * Academy terms, following the John Lyon School calendar
 * (https://www.johnlyon.org/information/term-dates/). Edit here each year.
 *
 * - Sessions run from `startsOn` to `endsOn` inclusive, on each slot's weekday.
 * - `noSessions` ranges (half terms, closures) are skipped. Half terms cover the
 *   whole week including the weekends either side — no academy sessions run;
 *   half terms are for holiday camps (src/data/camps.ts).
 * - Fees are paid termly and are due at least PAYMENT_DUE_DAYS_BEFORE days
 *   before `startsOn`, or on `paymentDueOn` where a more convenient earlier
 *   date is set (e.g. before Christmas).
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
  /** Explicit fee deadline (YYYY-MM-DD); must be at least PAYMENT_DUE_DAYS_BEFORE days before startsOn */
  paymentDueOn?: string;
};

/** Minimum notice: term fees are due at least this many days before sessions start */
export const PAYMENT_DUE_DAYS_BEFORE = 10;

export const terms: AcademyTerm[] = [
  {
    id: "autumn-2026",
    name: "Autumn term 2026",
    // Academy launch: first session Sunday 1 November (school term: Thu 3 Sep – Fri 11 Dec,
    // half term Mon 19 – Fri 30 Oct)
    startsOn: "2026-11-01",
    endsOn: "2026-12-11",
    noSessions: [],
  },
  {
    id: "spring-2027",
    name: "Spring term 2027",
    startsOn: "2027-01-07",
    endsOn: "2027-03-25",
    // School half term Mon 15 – Fri 19 Feb, plus the weekends either side
    noSessions: [{ from: "2027-02-13", to: "2027-02-21", label: "Half term" }],
    // Due before the Christmas break (the last day of the autumn term)
    paymentDueOn: "2026-12-11",
  },
  {
    id: "summer-2027",
    name: "Summer term 2027",
    startsOn: "2027-04-16",
    endsOn: "2027-07-09",
    // School half term Mon 31 May – Fri 4 Jun, plus the weekends either side
    noSessions: [{ from: "2027-05-29", to: "2027-06-06", label: "Half term" }],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY: Record<Day, number> = { Sunday: 0, Wednesday: 3, Saturday: 6 };

const parse = (date: string) => new Date(`${date}T12:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** YYYY-MM-DD of the termly payment deadline */
export function paymentDueDate(t: AcademyTerm) {
  const latest = iso(new Date(parse(t.startsOn).getTime() - PAYMENT_DUE_DAYS_BEFORE * DAY_MS));
  // Never later than the minimum notice, even if paymentDueOn is mistyped
  return t.paymentDueOn && t.paymentDueOn < latest ? t.paymentDueOn : latest;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * "1 November", or with options "Sunday 25 October 2026". Formatted by hand
 * (not Intl) so server and browser output match exactly.
 */
export function formatTermDate(date: string, opts: { weekday?: boolean; year?: boolean } = {}) {
  const d = parse(date);
  const parts = [`${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`];
  if (opts.weekday) parts.unshift(WEEKDAYS[d.getUTCDay()]);
  if (opts.year) parts.push(String(d.getUTCFullYear()));
  return parts.join(" ");
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

/** e.g. "Sunday 1 November" */
export function termStartLabel(t: AcademyTerm) {
  return formatTermDate(t.startsOn, { weekday: true });
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
