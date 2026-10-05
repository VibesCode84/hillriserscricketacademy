/**
 * Launch timeline (autumn 2026). Edit here; the How Booking Works page,
 * homepage and emails read from this file.
 */
export const keyDates: { date: string; label: string; detail?: string }[] = [
  { date: "8 October", label: "Registrations open" },
  { date: "19 October", label: "Registrations close" },
  { date: "21 October", label: "Priority booking for registered families", detail: "48 hours before booking opens to everyone" },
  { date: "23 October", label: "Trial booking opens to everyone" },
  { date: "1–7 November", label: "Trial week" },
  { date: "9 November", label: "Decision deadline", detail: "Autumn + spring balance, or first monthly payment, due" },
];

export const launch = {
  /** Launch at John Lyon */
  launchDate: "1 November",
  trialWeek: "1–7 November",
  regularSessionsFrom: "8 November",
  decisionDeadline: "9 November",
  priorityBookingHours: 48,
  /** Notice needed to cancel a trial and still get the deposit back */
  trialCancellationHours: 24,
};
