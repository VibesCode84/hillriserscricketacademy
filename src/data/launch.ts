/**
 * Where HillRisers' own programmes are up to. For now the nets at John Lyon
 * are used by delivery partners (see src/data/partners.ts), and HillRisers'
 * own programmes are "coming soon": families register interest and hear first.
 * When the timetable is set, add real dates here — the How Booking Works page,
 * homepage, terms and emails read from this file.
 */
export const keyDates: { date: string; label: string; detail?: string }[] = [
  { date: "Now", label: "Register your interest", detail: "Free, with no commitment — tell us when your child can attend and what they want from cricket" },
  { date: "Coming soon", label: "Programmes and timetable announced", detail: "Registered families hear first" },
  { date: "Then", label: "Priority booking for registered families", detail: "48 hours before places open to everyone" },
  { date: "Then", label: "Try a session", detail: "Before you commit" },
];

export const launch = {
  /** Shown wherever a start date would go */
  status: "Programmes coming soon",
  priorityBookingHours: 48,
};
