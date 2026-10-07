/**
 * 2026/27 HillRisers calendar at John Lyon School, from the school's
 * allocation (Licence to Occupy, 2 November 2026 – August 2027).
 *
 * Public copy only: no hall times, costs or licence details here.
 * Holiday arrangements are still being shaped by parent feedback, so they
 * are described as "likely" and marked TBC.
 */

export type CalendarKind = "launch" | "term" | "holiday" | "shutdown" | "affected";

export type CalendarEntry = {
  id: string;
  kind: CalendarKind;
  /** Display dates, e.g. "14–20 December 2026" */
  dates: string;
  title: string;
  /** What happens / likely arrangements */
  detail: string;
};

/**
 * Holiday periods parents can ask for, excluding the Christmas shutdown.
 * Used by the register-your-interest form, admin and CSV export.
 */
export const holidayPeriods = [
  { id: "christmas-2026", label: "Christmas holidays", dates: "14–20 December 2026" },
  { id: "spring-half-term-2027", label: "Spring half term", dates: "15–21 February 2027" },
  { id: "easter-2027", label: "Easter holidays", dates: "29 March – 11 April 2027" },
  { id: "summer-half-term-2027", label: "Summer half term", dates: "31 May – 6 June 2027" },
  { id: "summer-holidays-2027", label: "Summer holidays", dates: "12 July – 31 August 2027" },
] as const;

export type HolidayPeriodId = (typeof holidayPeriods)[number]["id"];

/** What families would like in each holiday period */
export const holidayOptions = ["Normal weekly sessions", "Part-day camp", "Full-day camp"] as const;

export const shutdown = { dates: "21 December 2026 – 3 January 2027", label: "Christmas shutdown" };

/** Dates lost to exams in the summer term */
export const examDates = ["Thursday 20 May 2027", "Wednesday 26 May 2027", "Thursday 10 June 2027"];

const holiday = (id: HolidayPeriodId) => holidayPeriods.find((p) => p.id === id)!;

const holidayDetail =
  "Likely: holiday camps (part-day or full-day), with weekly sessions possibly continuing in their normal slot. To be confirmed — tell us what you'd like when you register.";

export const calendarTerms: { term: string; entries: CalendarEntry[] }[] = [
  {
    term: "Autumn term 2026",
    entries: [
      { id: "launch", kind: "launch", dates: "Week commencing 2 November", title: "HillRisers launches", detail: "Our first weeks at John Lyon School, Harrow on the Hill." },
      { id: "trial", kind: "launch", dates: "4–8 November", title: "Trial week", detail: "Book a trial session. The deposit is credited to your sessions if you join." },
      { id: "deadline", kind: "launch", dates: "Monday 9 November, 12 noon", title: "Decision and payment deadline", detail: "Autumn and spring balance, or first monthly payment, due." },
      { id: "regular", kind: "term", dates: "From Wednesday 11 November", title: "Regular sessions start", detail: "Weekly sessions run through to the Christmas holidays." },
      { id: "christmas", kind: "holiday", dates: holiday("christmas-2026").dates, title: "Christmas holidays (first week)", detail: holidayDetail },
      { id: "shutdown", kind: "shutdown", dates: shutdown.dates, title: shutdown.label, detail: "The venue is closed. No sessions or camps." },
    ],
  },
  {
    term: "Spring term 2027",
    entries: [
      { id: "spring-start", kind: "term", dates: "Week commencing 4 January", title: "Sessions resume", detail: "Weekly sessions restart after the shutdown." },
      { id: "spring-half", kind: "holiday", dates: holiday("spring-half-term-2027").dates, title: "Spring half term", detail: holidayDetail },
      { id: "easter", kind: "holiday", dates: holiday("easter-2027").dates, title: "Easter holidays", detail: `${holidayDetail} Sessions over the Easter weekend (26–29 March) will be confirmed nearer the time.` },
    ],
  },
  {
    term: "Summer term 2027",
    entries: [
      { id: "summer-start", kind: "term", dates: "Week commencing 12 April", title: "Summer term starts", detail: "Summer arrangements are to be confirmed. We're expecting outdoor nets alongside the sports hall." },
      { id: "exams", kind: "affected", dates: "20 May, 26 May and 10 June 2027", title: "Sports hall unavailable (exams)", detail: "Likely: sessions move outdoors or a make-up session is offered. We'll confirm well in advance." },
      { id: "summer-half", kind: "holiday", dates: holiday("summer-half-term-2027").dates, title: "Summer half term", detail: holidayDetail },
      { id: "summer-holidays", kind: "holiday", dates: holiday("summer-holidays-2027").dates, title: "Summer holidays", detail: holidayDetail },
    ],
  },
];
