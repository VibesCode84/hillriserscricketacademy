import { academies, type Academy, type DisciplineKey } from "../data/academies";
import { sessions, isBookable, type AcademySession } from "../data/sessions";
import type { Experience, Gender, Interest } from "./booking/types";

export type RecommendInput = {
  age: number;
  gender: Gender;
  experience: Experience;
  interest: Interest;
};

export type AcademyRecommendation = {
  academy: Academy;
  reason: string;
  primary: boolean;
};

export type SessionRecommendation = {
  session: AcademySession;
  academy: Academy;
  reason: string;
  primary: boolean;
};

export type RecommendResult = {
  /** Short headline describing the suggested pathway */
  pathway: string;
  summary: string;
  /** Recommended academies, best first (max 3) */
  academies: AcademyRecommendation[];
  /**
   * Bookable slots for those academies that suit the child's age. Empty while
   * the weekly programme (which academy runs on which day) is being finalised.
   */
  sessions: SessionRecommendation[];
};

const interestToDiscipline: Record<Interest, DisciplineKey[]> = {
  batting: ["batting", "power"],
  seam: ["seam-bowling"],
  spin: ["spin-bowling"],
  "all-round": ["performance", "batting", "seam-bowling"],
  "not-sure": ["batting", "seam-bowling", "spin-bowling"],
};

const fitsAge = (r: { ageMin?: number; ageMax?: number }, age: number, slack = 0) =>
  (r.ageMin === undefined || age >= r.ageMin - slack) && (r.ageMax === undefined || age <= r.ageMax + slack);

function reasonFor(d: DisciplineKey, experience: Experience) {
  switch (d) {
    case "batting":
      return experience === "new"
        ? "Build a sound batting technique from the start, in small coaching groups."
        : "Sharpen technique, add scoring options and grow confidence at the crease.";
    case "seam-bowling":
      return "Develop a repeatable action, control and pace with workload-aware coaching.";
    case "spin-bowling":
      return "Learn to spin it harder and land it more often — every spin style welcome.";
    case "power":
      return "For batters with a sound technique who want more boundary options.";
    case "performance":
      return "Put skills under pressure in match scenarios — ideal for regular club and school players.";
    case "girls":
      return experience === "new"
        ? "A welcoming girls-only group where beginners learn alongside others starting out."
        : "Develop skills and confidence in a dedicated girls environment.";
    case "little-cricketers":
      return "Fun, active first steps: hitting, catching, throwing and games — the start of the academy pathway.";
  }
}

const summaries: Record<string, string> = {
  "Little Cricketers": "At this age the aim is to fall in love with the game. Little Cricketers is built exactly for that.",
  Explore: "Enjoy the game and build the fundamentals with plenty of attention from the coaching team.",
  Develop: "Build stronger skills and a repeatable technique in the areas they enjoy most.",
  Perform: "Apply their skills under pressure and in realistic match scenarios.",
  Excel: "Create an individual game and prepare for higher-level cricket.",
};

/**
 * Suggest the best starting academies (and, where the programme allows,
 * specific sessions) for a child. Deliberately simple and explainable — the
 * coaching team can always move a player after the trial.
 */
export function recommend(input: RecommendInput): RecommendResult {
  const { age, gender, experience, interest } = input;
  const picks: { key: DisciplineKey; reason: string }[] = [];
  const eligible = (key: DisciplineKey, slack = 0) => {
    const a = academies.find((x) => x.key === key);
    if (!a || !fitsAge(a, age, slack)) return false;
    return key !== "girls" || gender === "girl";
  };
  const add = (key: DisciplineKey, reason = reasonFor(key, experience), slack = 0) => {
    if (eligible(key, slack) && !picks.some((p) => p.key === key)) picks.push({ key, reason });
  };

  let pathway: string;
  if (age < 7 || (age === 7 && experience === "new")) {
    // Foundation: ages 4–7, or 7-year-olds new to cricket
    pathway = "Little Cricketers";
    add("little-cricketers", reasonFor("little-cricketers", experience), 1);
    add("girls", "A friendly girls-only group when she's ready for more.");
  } else {
    pathway = { new: "Explore", some: "Develop", regular: "Perform", performance: "Excel" }[experience];
    const advanced = experience === "regular" || experience === "performance";

    // Girls: the Girls Academy comes first for newer players
    if (!advanced) add("girls");

    let disciplines = interestToDiscipline[interest];
    if (advanced && age >= 10 && interest === "not-sure") disciplines = ["performance", "batting", "seam-bowling"];
    if (!advanced) disciplines = disciplines.filter((d) => d !== "power" && d !== "performance");
    if (!advanced && interest === "all-round") disciplines = ["batting", "seam-bowling"];

    for (const d of disciplines) add(d);
    if (advanced) add("performance");
    add("girls", "Girls are welcome in every academy — and in our dedicated Girls Academy too.");

    // Nothing fits exactly — relax the age band by a year
    if (!picks.length) for (const d of disciplines) add(d, undefined, 1);
  }

  const top = picks.slice(0, 3);
  const recommendedAcademies = top.map((p, i) => ({
    academy: academies.find((a) => a.key === p.key)!,
    reason: p.reason,
    primary: i === 0,
  }));

  const slots: SessionRecommendation[] = [];
  for (const r of recommendedAcademies) {
    const matches = sessions
      .filter((s) => isBookable(s) && s.discipline === r.academy.key && fitsAge(s, age) && (!s.girlsOnly || gender === "girl"))
      // Prefer the group whose age band centres closest to the child
      .sort((a, b) => Math.abs(((a.ageMin ?? 4) + (a.ageMax ?? 14)) / 2 - age) - Math.abs(((b.ageMin ?? 4) + (b.ageMax ?? 14)) / 2 - age));
    for (const s of matches) {
      slots.push({ session: s, academy: r.academy, reason: r.reason, primary: slots.length === 0 });
    }
  }

  return { pathway, summary: summaries[pathway], academies: recommendedAcademies, sessions: slots.slice(0, 4) };
}

export function ageFromDob(dob: string, on = new Date()) {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const m = on.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--;
  return age;
}
