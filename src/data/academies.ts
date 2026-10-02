export type DisciplineKey =
  | "batting"
  | "seam-bowling"
  | "spin-bowling"
  | "power"
  | "performance"
  | "girls"
  | "little-cricketers";

export type Academy = {
  key: DisciplineKey;
  /** URL for the academy's own page */
  href: string;
  name: string;
  shortName: string;
  /** One-line proposition used on cards */
  proposition: string;
  /** Hero strapline on the academy page */
  strapline: string;
  ageLabel: string;
  ageMin: number;
  ageMax: number;
  levelLabel: string;
  /** Length of one session in minutes */
  sessionMinutes: number;
  /** Fee for one session — also the refundable holding deposit for a trial request */
  pricePence: number;
  /** Description of the placeholder photo — swap for a real image path later */
  image: { src?: string; alt: string };
  learn: string[];
  howItWorks: { title: string; body: string }[];
  whoFor: string[];
  faqs: { q: string; a: string }[];
  seo: { title: string; description: string };
};

const standardHowItWorks = [
  {
    title: "Arrive and warm up",
    body: "Players are greeted by name, checked in by the coaching team and taken through a cricket-specific warm-up.",
  },
  {
    title: "Focused technical block",
    body: "The group splits into small stations led by the lead coach, assistant coach and junior helpers, so every player gets plenty of repetitions and feedback.",
  },
  {
    title: "Pressure and game scenarios",
    body: "Skills are put to work in realistic challenges, so players learn to use their technique — not just practise it.",
  },
  {
    title: "Review and one thing to work on",
    body: "Every player leaves knowing what went well and one clear focus for next time.",
  },
];

