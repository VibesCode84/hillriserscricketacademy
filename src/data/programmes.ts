/**
 * Programmes for ages 4–15. The public site shows no prices while HillRisers
 * is taking registrations of interest; session lengths and times will be set
 * from parent feedback.
 */
export type ProgrammeKey =
  | "early-risers"
  | "development"
  | "girls-development"
  | "performance"
  | "girls-performance"
  | "small-group"
  | "one-to-one";

export type Programme = {
  key: ProgrammeKey;
  name: string;
  ages: string;
  /** Lower/upper age, for filtering; undefined = all ages */
  ageMin?: number;
  ageMax?: number;
  summary: string;
  girlsOnly?: boolean;
  /** Planned timing note, shown under the summary */
  fixedTime?: string;
  href?: string;
};

/** Early Risers: planned as 40-minute sessions on Sunday mornings; times to be confirmed */
export const EARLY_RISERS_TIME = "Sunday mornings · 40-minute sessions · times to be confirmed";

export const programmes: Programme[] = [
  {
    key: "early-risers",
    name: "Early Risers",
    ages: "4–6",
    ageMin: 4,
    ageMax: 6,
    summary: "Soft ball, movement, fun and confidence.",
    fixedTime: EARLY_RISERS_TIME,
    href: "/early-risers",
  },
  {
    key: "development",
    name: "Development",
    ages: "7–11",
    ageMin: 7,
    ageMax: 11,
    summary: "Technique, and the move from soft ball to hard ball.",
  },
  {
    key: "girls-development",
    name: "Girls Development",
    ages: "8–11",
    ageMin: 8,
    ageMax: 11,
    summary: "The Development format, girls only.",
    girlsOnly: true,
    href: "/girls",
  },
  {
    key: "performance",
    name: "Performance",
    ages: "10–15",
    ageMin: 10,
    ageMax: 15,
    summary: "Hard ball, specialist nets.",
  },
  {
    key: "girls-performance",
    name: "Girls Performance",
    ages: "11–15",
    ageMin: 11,
    ageMax: 15,
    summary: "The Performance format, girls only.",
    girlsOnly: true,
    href: "/girls",
  },
  {
    key: "small-group",
    name: "Small group (3 players)",
    ages: "4–15",
    ageMin: 4,
    ageMax: 15,
    summary: "Specialist coaching for three players.",
  },
  {
    key: "one-to-one",
    name: "1-to-1",
    ages: "4–15",
    ageMin: 4,
    ageMax: 15,
    summary: "Individual coaching.",
  },
];

/** Specialist skills coached within the programmes */
export const specialistSkills = ["Batting", "Power hitting", "Sweeps and ramps", "Seam bowling", "Spin bowling", "Wicket-keeping"];

export const groupSizes = {
  earlyRisers: 16,
  perNet: 6,
};

export function getProgramme(key: string) {
  return programmes.find((p) => p.key === key);
}
