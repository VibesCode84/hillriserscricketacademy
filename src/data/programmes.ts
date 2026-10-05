/**
 * Programmes and price guide. Prices are a guide per hour of coaching —
 * sessions may run for 1 hour, 90 minutes or 2 hours depending on parent
 * feedback. Little Cricketers is the only programme with a fixed time.
 */
export type ProgrammeKey =
  | "little-cricketers"
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
  /** Guide price in pence */
  pricePence: number;
  /** How the price is quoted */
  priceUnit: "per session" | "per hour" | "per player per hour";
  /** "from £75" */
  priceFrom?: boolean;
  girlsOnly?: boolean;
  /** Fixed time — only Little Cricketers has one */
  fixedTime?: string;
  href?: string;
};

export const programmes: Programme[] = [
  {
    key: "little-cricketers",
    name: "Little Cricketers",
    ages: "4–7",
    ageMin: 4,
    ageMax: 7,
    summary: "Soft ball, movement, fun and confidence.",
    pricePence: 1800,
    priceUnit: "per session",
    fixedTime: "Sundays 9:00–9:50am",
    href: "/little-cricketers",
  },
  {
    key: "development",
    name: "Development",
    ages: "7–11",
    ageMin: 7,
    ageMax: 11,
    summary: "Technique, and the move from tennis ball to hard ball.",
    pricePence: 2400,
    priceUnit: "per hour",
  },
  {
    key: "girls-development",
    name: "Girls Development",
    ages: "8–11",
    ageMin: 8,
    ageMax: 11,
    summary: "The Development format, girls only.",
    pricePence: 2400,
    priceUnit: "per hour",
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
    pricePence: 3000,
    priceUnit: "per hour",
  },
  {
    key: "girls-performance",
    name: "Girls Performance",
    ages: "11–15",
    ageMin: 11,
    ageMax: 15,
    summary: "The Performance format, girls only.",
    pricePence: 3000,
    priceUnit: "per hour",
    girlsOnly: true,
    href: "/girls",
  },
  {
    key: "small-group",
    name: "Small group (3 players)",
    ages: "All ages",
    summary: "Specialist coaching for three players.",
    pricePence: 4500,
    priceUnit: "per player per hour",
  },
  {
    key: "one-to-one",
    name: "1-to-1",
    ages: "All ages",
    summary: "Individual coaching.",
    pricePence: 7500,
    priceUnit: "per hour",
    priceFrom: true,
  },
];

/** One-off registration fee for new players, including a HillRisers playing shirt */
export const REGISTRATION_FEE_PENCE = 3000;

/** Specialist skills coached within the programmes */
export const specialistSkills = ["Batting", "Power hitting", "Sweeps and ramps", "Seam bowling", "Spin bowling"];

export const groupSizes = {
  littleCricketers: 24,
  perNet: 6,
  perSession: 18,
};

export function getProgramme(key: string) {
  return programmes.find((p) => p.key === key);
}

export function formatProgrammePrice(p: Programme) {
  const amount = p.pricePence % 100 === 0 ? `£${p.pricePence / 100}` : `£${(p.pricePence / 100).toFixed(2)}`;
  return `${p.priceFrom ? "from " : ""}${amount} ${p.priceUnit}`;
}
