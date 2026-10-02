import type { DisciplineKey } from "./academies";

/**
 * Coaching team. Names, photos and qualifications are placeholders —
 * replace with verified details before launch (never overstate certifications).
 */
export type Coach = {
  id: string;
  name: string;
  role: string;
  disciplines: DisciplineKey[];
  qualifications: string;
  background: string;
  philosophy: string;
  image: { src?: string; alt: string };
};

export const coaches: Coach[] = [
  {
    id: "head-coach",
    name: "Head Coach",
    role: "Head of Academy · Lead Batting Coach",
    disciplines: ["batting", "power", "performance"],
    qualifications: "ECB coaching qualification — to confirm",
    background: "Club and representative cricket; years of junior coaching across Harrow and Middlesex.",
    philosophy:
      "I want every player to understand their own game — not simply copy someone else's technique.",
    image: { alt: "Head coach giving feedback to a young batter" },
  },
  {
    id: "seam-coach",
    name: "Seam Coach",
    role: "Lead Seam Bowling Coach",
    disciplines: ["seam-bowling", "performance"],
    qualifications: "ECB coaching qualification — to confirm",
    background: "Experienced club opening bowler with a focus on safe, efficient actions for young quicks.",
    philosophy: "Pace is built on rhythm. Get the rhythm right and control and speed follow.",
    image: { alt: "Seam bowling coach demonstrating a bowling action" },
  },
  {
    id: "spin-coach",
    name: "Spin Coach",
    role: "Lead Spin Bowling Coach",
    disciplines: ["spin-bowling"],
    qualifications: "ECB coaching qualification — to confirm",
    background: "Specialist spinner who loves helping young bowlers find their own variation.",
    philosophy: "Spin is about courage. I want players who are brave enough to give it a rip.",
    image: { alt: "Spin coach showing a grip to a junior bowler" },
  },
  {
    id: "girls-lead",
    name: "Girls Academy Lead",
    role: "Girls Academy Lead Coach",
    disciplines: ["girls", "batting"],
    qualifications: "ECB coaching qualification — to confirm",
    background: "Women's club cricketer and passionate advocate for girls' cricket.",
    philosophy:
      "Confidence comes from being good at something. We make sure every girl leaves feeling she's improved.",
    image: { alt: "Girls Academy lead coach with a group of young players" },
  },
  {
    id: "foundation-lead",
    name: "Foundation Lead",
    role: "Little Cricketers Lead Coach",
    disciplines: ["little-cricketers"],
    qualifications: "ECB coaching qualification — to confirm",
    background: "Specialist in early-years and primary sport — plenty of energy, plenty of patience.",
    philosophy: "If they're smiling and moving, they're learning. The technique comes next.",
    image: { alt: "Coach high-fiving a young Little Cricketer" },
  },
];

export function coachesFor(discipline: DisciplineKey) {
  return coaches.filter((c) => c.disciplines.includes(discipline));
}
