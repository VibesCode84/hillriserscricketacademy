/**
 * Net bookings for coaches and delivery partners (private portal at /partners).
 *
 * - Block bookings only: a net at the same time every week for a whole block.
 * - £18.80 per net per hour (the block rate); the bowling machine is £10 per hour on top.
 * - Partners send a booking request (first come, first served); HillRisers approves it, which issues
 *   the invoice (bank transfer within 24 hours); the first payment confirms the booking.
 * - Monthly or termly in advance; sessions up to Christmas are invoiced in full.
 * - Until PRIORITY_UNTIL_DATE ends, only partners with a priority code can send requests.
 * - There is ONE bowling machine, so it can go on one net per time slot.
 * - Only the slots listed here are released. Update this file to release the
 *   next block or change what is available.
 */

/** Block rate: block bookings only, so there is no separate per-session rate */
export const PARTNER_RATE_PENCE = 1880;
export const BOWLING_MACHINE_PENCE = 1000;
export const NETS = [1, 2, 3] as const;

/** Priority booking for invited partners (with a priority code) until 11:59pm UK time on this date */
export const PRIORITY_UNTIL_DATE = "2026-11-08";

/** Payment terms: one invoice for the whole block, or one per calendar month, both in advance */
export type PaymentTerms = "termly" | "monthly";
/** A month's invoice is issued this many days before that month's first session (8am UK time) */
export const MONTHLY_INVOICE_DAYS_BEFORE = 7;
/** Sessions up to this date are invoiced in full in the first invoice, whatever the payment terms */
export const FULL_PAYMENT_UNTIL = "2026-12-31";
/** Refunds only if a booking is cancelled more than this many days before its first session */
export const REFUND_DAYS_BEFORE = 7;

export type PartnerDay = "Wednesday" | "Thursday" | "Saturday" | "Sunday";

export type SlotTemplate = {
  day: PartnerDay;
  /** "18:00" */
  start: string;
  end: string;
  /** Nets released in this slot */
  nets: number[];
  /** Weeks in the block (ISO dates) */
  dates: string[];
  /** Overrides the partner rate / bowling machine price (used by the £1 Stripe test) */
  ratePence?: number;
  machinePence?: number;
};

export type PartnerBlock = {
  id: string;
  label: string;
  /** Shown under the block name */
  summary: string;
  notes: string[];
  slots: SlotTemplate[];
  /** Only partners with a paid booking in this block can book this one */
  requiresBlock?: string;
  /** Test booking: only shown to test accounts (PARTNER_TEST_EMAILS), never fills up, ignores the priority window */
  test?: boolean;
};

const hourly = (day: PartnerDay, from: string, to: string, nets: number[], dates: string[]): SlotTemplate[] => {
  const out: SlotTemplate[] = [];
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  for (let m = toMin(from); m + 60 <= toMin(to); m += 60) out.push({ day, start: fmt(m), end: fmt(m + 60), nets, dates });
  return out;
};

/** Autumn: from the week commencing 16 November; Wednesdays from 25 November; Saturdays from 5 December */
const wednesdays = ["2026-11-25", "2026-12-02", "2026-12-09"];
const thursdays = ["2026-11-19", "2026-11-26", "2026-12-03", "2026-12-10"];
const saturdays = ["2026-12-05", "2026-12-12"];
const sundays = ["2026-11-22", "2026-11-29", "2026-12-06", "2026-12-13"];

