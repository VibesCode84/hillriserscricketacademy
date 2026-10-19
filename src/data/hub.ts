import { site } from "./site";

/**
 * The HillRisers landing page at hillrisers.co.uk.
 * Give a sport an `href` when its site is ready; until then it shows "Coming soon".
 */
export const hub = {
  url: (process.env.NEXT_PUBLIC_HUB_URL || "https://hillrisers.co.uk").replace(/\/$/, ""),
  hosts: ["hillrisers.co.uk", "www.hillrisers.co.uk"],
  name: "HillRisers",
  tagline: "Specialist junior coaching in Harrow.",
  description: "HillRisers brings specialist junior coaching to Harrow — cricket, hockey and netball, all launching soon. Choose your sport.",
  about: [
    "HillRisers brings specialist coaching to young people in Harrow, in small groups and built around each child.",
    "Cricket, hockey and netball are all launching soon. Our cricket academy starts at John Lyon School, Harrow on the Hill, in November 2026, and our netball is delivered with our partner, Eagles Netball Club.",
    "HillRisers is run by HillRisers CIC, a community interest company registered in England and Wales (company number 17511172).",
  ],
  legalName: "HillRisers CIC",
  companyNumber: "17511172",
};

export type Sport = {
  key: "cricket" | "hockey" | "netball";
  name: string;
  /** Short line under the name */
  line?: string;
  href?: string;
  cta?: string;
  image?: { src: string; alt: string; position?: string };
};

export const sports: Sport[] = [
  {
    key: "cricket",
    name: "Cricket",
    line: "HillRisers Cricket Academy · ages 4–15 at John Lyon School",
    href: site.url,
    cta: "Visit the cricket academy",
    image: { src: "/images/girl-batting.webp", alt: "Girl in navy and gold kit batting in an indoor net", position: "center 25%" },
  },
  { key: "hockey", name: "Hockey" },
  {
    key: "netball",
    name: "Netball",
    line: "Delivered with our partner, Eagles Netball Club",
    href: "https://eaglesnetballclub.com",
    cta: "Visit Eagles Netball Club",
  },
];
