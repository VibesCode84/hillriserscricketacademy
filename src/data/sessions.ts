import { groupSizes, type ProgrammeKey } from "./programmes";

export type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export const DAYS: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Bookable sessions, used by the booking engine (capacity, Stripe checkout).
 *
 * The public site shows NO fixed times except Early Risers on Sundays
 * (three 40-minute sessions, 9:00–11:00am) — the timetable will be built from parent feedback. Add sessions
 * here when the timetable is published, then open trial booking.
 *
 * - `confirmed` means the slot's day and time are agreed.
 * - `capacity` and `pricePence` are enforced by the booking engine.
 * - Availability is never set here — it is calculated from real bookings.
 */
export type AcademySession = {
  id: string;
  title: string;
  /** Which programme runs in this slot */
  discipline?: ProgrammeKey;
  /** e.g. "Younger Juniors" */
  group?: string;
  day: Day;
  /** Short note about the venue block */
  block: string;
  startTime?: string; // "09:00"
  endTime?: string; // "09:40"
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

const earlyRisers = (startTime: string, endTime: string): AcademySession => ({
  id: `sun-${startTime.replace(":", "")}-early-risers`,
  title: "Early Risers",
  discipline: "early-risers",
  day: "Sunday",
  block: "John Lyon School sports hall",
  startTime,
  endTime,
  ageMin: 4,
  ageMax: 6,
  capacity: groupSizes.earlyRisers,
  pricePence: 1500,
  active: true,
  confirmed: true,
});

export const sessions: AcademySession[] = [
  earlyRisers("09:00", "09:40"),
  earlyRisers("09:40", "10:20"),
  earlyRisers("10:20", "11:00"),
];

export function getSession(id: string) {
  return sessions.find((s) => s.id === id);
}

/** A slot can take online bookings once its programme, day and time are all set. */
export function isBookable(s: AcademySession) {
  return s.active && s.confirmed && !!s.discipline && !!s.startTime && !!s.endTime;
}

/** Bookable slots for a programme. */
export function sessionsFor(discipline: ProgrammeKey) {
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
