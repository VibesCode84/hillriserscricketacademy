/**
 * Global academy details. Placeholder contact values are marked TODO —
 * replace before launch.
 */
export const site = {
  name: "Hillrisers Cricket Academy",
  shortName: "Hillrisers",
  tagline: "Better coaching. More touches. Clearer development. More confident cricketers.",
  description:
    "Specialist junior cricket coaching in Harrow for players aged 4–14. Batting, seam, spin, power hitting, performance and a dedicated Girls Academy at John Lyon School.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@hillriserscricket.co.uk", // TODO: confirm
  phone: "07000 000000", // TODO: confirm
  phoneHref: "tel:+447000000000", // TODO: confirm
  welfareOfficer: {
    name: "Academy Welfare Officer", // TODO: name the welfare lead
    email: "welfare@hillriserscricket.co.uk", // TODO: confirm
  },
  venue: {
    name: "John Lyon School",
    addressLines: ["Middle Road", "Harrow on the Hill", "HA2 0HN"],
    mapQuery: "John Lyon School, Middle Road, Harrow HA2 0HN",
  },
  social: {
    instagram: "https://instagram.com/", // TODO
    facebook: "https://facebook.com/", // TODO
  },
  standardSession: {
    minutes: 90,
    pricePence: 2500,
    capacity: 18,
    team: "1 lead coach, 1 assistant coach and 2 junior helpers",
  },
  /** Little Cricketers (ages 4–7) — shorter sessions */
  littleCricketers: {
    minutes: 60,
    pricePence: 1500,
  },
} as const;

export const nav = [
  { href: "/academy", label: "Academy" },
  { href: "/sessions", label: "Sessions" },
  { href: "/girls", label: "Girls Cricket" },
  { href: "/little-cricketers", label: "Little Cricketers" },
  { href: "/camps", label: "Camps" },
  { href: "/coaches", label: "Coaches" },
  { href: "/venue", label: "Venue" },
  { href: "/faq", label: "FAQs" },
] as const;

export function formatPrice(pence: number) {
  return pence % 100 === 0 ? `£${pence / 100}` : `£${(pence / 100).toFixed(2)}`;
}
