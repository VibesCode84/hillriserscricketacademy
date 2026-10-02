import type { DisciplineKey } from "./academies";

export type Day = "Tuesday" | "Wednesday" | "Saturday" | "Sunday";
export const DAYS: Day[] = ["Tuesday", "Wednesday", "Saturday", "Sunday"];

/**
 * The weekly timetable. This is the single place to edit the session mix.
 *
 * - `confirmed: false` marks a session whose time or label has not been agreed
 *   yet (the Saturday and Sunday John Lyon blocks). It is shown on the site as
 *   "being finalised" and takes interest registrations instead of payments.
 * - `capacity` and `pricePence` are enforced by the booking engine.
 * - Availability ("Places available", "Limited places", "Waiting list") is never
 *   set here — it is calculated from real bookings.
 */
export type AcademySession = {
  id: string;
  title: string;
  discipline: DisciplineKey;
  /** e.g. "Younger Juniors" */
  group: string;
  day: Day;
  startTime: string; // "18:00"
  endTime: string; // "19:30"
  ageMin: number;
  ageMax: number;
  capacity: number;
  pricePence: number;
  stripePriceId?: string;
  active: boolean;
  confirmed: boolean;
  /** Girls-only session */
  girlsOnly?: boolean;
};

const standard = { capacity: 18, pricePence: 2500, active: true } as const;

export const sessions: AcademySession[] = [
  // ── Tuesday — John Lyon weekday academy block ────────────────────────────
  {
    id: "tue-1800-batting",
    title: "Batting Academy",
    discipline: "batting",
    group: "Younger Juniors",
    day: "Tuesday",
    startTime: "18:00",
    endTime: "19:30",
    ageMin: 8,
    ageMax: 11,
    confirmed: true,
    ...standard,
  },
  {
    id: "tue-1930-batting",
    title: "Batting Academy",
    discipline: "batting",
    group: "Older Juniors",
    day: "Tuesday",
    startTime: "19:30",
    endTime: "21:00",
    ageMin: 11,
    ageMax: 14,
    confirmed: true,
    ...standard,
  },
  // ── Wednesday — John Lyon weekday academy block ──────────────────────────
  {
    id: "wed-1800-seam",
    title: "Seam Bowling Academy",
    discipline: "seam-bowling",
    group: "All juniors",
    day: "Wednesday",
    startTime: "18:00",
    endTime: "19:30",
    ageMin: 8,
    ageMax: 14,
    confirmed: true,
    ...standard,
  },
  {
    id: "wed-1930-spin",
    title: "Spin Bowling Academy",
    discipline: "spin-bowling",
    group: "All juniors",
    day: "Wednesday",
    startTime: "19:30",
    endTime: "21:00",
    ageMin: 8,
    ageMax: 14,
    confirmed: true,
    ...standard,
  },
  // ── Saturday — agreed John Lyon weekend block (times TBC) ────────────────
  {
    id: "sat-a-power",
    title: "Power & Range Hitting",
    discipline: "power",
    group: "Older Juniors",
    day: "Saturday",
    startTime: "09:00",
    endTime: "10:30",
    ageMin: 10,
    ageMax: 14,
    confirmed: false,
    ...standard,
  },
  {
    id: "sat-b-performance",
    title: "Game Skills & Performance",
    discipline: "performance",
    group: "Older Juniors",
    day: "Saturday",
    startTime: "10:30",
    endTime: "12:00",
    ageMin: 10,
    ageMax: 14,
    confirmed: false,
    ...standard,
  },
  // ── Sunday — agreed John Lyon Sunday block (times TBC) ───────────────────
  {
    id: "sun-a-little",
    title: "Little Cricketers",
    discipline: "little-cricketers",
    group: "Foundation",
    day: "Sunday",
    startTime: "09:00",
    endTime: "10:00",
    ageMin: 4,
    ageMax: 7,
    confirmed: false,
    ...standard,
  },
  {
    id: "sun-b-girls",
    title: "Girls Academy",
    discipline: "girls",
    group: "All girls",
    day: "Sunday",
    startTime: "10:00",
    endTime: "11:30",
    ageMin: 7,
    ageMax: 14,
    girlsOnly: true,
    confirmed: false,
    ...standard,
  },
  {
    id: "sun-c-performance",
    title: "Specialist & Performance",
    discipline: "performance",
    group: "Mixed",
    day: "Sunday",
    startTime: "11:30",
    endTime: "13:00",
    ageMin: 9,
    ageMax: 14,
    confirmed: false,
    ...standard,
  },
];

export function getSession(id: string) {
  return sessions.find((s) => s.id === id);
}

export function sessionsFor(discipline: DisciplineKey) {
  return sessions.filter((s) => s.active && s.discipline === discipline);
}

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

export function formatTimeRange(s: Pick<AcademySession, "startTime" | "endTime">) {
  const start = formatTime(s.startTime);
  const end = formatTime(s.endTime);
  // "6–7:30pm" style when both share a suffix
  const sameSuffix = start.slice(-2) === end.slice(-2);
  return sameSuffix ? `${start.slice(0, -2)}–${end}` : `${start}–${end}`;
}

export function durationMinutes(s: Pick<AcademySession, "startTime" | "endTime">) {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return toMin(s.endTime) - toMin(s.startTime);
}