export const academies: Academy[] = [
  {
    key: "batting",
    href: "/academy/batting",
    name: "Batting Academy",
    shortName: "Batting",
    proposition: "Build technique, scoring options and confidence at the crease.",
    strapline: "Build a better technique — and learn how to use it in a game.",
    ageLabel: "Ages 8–14",
    ageMin: 8,
    ageMax: 14,
    levelLabel: "Some experience to regular club players",
    sessionMinutes: 90,
    pricePence: 2500,
    image: { alt: "Junior batter driving through the off side in an indoor net" },
    learn: [
      "Stronger setup and movement",
      "Better contact",
      "Scoring options all around the ground",
      "Playing pace and spin",
      "Decision-making — what to play and when",
      "Range hitting",
      "Confidence under pressure",
    ],
    howItWorks: standardHowItWorks,
    whoFor: [
      "Players who want to score more runs for their school or club side",
      "Batters who get out the same way and want to fix it",
      "Juniors moving up to harder balls, faster bowling or longer formats",
    ],
    faqs: [
      {
        q: "Does my child need their own bat and pads?",
        a: "Helmets, pads and gloves are essential for hard-ball work. If your child doesn't have their own kit yet, let us know when booking and we'll arrange academy equipment for the trial.",
      },
      {
        q: "Will they bat against a bowling machine?",
        a: "Sometimes — but most batting work is against live bowling, throw-downs and side-arm feeds, because that is what matches feel like.",
      },
    ],
    seo: {
      title: "Batting Academy — Junior Batting Coaching in Harrow",
      description:
        "Specialist junior batting coaching at John Lyon School, Harrow. Technique, scoring options, playing pace and spin, and confidence under pressure. Small groups, maximum 18 players.",
    },
  },
  {
    key: "seam-bowling",
    href: "/academy/seam-bowling",
    name: "Seam Bowling Academy",
    shortName: "Seam Bowling",
    proposition: "Develop control, movement, pace and a repeatable action.",
    strapline: "A repeatable action, more control — and the pace and movement that follow.",
    ageLabel: "Ages 8–14",
    ageMin: 8,
    ageMax: 14,
    levelLabel: "Some experience to performance players",
    sessionMinutes: 90,
    pricePence: 2500,
    image: { alt: "Young seam bowler at the point of delivery, front arm high" },
    learn: [
      "A rhythmical, repeatable run-up",
      "A safe, efficient action",
      "Line and length control",
      "Seam position and movement",
      "Building pace safely",
      "Simple bowling plans to different batters",
      "Fielding off your own bowling",
    ],
    howItWorks: standardHowItWorks,
    whoFor: [
      "Players who enjoy bowling and want to take more wickets",
      "Bowlers struggling with no-balls, wides or consistency",
      "Young quicks who want to bowl faster without picking up injuries",
    ],
    faqs: [
      {
        q: "Do you monitor workloads for young fast bowlers?",
        a: "Yes. Coaches follow age-appropriate bowling guidance and keep an eye on how many balls each player bowls in a session.",
      },
      {
        q: "Will you change my child's action?",
        a: "Only where it is safer or clearly more effective — and always explained. We build on how each player naturally bowls.",
      },
    ],
    seo: {
      title: "Seam Bowling Academy — Junior Bowling Coaching in Harrow",
      description:
        "Junior seam and fast bowling coaching at John Lyon School, Harrow. Run-up, action, control, movement and pace, with workload-aware coaching. Maximum 18 players.",
    },
  },
  {
    key: "spin-bowling",
    href: "/academy/spin-bowling",
    name: "Spin Bowling Academy",
    shortName: "Spin Bowling",
    proposition: "Learn to create revolutions, control flight and out-think batters.",
    strapline: "Spin it harder, land it more often, and learn to set a batter up.",
    ageLabel: "Ages 8–14",
    ageMin: 8,
    ageMax: 14,
    levelLabel: "All levels with some bowling experience",
    sessionMinutes: 90,
    pricePence: 2500,
    image: { alt: "Close-up of a young leg-spinner's grip on a red ball" },
    learn: [
      "Grip and wrist or finger position",
      "Creating more revolutions",
      "Flight, drift and dip",
      "Control of line and length",
      "Variations and when to use them",
      "Field settings and tactical thinking",
    ],
    howItWorks: standardHowItWorks,
    whoFor: [
      "Off-spinners, leg-spinners and left-arm spinners of all styles",
      "Players curious about spin who want to try it properly",
      "Spinners who want to bowl with more confidence in matches",
    ],
    faqs: [
      {
        q: "My child has never bowled spin. Is that okay?",
        a: "Absolutely. We'll start with grips and simple actions and find which style suits them.",
      },
    ],
    seo: {
      title: "Spin Bowling Academy — Junior Spin Coaching in Harrow",
      description:
        "Junior spin bowling coaching in Harrow at John Lyon School. Revolutions, flight, control, variations and tactical thinking for off-spin, leg-spin and left-arm spin.",
    },
  },
  {
    key: "power",
    href: "/academy/power",
    name: "Power & Range Hitting",
    shortName: "Power & Range",
    proposition: "Hit harder, access more areas and understand when to attack.",
    strapline: "More bat speed, more boundary options — and the judgement to use them.",
    ageLabel: "Ages 10–14",
    ageMin: 10,
    ageMax: 14,
    levelLabel: "Regular club/school players",
    sessionMinutes: 90,
    pricePence: 2500,
    image: { alt: "Junior batter clearing the front leg on a lofted shot" },
    learn: [
      "Bat speed and efficient movement",
      "Boundary options and hitting zones",
      "Clearing the ring safely",
      "Picking length early",
      "Intelligent aggression — when to attack and when not to",
    ],
    howItWorks: standardHowItWorks,
    whoFor: [
      "Batters who can defend but struggle to score quickly",
      "Players in short-format cricket who need more options",
      "Batters ready to add range to a sound technique",
    ],
    faqs: [
      {
        q: "Is power hitting just slogging?",
        a: "No. It is technique, balance and decision-making — and players learn when not to attack as much as when to.",
      },
    ],
    seo: {
      title: "Power & Range Hitting — Junior Cricket Coaching in Harrow",
      description:
        "Range hitting coaching for junior cricketers in Harrow: bat speed, boundary options, hitting zones and intelligent aggression. At John Lyon School.",
    },
  },
  {
    key: "performance",
    href: "/academy/performance",
    name: "Game Skills & Performance",
    shortName: "Performance",
    proposition: "Put technique under pressure through scenarios and match-based challenges.",
    strapline: "Where skills become match performances.",
    ageLabel: "Ages 10–14",
    ageMin: 10,
    ageMax: 14,
    levelLabel: "Regular club/school and performance players",
    sessionMinutes: 90,
    pricePence: 2500,
    image: { alt: "Junior players in a match-scenario drill with fielders set" },
    learn: [
      "Performing under pressure",
      "Match scenarios with and without the bat",
      "Running between the wickets",
      "Tactical awareness and game reading",
      "Decision-making in the moment",
      "Fielding as a weapon",
    ],
    howItWorks: standardHowItWorks,
    whoFor: [
      "Players who train well but want to perform better in matches",
      "Juniors aiming for higher-level club or school cricket",
      "All-rounders who want the full game together",
    ],
    faqs: [
      {
        q: "Does this lead to county selection?",
        a: "We don't promise representative selection. We help players build the skills, habits and match understanding that higher-level cricket asks for.",
      },
    ],
    seo: {
      title: "Game Skills & Performance — Junior Cricket Academy Harrow",
      description:
        "Match-based junior cricket coaching in Harrow: pressure scenarios, running, tactical awareness and decision-making for club and school players aged 10–14.",
    },
  },
  {
    key: "girls",
    href: "/girls",
    name: "Girls Academy",
    shortName: "Girls Academy",
    proposition: "A dedicated environment for girls to develop skills, confidence and love of the game.",
    strapline: "Cricket for girls who want to play, improve and belong.",
    ageLabel: "Ages 7–14",
    ageMin: 7,
    ageMax: 14,
    levelLabel: "Beginners to experienced players",
    sessionMinutes: 90,
    pricePence: 2500,
    image: { alt: "Girls Academy players celebrating a wicket together" },
    learn: [
      "Batting, bowling and fielding fundamentals",
      "Specialist skills as players develop",
      "Match play and game understanding",
      "Confidence and leadership",
    ],
    howItWorks: standardHowItWorks,
    whoFor: [
      "Girls trying cricket for the first time",
      "Girls already playing for school or club",
      "Players who want to train alongside other girls",
    ],
    faqs: [],
    seo: {
      title: "Girls Cricket Coaching in Harrow — Girls Academy",
      description:
        "Dedicated girls cricket coaching in Harrow for ages 7–14. Beginners and experienced players welcome. Positive role models and a clear pathway at John Lyon School.",
    },
  },
  {
    key: "little-cricketers",
    href: "/little-cricketers",
    name: "Little Cricketers",
    shortName: "Little Cricketers",
    proposition: "Fun, active first steps in cricket — and the start of the academy pathway.",
    strapline: "Their first cricket session should make them want another one.",
    ageLabel: "Ages 4–7",
    ageMin: 4,
    ageMax: 7,
    levelLabel: "No experience needed",
    sessionMinutes: 60,
    pricePence: 1500,
    image: { alt: "Young children catching soft balls with a coach" },
    learn: ["Hitting", "Catching", "Throwing", "Running and movement", "Simple team games"],
    howItWorks: standardHowItWorks,
    whoFor: ["Children aged roughly 4–7", "Complete beginners", "Energetic children who love to play"],
    faqs: [],
    seo: {
      title: "Little Cricketers — Cricket for Children Aged 4–7 in Harrow",
      description:
        "Fun, active cricket sessions for children aged 4–7 in Harrow. Hitting, catching, throwing and games — the first step into the Hillrisers academy pathway.",
    },
  },
];

export const specialistAcademies = academies.filter(
  (a) => a.key !== "girls" && a.key !== "little-cricketers",
);

export function getAcademy(key: string) {
  return academies.find((a) => a.key === key);
}

/** The refundable holding deposit for a trial request is the academy's first-session fee. */
export function depositFor(key: string) {
  return getAcademy(key)?.pricePence ?? 2500;
}
