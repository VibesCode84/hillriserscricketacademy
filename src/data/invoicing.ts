/** How partners pay: invoice only, by bank transfer within 24 hours of each invoice */

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

/** Invoices must be paid within this many hours; an unpaid first invoice then releases its nets */
export const INVOICE_DUE_HOURS = 24;
export const invoiceNumber = (n: number) => `HR-${String(n).padStart(4, "0")}`;

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
