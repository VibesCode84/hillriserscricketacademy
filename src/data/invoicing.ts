/**
 * How partners pay: bank transfer against an invoice (no fee, due on receipt, payable within 24 hours) or card through
 * Stripe with a card processing fee that covers Stripe's charge.
 *
 * Bank transfer stays switched off until the bank details below are filled in.
 */

export const company = {
  legalName: "HillRisers CIC",
  companyNumber: "17511172",
  registeredOffice: "53 Sharps Lane, Ruislip, Middlesex, HA4 7JD" as string | undefined,
  email: "office@hillrisers.co.uk",
};

export const bankDetails = {
  accountName: "HILLRISERS CIC" as string | undefined,
  sortCode: "08-92-99" as string | undefined,
  accountNumber: "67562992" as string | undefined,
};

export const bankTransferEnabled = () => !!(bankDetails.accountName && bankDetails.sortCode && bankDetails.accountNumber);

/** Invoices are due on receipt and must be paid within this many hours; unpaid ones then release their nets */
export const INVOICE_DUE_HOURS = 24;
export const invoiceNumber = (n: number) => `HR-${String(n).padStart(4, "0")}`;

/** Stripe's charge on a standard UK card */
export const STRIPE_PERCENT = 1.5;
export const STRIPE_FIXED_PENCE = 20;

/**
 * Card processing fee added to a card payment, grossed up so that after Stripe takes its
 * 1.5% + 20p from the whole amount HillRisers still receives the full price. Rounded up.
 */
export const cardFeePence = (amountPence: number) =>
  Math.ceil((amountPence + STRIPE_FIXED_PENCE) / (1 - STRIPE_PERCENT / 100)) - amountPence;

/** Whether a due time has passed */
export const isPast = (iso: string) => Date.parse(iso) < Date.now();

/** ISO time a number of days ago */
export const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * A UK-time date and time, e.g. "8:40am, Saturday 24 October" (short: "8:40am Sat 24 Oct").
 * Built by hand so the server and the browser always render the same text.
 */
export function ukDateTime(iso: string, style: "long" | "short" = "long") {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  const [y, m, d, h, min] = [parts.year, parts.month, parts.day, parts.hour, parts.minute].map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const time = `${h % 12 === 0 ? 12 : h % 12}:${String(min).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
  return style === "short" ? `${time} ${weekday.slice(0, 3)} ${d} ${MONTHS[m - 1].slice(0, 3)}` : `${time}, ${weekday} ${d} ${MONTHS[m - 1]}`;
}
