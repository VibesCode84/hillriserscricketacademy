import { site } from "./site";

/**
 * The HillRisers landing page at hillrisers.co.uk.
 * Give a sport an `href` when its site is ready; until then it shows its `status`.
 */
export const hub = {
  url: (process.env.NEXT_PUBLIC_HUB_URL || "https://hillrisers.co.uk").replace(/\/$/, ""),
  hosts: ["hillrisers.co.uk", "www.hillrisers.co.uk"],
  name: "HillRisers",
  tagline: "Sport for every stage.",
  intro:
    "High-quality cricket, netball and hockey programmes in Harrow, with coaching designed to help people enjoy their sport, improve and progress.",
  prompt: "Choose your sport.",
  description:
    "High-quality cricket, netball and hockey programmes in Harrow, with coaching designed to help people enjoy their sport, improve and progress.",
  aboutHeading: "About HillRisers",
  aboutLead: "Better coaching. More opportunities. Stronger pathways.",
  about: [
    "HillRisers creates high-quality sporting opportunities in Harrow for children, young people and adults.",
    "We work with experienced coaches, established clubs and local schools to create programmes that help people enjoy their sport, develop their skills, build confidence and progress at the right level for them.",
    "Our cricket programme launches at John Lyon School, netball is delivered in partnership with Eagles Netball Club, and further hockey provision is being developed.",
    "HillRisers CIC is a Community Interest Company established to increase access to high-quality sport and create sustainable sporting opportunities for the local community.",
  ],
  legalName: "HillRisers CIC",
  email: "office@hillrisers.co.uk",
  companyNumber: "17511172",
};

export type Sport = {
  key: "cricket" | "hockey" | "netball";
  name: string;
  /** Short line under the name */
  line?: string;
  href?: string;
  cta?: string;
  /** Shown instead of a button when there is no link yet */
  status?: string;
  /** "small" shows a slim, low-key row under the main cards */
  size?: "large" | "small";
  /** position: CSS object-position on tablets and up; mobilePosition: on phones (photo above the text) */
  image?: { src: string; alt: string; position?: string; mobilePosition?: string };
};

export const sports: Sport[] = [
  {
    key: "cricket",
    name: "Cricket",
    line: "HillRisers Cricket Academy at John Lyon School. Junior coaching, specialist development and future adult provision.",
    href: site.url,
    cta: "Visit the Cricket Academy",
    image: { src: "/images/girl-batting.webp", alt: "Girl in navy and gold kit batting in an indoor net", position: "center 25%" },
  },
  {
    key: "netball",
    name: "Netball",
    line: "Delivered in partnership with Eagles Netball Club. Junior development, adult and returning-player opportunities, with high-quality coaching and a strong community feel.",
    href: "https://eaglesnetballclub.com",
    cta: "Explore Eagles Netball",
    image: { src: "/images/eagles-netball.webp", alt: "Eagles Netball Club players in club kit on an outdoor netball court", position: "center 100%", mobilePosition: "center 70%" },
  },
  {
    key: "hockey",
    name: "Hockey",
    line: "A new HillRisers hockey programme is in development for Harrow.",
    status: "Launching soon",
    size: "small",
  },
];
