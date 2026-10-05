/**
 * Programmes and price guide. Group programmes share one standard rate
 * (£30 per hour) with a 2026/27 offer of £25 per hour. Prices are per hour —
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
  /** Standard price in pence */
  pricePence: number;
  /** Special-offer price in pence (see OFFER_LABEL) */
  offerPricePence?: number;
  /** How the price is quoted */
  priceUnit: "per session" | "per hour" | "per player per hour";
  /** "from £75" */
  priceFrom?: boolean;
  girlsOnly?: boolean;
  /** Fixed time — only Little Cricketers has one */
  fixedTime?: string;
  href?: string;
};

/** Standard hourly rate for all group programmes (everything bar Little Cricketers) */
export const STANDARD_HOURLY_PENCE = 3000;
/** 2026/27 special offer */
export const OFFER_HOURLY_PENCE = 2500;
export const OFFER_LABEL = "2026/27 offer";

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
    pricePence: STANDARD_HOURLY_PENCE,
    offerPricePence: OFFER_HOURLY_PENCE,
    priceUnit: "per hour",
  },
  {
    key: "girls-development",
    name: "Girls Development",
    ages: "8–11",
    ageMin: 8,
    ageMax: 11,
    summary: "The Development format, girls only.",
    pricePence: STANDARD_HOURLY_PENCE,
    offerPricePence: OFFER_HOURLY_PENCE,
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
    pricePence: STANDARD_HOURLY_PENCE,
    offerPricePence: OFFER_HOURLY_PENCE,
    priceUnit: "per hour",
  },
  {
    key: "girls-performance",
    name: "Girls Performance",
    ages: "11–15",
    ageMin: 11,
    ageMax: 15,
    summary: "The Performance format, girls only.",
    pricePence: STANDARD_HOURLY_PENCE,
    offerPricePence: OFFER_HOURLY_PENCE,
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

const pounds = (pence: number) => (pence % 100 === 0 ? `£${pence / 100}` : `£${(pence / 100).toFixed(2)}`);

/** Standard price, e.g. "£30 per hour" or "from £75 per hour" */
export function formatProgrammePrice(p: Programme) {
  return `${p.priceFrom ? "from " : ""}${pounds(p.pricePence)} ${p.priceUnit}`;
}

/** Offer price if one applies, e.g. "£25 per hour" */
export function formatOfferPrice(p: Programme) {
  return p.offerPricePence ? `${pounds(p.offerPricePence)} ${p.priceUnit}` : undefined;
}
