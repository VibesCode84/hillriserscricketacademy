import type { DisciplineKey } from "./academies";

export type Day = "Wednesday" | "Saturday" | "Sunday";
export const DAYS: Day[] = ["Wednesday", "Saturday", "Sunday"];

/**
 * The weekly timetable. This is the single place to edit the session mix.
 *
 * Which academy runs in which slot has NOT been decided yet, so slots carry
 * only a day and (where agreed) a time. To open a slot for online booking:
 *   1. set `discipline` (and optionally `group`, `ageMin`, `ageMax`, `title`)
 *   2. make sure `startTime`/`endTime` are set and `confirmed: true`
 * Until then the site shows "programme to be confirmed" and parents send a
 * trial request with their preferred days instead of paying.
 *
 * - `confirmed` means the slot's day and time are agreed.
 * - `capacity` and `pricePence` are enforced by the booking engine. Specialist
 *   sessions are 90 minutes at £25; a Little Cricketers slot should be
 *   60 minutes (e.g. 09:00–10:00) at pricePence 1500, matching academies.ts.
 * - Availability ("Places available", "Limited places", "Waiting list") is never
 *   set here — it is calculated from real bookings.
 */
export type AcademySession = {
  id: string;
  title: string;
  /** Which academy runs in this slot — leave unset until decided */
  discipline?: DisciplineKey;
  /** e.g. "Younger Juniors" */
  group?: string;
  day: Day;
  /** Short note about the venue block, e.g. "John Lyon weekday academy block" */
  block: string;
  startTime?: string; // "18:00"
  endTime?: string; // "19:30"
  ageMin?: number;
  ageMax?: number;
  capacity: number;
  pricePence: number;
  stripePriceId?: string;
  active: boolean;
  confirmed: boolean;
  /** Girls-only session */
  girlsOnly?: boolean;
};

const standard = { capacity: 18, pricePence: 2500, active: true, title: "Academy session" } as const;
const weekday = "John Lyon weekday academy block";

export const sessions: AcademySession[] = [
  // ── Wednesday — John Lyon weekday academy block ──────────────────────────
  { id: "wed-1800", day: "Wednesday", block: weekday, startTime: "18:00", endTime: "19:30", confirmed: true, ...standard },
  { id: "wed-1930", day: "Wednesday", block: weekday, startTime: "19:30", endTime: "21:00", confirmed: true, ...standard },
  // ── Weekend — agreed John Lyon blocks, times to be confirmed ─────────────
  { id: "sat-block", day: "Saturday", block: "John Lyon weekend block", confirmed: false, ...standard },
  { id: "sun-block", day: "Sunday", block: "John Lyon Sunday block", confirmed: false, ...standard },
];

export function getSession(id: string) {
  return sessions.find((s) => s.id === id);
}

/** A slot can take online bookings once its academy, day and time are all set. */
export function isBookable(s: AcademySession) {
  return s.active && s.confirmed && !!s.discipline && !!s.startTime && !!s.endTime;
}

/** Bookable slots for an academy (empty while the programme is being finalised). */
export function sessionsFor(discipline: DisciplineKey) {
  return sessions.filter((s) => isBookable(s) && s.discipline === discipline);
}

export function sessionLabel(s: AcademySession) {
  return s.group ? `${s.title} — ${s.group}` : s.title;
}

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

export function formatTimeRange(s: Pick<AcademySession, "startTime" | "endTime">) {
  if (!s.startTime || !s.endTime) return "Times to be confirmed";
  const start = formatTime(s.startTime);
  const end = formatTime(s.endTime);
  // "6–7:30pm" style when both share a suffix
  const sameSuffix = start.slice(-2) === end.slice(-2);
  return sameSuffix ? `${start.slice(0, -2)}–${end}` : `${start}–${end}`;
}

export function durationMinutes(s: Pick<AcademySession, "startTime" | "endTime">) {
  if (!s.startTime || !s.endTime) return 90;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return toMin(s.endTime) - toMin(s.startTime);
}
