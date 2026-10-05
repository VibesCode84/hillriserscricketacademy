/**
 * Global academy details.
 *
 * Contact details are deliberately left unset until they are real — the site
 * hides anything that is `undefined` rather than showing a placeholder.
 */
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;

export const site = {
  name: "HillRisers Cricket Academy",
  shortName: "HillRisers",
  description:
    "The very best junior cricket coaching in Harrow. Elite coaches from the area, small groups of up to six per net, a girls-only pathway and coaching built around every child — at John Lyon School, Harrow on the Hill.",
  /** Used for canonical URLs, metadata and links in emails */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl ?? "https://hillriserscricketacademytest.vercel.app").replace(/\/$/, ""),
  /** Public contact email — TODO: add when confirmed */
  email: undefined as string | undefined,
  /** Public phone number, e.g. "07123 456789" — TODO: add when confirmed */
  phone: undefined as string | undefined,
  /** Safeguarding / welfare contact — TODO: add before sessions start */
  welfareEmail: undefined as string | undefined,
  venue: {
    name: "John Lyon School",
    addressLines: ["Middle Road", "Harrow on the Hill", "HA2 0HN"],
    mapQuery: "John Lyon School, Middle Road, Harrow HA2 0HN",
  },
  ages: "4–15",
} as const;

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "").replace(/^0/, "+44")}`;
}

export const nav = [
  { href: "/programmes", label: "Programmes" },
  { href: "/how-booking-works", label: "How It Works" },
  { href: "/girls", label: "Girls" },
  { href: "/little-cricketers", label: "Little Cricketers" },
  { href: "/venue", label: "Venue" },
  { href: "/coaches", label: "Coaches" },
  { href: "/faq", label: "FAQs" },
] as const;

export function formatPrice(pence: number) {
  return pence % 100 === 0 ? `£${pence / 100}` : `£${(pence / 100).toFixed(2)}`;
}
