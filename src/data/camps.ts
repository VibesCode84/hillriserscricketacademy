/**
 * Specialist holiday camps. Camps run in school half terms, when academy
 * sessions pause. Details (dates, times, ages, price, focus) are TBC — until a
 * camp has `bookable: true` the site takes interest registrations only, and
 * shows no details beyond the camp's name.
 */
export type Camp = {
  id: string;
  name: string;
  bookable: boolean;
};

export const camps: Camp[] = [{ id: "spring-half-term-2027", name: "Spring Half Term Camp", bookable: false }];

/** Option for families who want to hear about any future camp */
export const FUTURE_CAMPS = "future";

export function getCamp(id: string) {
  return camps.find((c) => c.id === id);
}
