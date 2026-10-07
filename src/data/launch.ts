/**
 * Launch timeline (autumn 2026). Edit here; the How Booking Works page,
 * homepage and emails read from this file.
 */
export const keyDates: { date: string; label: string; detail?: string }[] = [
  { date: "8 October", label: "Registrations open" },
  { date: "19 October", label: "Registrations close" },
  { date: "21 October", label: "Priority booking for registered families", detail: "48 hours before booking opens to everyone" },
  { date: "23 October", label: "Trial booking opens to everyone" },
  { date: "4–8 November", label: "Trial week" },
  { date: "9 November", label: "Decision and payment deadline", detail: "Autumn + spring balance, or first monthly payment, due by 12 noon" },
];

export const launch = {
  /** Launch at John Lyon (Licence to Occupy starts Monday 2 November 2026) */
  launchDate: "week commencing 2 November",
  /** First hall slots: Wednesday 4, Thursday 5, Saturday 7 and Sunday 8 November */
  trialWeek: "4–8 November",
  regularSessionsFrom: "11 November",
  /** Must be at least 48 hours before the first regular session (Wednesday 11 November, 6pm) */
  decisionDeadline: "12 noon on Monday 9 November",
  paymentNoticeHours: 48,
  priorityBookingHours: 48,
  /** Notice needed to cancel a trial and still get the deposit back */
  trialCancellationHours: 24,
};