/** Spring 2027: 12 weeks, 4 January – 28 March, including half term (15–21 February) */
const springWeek = (first: string) => {
  const out: string[] = [];
  for (let d = new Date(`${first}T12:00:00Z`); d <= new Date("2027-03-28T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 7)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

export const partnerBlocks: PartnerBlock[] = [
  {
    id: "autumn-2026",
    label: "Autumn block 2026",
    summary: "Week commencing 16 November to 13 December 2026",
    notes: [
      "Thursdays and Sundays start in the week commencing 16 November. Wednesdays start on 25 November.",
      "Saturdays: 5 and 12 December only (not available on 21 or 28 November).",
      "Sessions up to Christmas are invoiced in full.",
      "No sessions over the Christmas shutdown (21 December – 3 January).",
    ],
    slots: [
      ...hourly("Wednesday", "18:00", "21:00", [1, 2, 3], wednesdays),
      ...hourly("Thursday", "18:00", "21:00", [1, 2], thursdays),
      ...hourly("Saturday", "14:30", "17:30", [1, 2, 3], saturdays),
      ...hourly("Sunday", "09:00", "17:00", [1, 2, 3], sundays),
    ],
  },
  {
    id: "spring-2027",
    label: "Spring block 2027",
    requiresBlock: "autumn-2026",
    summary: "6 January to 28 March 2027 (12 weeks, including half term)",
    notes: [
      "Open to partners who have booked the autumn block.",
      "Includes the Easter weekend (27–28 March).",
    ],
    slots: [
      ...hourly("Wednesday", "18:00", "21:00", [1, 2, 3], springWeek("2027-01-06")),
      ...hourly("Thursday", "18:00", "21:00", [1, 2], springWeek("2027-01-07")),
      ...hourly("Saturday", "14:30", "17:30", [1, 2, 3], springWeek("2027-01-09")),
      ...hourly("Sunday", "09:00", "17:00", [1, 2, 3], springWeek("2027-01-10")),
    ],
  },
  {
    id: "stripe-test",
    label: "Test booking (£1)",
    summary: "Only visible to HillRisers test accounts",
    notes: [
      "Issues a real £1 invoice so the invoicing can be checked. Not a real session. It can be booked any number of times.",
    ],
    test: true,
    slots: [{ day: "Sunday", start: "09:00", end: "10:00", nets: [1], dates: ["2026-12-27"], ratePence: 100, machinePence: 0 }],
  },
];

/** Real blocks (everything bar the test booking) */
export const releasedBlocks = partnerBlocks.filter((b) => !b.test);

export const getBlock = (id: string) => partnerBlocks.find((b) => b.id === id);

/** What a block offers, one row per day: times and weeks */
export function blockDays(block: PartnerBlock) {
  const days = new Map<PartnerDay, SlotTemplate[]>();
  for (const s of block.slots) days.set(s.day, [...(days.get(s.day) ?? []), s]);
  return [...days.entries()].map(([day, slots]) => ({
    day,
    from: slots[0].start,
    to: slots.at(-1)!.end,
    dates: slots[0].dates,
  }));
}

/** Whether a partner's bookings let them request this block: a live request or booking in requiresBlock */
export const blockUnlocked = (block: PartnerBlock, bookings: { blockId: string; status: string }[]) =>
  !block.requiresBlock || bookings.some((b) => b.blockId === block.requiresBlock && ["requested", "pending_payment", "confirmed"].includes(b.status));

/** One bookable net in one weekly slot, e.g. "autumn-2026:Saturday:14:30:n2" */
export const slotKey = (blockId: string, s: Pick<SlotTemplate, "day" | "start">, net: number) => `${blockId}:${s.day}:${s.start}:n${net}`;
/** The bowling machine in one weekly slot (one machine, shared by all nets) */
export const machineKey = (blockId: string, s: Pick<SlotTemplate, "day" | "start">) => `${blockId}:${s.day}:${s.start}:machine`;

export function findSlot(blockId: string, key: string) {
  const block = getBlock(blockId);
  if (!block) return undefined;
  for (const s of block.slots) for (const n of s.nets) if (slotKey(blockId, s, n) === key) return { block, slot: s, net: n };
  return undefined;
}

/** Price of booking one net for the whole block, optionally with the bowling machine */
export const itemPricePence = (s: SlotTemplate, bowlingMachine: boolean) =>
  s.dates.length * ((s.ratePence ?? PARTNER_RATE_PENCE) + (bowlingMachine ? (s.machinePence ?? BOWLING_MACHINE_PENCE) : 0));

/** Price of one net's sessions in each calendar month ("2026-11"), from its weekly dates */
export function monthlySplit(items: { slotKey: string; pricePence: number; weeks: number }[], blockId: string) {
  const months = new Map<string, { pence: number; firstSession: string }>();
  for (const i of items) {
    const dates = findSlot(blockId, i.slotKey)?.slot.dates ?? [];
    const perWeek = dates.length ? i.pricePence / dates.length : 0;
    for (const d of dates) {
      const m = d.slice(0, 7);
      const cur = months.get(m) ?? { pence: 0, firstSession: d };
      months.set(m, { pence: cur.pence + perWeek, firstSession: d < cur.firstSession ? d : cur.firstSession });
    }
  }
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, pence: Math.round(v.pence), firstSession: v.firstSession }));
}

