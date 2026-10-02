import type { DisciplineKey } from "./academies";

/**
 * Parent testimonials.
 *
 * IMPORTANT: the entries below are SAMPLE copy to show the layout and the kind
 * of transformation-focused quote we want. Replace every one with a real,
 * consented parent quote before launch. `sample: true` entries are flagged
 * visually outside production.
 */
export type Testimonial = {
  id: string;
  quote: string;
  parent: string;
  /** Only include with consent */
  childLabel?: string;
  disciplines: DisciplineKey[] | "all";
  sample?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "He came out talking about what he had learned rather than just saying he enjoyed it.",
    parent: "Priya",
    childLabel: "Parent of a Batting Academy player, U11",
    disciplines: ["batting", "power"],
    sample: true,
  },
  {
    id: "t2",
    quote:
      "She was nervous about being the only beginner. By the second week she was asking if she could come twice a week.",
    parent: "Claire",
    childLabel: "Parent of a Girls Academy player, U10",
    disciplines: ["girls"],
    sample: true,
  },
  {
    id: "t3",
    quote:
      "His run-up used to be all over the place. Now he knows exactly what he's working on, and his club coach has noticed.",
    parent: "Mark",
    childLabel: "Parent of a Seam Bowling Academy player, U13",
    disciplines: ["seam-bowling", "performance"],
    sample: true,
  },
  {
    id: "t4",
    quote:
      "The coaches knew her name by the end of the first session. That's what made us come back.",
    parent: "Sana",
    childLabel: "Parent of a Spin Bowling Academy player, U12",
    disciplines: ["spin-bowling", "girls"],
    sample: true,
  },
  {
    id: "t5",
    quote:
      "An hour of non-stop running, catching and laughing. He fell asleep in the car and woke up asking about next week.",
    parent: "Tom",
    childLabel: "Parent of a Little Cricketer, age 5",
    disciplines: ["little-cricketers"],
    sample: true,
  },
];

export function testimonialsFor(discipline?: DisciplineKey) {
  if (!discipline) return testimonials;
  const matched = testimonials.filter(
    (t) => t.disciplines === "all" || t.disciplines.includes(discipline),
  );
  return matched.length ? matched : testimonials.slice(0, 1);
}
