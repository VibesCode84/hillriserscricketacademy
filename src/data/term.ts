/**
 * Term dates and termly payment. Edit here each term.
 *
 * Families pay termly; fees are due one week before the term's sessions start.
 * TODO: add the term's end date / number of weeks so the termly fee can be
 * shown as a total and taken online (Booking.paymentType "term").
 */
export const term = {
  label: "First term",
  /** Sessions start the week commencing this date (YYYY-MM-DD) */
  startsWeekCommencing: "2026-11-01",
  /** Term fees are due this many days before sessions start */
  paymentDueDaysBefore: 7,
  /** Number of weekly sessions in the term — unknown until confirmed */
  weeks: undefined as number | undefined,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parse(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

/** YYYY-MM-DD of the termly payment deadline */
export function paymentDueDate(t = term) {
  return new Date(parse(t.startsWeekCommencing).getTime() - t.paymentDueDaysBefore * DAY_MS).toISOString().slice(0, 10);
}

/** "1 November" or, with weekday, "Sunday 25 October" */
export function formatTermDate(date: string, opts: { weekday?: boolean } = {}) {
  return parse(date).toLocaleDateString("en-GB", {
    weekday: opts.weekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export const termStartLabel = `week commencing ${formatTermDate(term.startsWeekCommencing)}`;
export const termPaymentDueLabel = formatTermDate(paymentDueDate(), { weekday: true });
