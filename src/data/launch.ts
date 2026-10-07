/**
 * Launch timeline (autumn 2026). Edit here; the How Booking Works page,
 * homepage and emails read from this file.
 */
export const keyDates: { date: string; label: string; detail?: string }[] = [
  { date: "8 October", label: "Registrations open" },
  { date: "19 October", label: "Registrations close" },
  { date: "21 October", label: "Priority booking for registered families", detail: "48 hours before booking opens to everyone" },
  { date: "23 October", label: "Trial booking opens to everyone" },
  { date: "4–8 November", label: "Trial week", detail: "Trial on the day your child plans to train" },
  { date: "7–11 November", label: "Decision and payment deadline", detail: "Autumn + spring balance, or first monthly payment, due by 9am, 4 days before your child's first regular session: Wednesday groups 7 Nov, Thursday 8 Nov, Saturday 10 Nov, Sunday 11 Nov" },
];

export const launch = {
  /** Launch at John Lyon (Licence to Occupy starts Monday 2 November 2026) */
  launchDate: "week commencing 2 November",
  /** First hall slots: Wednesday 4, Thursday 5, Saturday 7 and Sunday 8 November */
  trialWeek: "4–8 November",
  regularSessionsFrom: "11 November",
  /** Decision and payment deadline: 9am, at least 4 days before the child's first regular session */
  paymentNoticeDays: 4,
  decisionDeadline: "9am, 4 days before your child's first regular session",
  /** First regular session for each weekly day, and its payment deadline */
  paymentDeadlines: [
    { firstSession: "Wednesday 11 November", due: "Saturday 7 November" },
    { firstSession: "Thursday 12 November", due: "Sunday 8 November" },
    { firstSession: "Saturday 14 November", due: "Tuesday 10 November" },
    { firstSession: "Sunday 15 November", due: "Wednesday 11 November" },
  ],
  priorityBookingHours: 48,
  /** Notice needed to cancel a trial and still get the deposit back */
  trialCancellationHours: 24,
};
