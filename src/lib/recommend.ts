import type { DisciplineKey } from "../data/academies";
import { sessions, type AcademySession } from "../data/sessions";
import type { Experience, Gender, Interest } from "./booking/types";

export type RecommendInput = {
  age: number;
  gender: Gender;
  experience: Experience;
  interest: Interest;
};

export type Recommendation = {
  session: AcademySession;
  reason: string;
  primary: boolean;
};

export type RecommendResult = {
  /** Short headline describing the suggested pathway */
  pathway: string;
  summary: string;
  recommendations: Recommendation[];
};

const interestToDiscipline: Record<Interest, DisciplineKey[]> = {
  batting: ["batting", "power"],
  seam: ["seam-bowling"],
  spin: ["spin-bowling"],
  "all-round": ["performance", "batting", "seam-bowling"],
  "not-sure": ["batting", "seam-bowling", "spin-bowling"],
};

const fitsAge = (s: AcademySession, age: number, slack = 0) =>
  age >= s.ageMin - slack && age <= s.ageMax + slack;

/**
 * Suggest the best starting sessions for a child. Deliberately simple and
 * explainable — the coaching team can always move a player after the trial.
 */
export function recommend(input: RecommendInput): RecommendResult {
  const { age, gender, experience, interest } = input;
  const active = sessions.filter((s) => s.active);
  const picks: Recommendation[] = [];
  const add = (s: AcademySession | undefined, reason: string) => {
    if (s && !picks.some((p) => p.session.id === s.id)) picks.push({ session: s, reason, primary: picks.length === 0 });
  };
  const byDiscipline = (d: DisciplineKey, slack = 0) =>
    active.filter((s) => s.discipline === d && fitsAge(s, age, slack) && (!s.girlsOnly || gender === "girl"));

  // Foundation: ages 4–7, or 7-year-olds new to cricket
  if (age < 7 || (age === 7 && experience === "new")) {
    for (const s of byDiscipline("little-cricketers", 1)) {
      add(s, "Fun, active first steps: hitting, catching, throwing and games — the start of the academy pathway.");
    }
    if (gender === "girl" && age >= 7) {
      for (const s of byDiscipline("girls")) add(s, "A friendly girls-only group when she's ready for more.");
    }
    return {
      pathway: "Little Cricketers",
      summary: "At this age the aim is to fall in love with the game. Little Cricketers is built exactly for that.",
      recommendations: picks.slice(0, 3),
    };
  }

  // Girls: always offer the Girls Academy, first for newer players
  const girls = gender === "girl" ? byDiscipline("girls") : [];
  if (girls.length && (experience === "new" || experience === "some")) {
    for (const s of girls) {
      add(s, experience === "new"
        ? "A welcoming girls-only group where beginners learn alongside others starting out."
        : "Develop skills and confidence in a dedicated girls environment.");
    }
  }

  const advanced = experience === "regular" || experience === "performance";
  let disciplines = interestToDiscipline[interest];
  if (advanced && age >= 10 && interest === "not-sure") disciplines = ["performance", "batting", "seam-bowling"];
  if (!advanced) disciplines = disciplines.filter((d) => d !== "power" && d !== "performance").concat(
    interest === "all-round" ? ["batting", "seam-bowling"] : [],
  );

  const reasonFor = (d: DisciplineKey) => {
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
      default:
        return "A great fit for your child's age and interests.";
    }
  };

  for (const d of disciplines) {
    const matches = byDiscipline(d);
    // Prefer the group whose age band centres closest to the child
    matches.sort((a, b) => Math.abs((a.ageMin + a.ageMax) / 2 - age) - Math.abs((b.ageMin + b.ageMax) / 2 - age));
    add(matches[0], reasonFor(d));
  }

  if (advanced && age >= 10) {
    add(byDiscipline("performance")[0], reasonFor("performance"));
  }
  for (const s of girls) add(s, "Girls are welcome in every academy — and in our dedicated Girls Academy too.");

  // Nothing fits exactly — relax the age band by a year
  if (!picks.length) {
    for (const d of disciplines) add(byDiscipline(d, 1)[0], reasonFor(d));
  }

  const pathway =
    experience === "new"
      ? "Explore"
      : experience === "some"
        ? "Develop"
        : experience === "regular"
          ? "Perform"
          : "Excel";

  const summaries: Record<string, string> = {
    Explore: "Enjoy the game and build the fundamentals with plenty of attention from the coaching team.",
    Develop: "Build stronger skills and a repeatable technique in the areas they enjoy most.",
    Perform: "Apply their skills under pressure and in realistic match scenarios.",
    Excel: "Create an individual game and prepare for higher-level cricket.",
  };

  return { pathway, summary: summaries[pathway], recommendations: picks.slice(0, 3) };
}

export function ageFromDob(dob: string, on = new Date()) {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const m = on.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--;
  return age;
}
