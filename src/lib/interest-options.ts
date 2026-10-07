import { holidayPeriods } from "../data/calendar";

/**
 * Options for the register-your-interest form. Shared by the form, server
 * validation, emails, admin and CSV export. Single-choice answers are stored
 * as `value`; multi-choice answers are stored as their label text.
 */
export const interestOptions = {
  heardAbout: ["John Lyon", "School", "Club", "Social media", "Friend", "Other"],
  girlsOnly: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "not-applicable", label: "Not applicable" },
  ],
  level: [
    { value: "new", label: "New to cricket" },
    { value: "plays-a-little", label: "Plays a little (school, playground, soft ball)" },
    { value: "junior-club", label: "Junior club player" },
    { value: "regular-club-or-rep", label: "Regular club or representative player (district, borough, county)" },
  ],
  mainRole: [
    { value: "batter", label: "Batter" },
    { value: "seam", label: "Seam bowler" },
    { value: "spin", label: "Spin bowler" },
    { value: "all-rounder", label: "All-rounder" },
    { value: "wicket-keeper", label: "Wicket-keeper" },
    { value: "not-sure", label: "Not sure yet" },
  ],
  wants: [
    "Enjoyment and confidence",
    "Learning the basics",
    "Improving technique",
    "Power hitting",
    "Sweeps and ramps",
    "Seam bowling",
    "Spin bowling",
    "Wicket-keeping",
    "Fielding",
    "Preparing for the club season",
    "Working towards trials or county pathway",
    "Girls-only environment",
    "Playing matches",
  ],
  formats: ["Small group (up to 6 per net)", "Group of 3", "1-to-1"],
  sessionLengths: ["1 hour", "90 minutes", "2 hours"],
  availability: ["Wednesday evening", "Thursday evening", "Saturday afternoon", "Sunday morning", "Sunday afternoon"],
  frequency: [
    { value: "once", label: "Once a week" },
    { value: "twice", label: "Twice a week" },
    { value: "not-sure", label: "Not sure" },
  ],
  /** Little Cricketers session preference (ages 4–6) */
  littleCricketersSlots: ["9:00–9:40am", "9:40–10:20am", "10:20–11:00am"],
  otherInterests: ["1-to-1 coaching", "Summer outdoor coaching"],
  paymentPreference: [
    { value: "termly", label: "Termly" },
    { value: "monthly", label: "Monthly" },
  ],
} as const;

type Single = "girlsOnly" | "level" | "mainRole" | "frequency" | "paymentPreference";

export function labelFor(field: Single, value: string) {
  const options = interestOptions[field] as readonly { value: string; label: string }[];
  return options.find((o) => o.value === value)?.label ?? value;
}

export const valuesOf = <K extends Single>(field: K) =>
  (interestOptions[field] as readonly { value: string }[]).map((o) => o.value) as [string, ...string[]];

/** Coach roles for the Coach with us form */
export const coachRoles = [
  "Lead coach",
  "Specialist coach",
  "Girls Academy lead",
  "Early-years coach (Little Cricketers)",
  "Junior helper",
];

/* ── Coach availability ─────────────────────────────────────────────────── */

/**
 * John Lyon sports hall slots for cricket (Licence to Occupy, from 2 Nov 2026):
 * Wednesday 6–9pm, Thursday 6–9pm, Saturday 2:30–5:30pm, Sunday 9am–5pm.
 * Shown only on the private coach page — never on the parent-facing site.
 */
const minutesLabel = (m: number) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { text: min ? `${hour}:${String(min).padStart(2, "0")}` : `${hour}`, suffix: h < 12 ? "am" : "pm" };
};

/** Hourly slot labels between two times, e.g. hourlySlots("14:30", "17:30") → ["2:30–3:30pm", …] */
export function hourlySlots(from: string, to: string) {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const slots: string[] = [];
  for (let m = toMin(from); m + 60 <= toMin(to); m += 60) {
    const a = minutesLabel(m);
    const b = minutesLabel(m + 60);
    slots.push(a.suffix === b.suffix ? `${a.text}–${b.text}${b.suffix}` : `${a.text}${a.suffix}–${b.text}${b.suffix}`);
  }
  return slots;
}

export const coachAvailabilityOptions = {
  /** Autumn & spring: hourly slots */
  saturdayHours: hourlySlots("14:30", "17:30"),
  sundayHours: hourlySlots("09:00", "17:00"),
  /** Autumn & spring: one 3-hour evening block */
  weekdayBlocks: ["Wednesday 6–9pm (3-hour block)", "Thursday 6–9pm (3-hour block)"],
};

export type CoachAvailability = {
  saturday: string[];
  sunday: string[];
  weekdayBlocks: string[];
  notes?: string;
  /** Summer timetable is TBC — coaches can note any summer commitments */
  summerNotes?: string;
};

/** One-line summary for emails, admin and CSV */
export function summariseCoachAvailability(a: CoachAvailability) {
  const parts = [
    a.saturday.length && `Sat ${a.saturday.join(", ")}`,
    a.sunday.length && `Sun ${a.sunday.join(", ")}`,
    ...a.weekdayBlocks,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

/* ── Holiday wishes ─────────────────────────────────────────────────────── */

/** e.g. "Spring half term: Part-day camp, Full-day camp; Easter holidays: Normal weekly sessions" */
export function summariseHolidays(holidays: Record<string, string[]> | undefined) {
  return holidayPeriods
    .filter((p) => holidays?.[p.id]?.length)
    .map((p) => `${p.label}: ${holidays![p.id].join(", ")}`)
    .join("; ");
}