/** When a month's invoice is issued: 8am UK time, MONTHLY_INVOICE_DAYS_BEFORE days before its first session */
export const monthInvoiceAt = (firstSession: string) => londonTime(addDays(firstSession, -MONTHLY_INVOICE_DAYS_BEFORE), REMINDER_HOUR);

/**
 * Months the first invoice covers on monthly terms: the first month, every month up to FULL_PAYMENT_UNTIL
 * (sessions up to Christmas are paid in full), and any whose invoice would already be due.
 */
export const firstInvoiceMonths = <T extends { firstSession: string }>(months: T[], at = Date.now()) =>
  months.filter((m, idx) => idx === 0 || m.firstSession <= FULL_PAYMENT_UNTIL || monthInvoiceAt(m.firstSession).getTime() <= at);

/** "November 2026" */
export const monthLabel = (month: string) =>
  new Date(`${month}-15T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Priority booking ends at midnight UK time at the end of PRIORITY_UNTIL_DATE */
export const priorityEndsAt = () => endOfDayLondon(PRIORITY_UNTIL_DATE);
export const priorityWindowOpen = (at = Date.now()) => at < priorityEndsAt().getTime();
/** "11:59pm on Sunday 8 November" */
export const priorityEndsLabel = () => `11:59pm on ${longDate(PRIORITY_UNTIL_DATE)}`;

/** Midnight UK time at the end of a date ("2026-12-13" → 14 Dec 00:00 London) */
export function endOfDayLondon(iso: string) {
  const next = new Date(`${iso}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  // London is UTC or UTC+1; at UTC midnight it reads 0 or 1 o'clock
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hourCycle: "h23" }).format(next));
  return new Date(next.getTime() - hour * 3_600_000);
}

/** A clock time in UK time on a date, e.g. londonTime("2026-11-05", 8) → 08:00 London */
export function londonTime(iso: string, hour: number) {
  const midday = new Date(`${iso}T12:00:00Z`);
  const offset = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hourCycle: "h23" }).format(midday)) - 12;
  return new Date(Date.UTC(midday.getUTCFullYear(), midday.getUTCMonth(), midday.getUTCDate(), hour - offset));
}

/** The UK date (ISO) of an instant */
export const londonDate = (at: Date | string) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Europe/London" });

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Invoice emails and reminders go out at this hour (UK time) */
export const REMINDER_HOUR = 8;

/** "Sunday 13 December" */
export function longDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

/** "6:30pm" style label for a 24h time */
export function timeLabel(t: string) {
  const h = Number(t.slice(0, 2));
  const m = t.slice(3);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m === "00" ? "" : `:${m}`}${h < 12 ? "am" : "pm"}`;
}

/** "Sat 7 Nov" */
export function shortDate(iso: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(iso.slice(8))} ${months.at(Number(iso.slice(5, 7)) - 1)}`;
}

export const documentKinds = [
  { value: "qualification", label: "Coaching qualification (e.g. ECB Level 2)" },
  { value: "dbs", label: "DBS certificate" },
  { value: "safeguarding", label: "Safeguarding training certificate" },
  { value: "first-aid", label: "First aid certificate" },
  { value: "insurance", label: "Public liability insurance" },
  { value: "other", label: "Other" },
] as const;
export type DocumentKind = (typeof documentKinds)[number]["value"];
/** Compliance documents every partner must send before a booking shows as booked */
export const requiredDocumentKinds: DocumentKind[] = ["qualification", "dbs", "safeguarding", "insurance"];

/** Who each booked session is for — partners choose one of each per net */
export const sessionAgeGroups = ["Under 7", "Under 9", "Under 11", "Under 13", "Under 15", "Under 18", "Adults", "Mixed ages"] as const;
export const sessionAbilities = ["Beginner", "Developing", "Intermediate", "Advanced", "Mixed abilities"] as const;
export const sessionGenders = ["Female", "Male", "Mixed"] as const;

export const partnerTypes = ["Coach", "Club", "School", "Coaching company", "Other"] as const;

/** Uploads: up to 10 MB, PDF, images or Word documents */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const allowedUploadTypes: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
