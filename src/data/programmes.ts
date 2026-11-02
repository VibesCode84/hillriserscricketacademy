/**
 * Programmes for ages 4–15. Fees are paid termly in advance and the first
 * session is a paid taster; session lengths and times will be set
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
  /** Fee shown in the programmes table */
  fee: string;
  /** Planned timing note, shown under the summary */
  fixedTime?: string;
  href?: string;
};

/** Early Risers: planned as 40-minute sessions on Sunday mornings; times to be confirmed */
export const EARLY_RISERS_TIME = "Sunday mornings · 40-minute sessions · times to be confirmed";

/** Nets: up to six players per net, each with its own coach */
export const NETS_FEE = "£25 per hour";
export const EARLY_RISERS_FEE = "£15 per 40-minute session";
export const FEES_NOTE = "Fees are paid termly in advance. The first session is a paid taster.";

export const programmes: Programme[] = [
  {
    key: "early-risers",
    fee: EARLY_RISERS_FEE,
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
    fee: NETS_FEE,
    name: "Development",
    ages: "7–11",
    ageMin: 7,
    ageMax: 11,
    summary: "Technique, and the move from soft ball to hard ball.",
  },
  {
    key: "girls-development",
    fee: NETS_FEE,
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
    fee: NETS_FEE,
    name: "Performance",
    ages: "10–15",
    ageMin: 10,
    ageMax: 15,
    summary: "Hard ball, specialist nets.",
  },
  {
    key: "girls-performance",
    fee: NETS_FEE,
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
    fee: "To be confirmed",
    name: "Small group (3 players)",
    ages: "8–15",
    ageMin: 8,
    ageMax: 15,
    summary: "Specialist coaching for three players.",
  },
  {
    key: "one-to-one",
    fee: "To be confirmed",
    name: "1-to-1",
    ages: "8–15",
    ageMin: 8,
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
