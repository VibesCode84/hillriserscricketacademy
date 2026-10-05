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
  availability: ["Weekday evenings", "Saturday", "Sunday morning", "Sunday afternoon"],
  frequency: [
    { value: "once", label: "Once a week" },
    { value: "twice", label: "Twice a week" },
    { value: "not-sure", label: "Not sure" },
  ],
  otherInterests: ["Holiday camps", "1-to-1 coaching", "Summer outdoor coaching"],
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

const hourLabel = (h: number) => {
  const fmt = (x: number) => (x % 12 === 0 ? 12 : x % 12);
  const suffix = (x: number) => (x < 12 ? "am" : "pm");
  return suffix(h) === suffix(h + 1) ? `${fmt(h)}–${fmt(h + 1)}${suffix(h + 1)}` : `${fmt(h)}${suffix(h)}–${fmt(h + 1)}${suffix(h + 1)}`;
};

/** First and last start hour for weekend hourly slots (8am–6pm). Adjust to the hall's hours. */
const WEEKEND_FIRST_HOUR = 8;
const WEEKEND_LAST_HOUR = 17;

export const coachAvailabilityOptions = {
  /** Autumn & spring: hourly slots on Saturdays and Sundays */
  weekendHours: Array.from({ length: WEEKEND_LAST_HOUR - WEEKEND_FIRST_HOUR + 1 }, (_, i) => hourLabel(WEEKEND_FIRST_HOUR + i)),
  /** Autumn & spring: one 3-hour evening block on Wednesdays and Thursdays */
  weekdayBlocks: ["Wednesday evening (3-hour block)", "Thursday evening (3-hour block)"],
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
