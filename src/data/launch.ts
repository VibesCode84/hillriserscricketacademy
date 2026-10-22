/**
 * Where HillRisers' own programmes are up to. For now the nets at John Lyon
 * are used by delivery partners (see src/data/partners.ts), and HillRisers'
 * own programmes are "coming soon": families register what they want and when they can come.
 * When the timetable is set, add real dates here — the How Booking Works page,
 * homepage, terms and emails read from this file.
 */
export const keyDates: { date: string; label: string; detail?: string }[] = [
  { date: "Now", label: "Register your interest", detail: "Free, with no commitment — tell us what your child wants and which sessions they can make" },
  { date: "Next", label: "We shape our programmes", detail: "Around what families tell us" },
  { date: "Then", label: "We'll be in touch", detail: "With programme details when they're ready" },
];

export const launch = {
  /** Shown wherever a start date would go */
  status: "Programmes coming soon",
};
