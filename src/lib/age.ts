/** Age in whole years on a given date (default today). */
export function ageOn(dob: string, on = new Date()) {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const m = on.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--;
  return age;
}

/** Age bands used for demand analysis */
export function ageBand(age: number) {
  if (age >= 4 && age <= 7) return "4–7";
  if (age >= 8 && age <= 11) return "8–11";
  if (age >= 12 && age <= 15) return "12–15";
  return "Other";
}
