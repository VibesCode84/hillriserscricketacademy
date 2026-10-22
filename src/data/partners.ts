/**
 * Net bookings for coaches and delivery partners (private portal at /partners).
 *
 * - Block bookings only: a net at the same time every week for a whole block.
 * - £18.80 per net per hour (the block rate); the bowling machine is £10 per hour on top.
 * - There is ONE bowling machine, so it can go on one net per time slot.
 * - Only the slots listed here are released. Update this file to release the
 *   next block or change what is available.
 */

/** Block rate: block bookings only, so there is no separate per-session rate */
export const PARTNER_RATE_PENCE = 1880;
export const BOWLING_MACHINE_PENCE = 1000;
export const NETS = [1, 2, 3] as const;
/** How long slots are held while a partner pays */
export const PARTNER_HOLD_MINUTES = 30;

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
  /**
   * Partners may reserve with a deposit instead of paying in full. The balance
   * is due by midnight (UK time) at the end of their last session in `dueAfterBlock`.
   */
  deposit?: { percent: number; dueAfterBlock: string };
};

const hourly = (day: PartnerDay, from: string, to: string, nets: number[], dates: string[]): SlotTemplate[] => {
  const out: SlotTemplate[] = [];
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  for (let m = toMin(from); m + 60 <= toMin(to); m += 60) out.push({ day, start: fmt(m), end: fmt(m + 60), nets, dates });
  return out;
};

const wednesdays = ["2026-11-25", "2026-12-02", "2026-12-09"];
const thursdays = ["2026-11-05", "2026-11-12", "2026-11-19", "2026-11-26", "2026-12-03", "2026-12-10"];
const saturdays = ["2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28", "2026-12-05", "2026-12-12"];
const sundays = ["2026-11-08", "2026-11-15", "2026-11-22", "2026-11-29", "2026-12-06", "2026-12-13"];

/** Spring 2027: 11 weeks, 4 January – 28 March, skipping half term (15–21 February) */
const springWeek = (first: string) => {
  const out: string[] = [];
  for (let d = new Date(`${first}T12:00:00Z`); d <= new Date("2027-03-28T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 7)) {
    const iso = d.toISOString().slice(0, 10);
    if (iso < "2027-02-15" || iso > "2027-02-21") out.push(iso);
  }
  return out;
};

export const partnerBlocks: PartnerBlock[] = [
  {
    id: "autumn-2026",
    label: "Autumn block 2026",
    summary: "November to 13 December 2026",
    notes: [
      "Wednesdays: from 25 November (the hall is booked for netball until 18 November).",
      "Thursdays: two nets available.",
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
    deposit: { percent: 25, dueAfterBlock: "autumn-2026" },
    summary: "6 January to 28 March 2027 (11 weeks)",
    notes: [
      "Open to partners who have booked the autumn block.",
      "Pay in full, or reserve with a deposit and pay the balance by midnight after your last autumn session.",
      "No sessions in half term (15–21 February).",
      "Thursdays: two nets available.",
      "Includes the Easter weekend (27–28 March).",
    ],
    slots: [
      ...hourly("Wednesday", "18:00", "21:00", [1, 2, 3], springWeek("2027-01-06")),
      ...hourly("Thursday", "18:00", "21:00", [1, 2], springWeek("2027-01-07")),
      ...hourly("Saturday", "14:30", "17:30", [1, 2, 3], springWeek("2027-01-09")),
      ...hourly("Sunday", "09:00", "17:00", [1, 2, 3], springWeek("2027-01-10")),
    ],
  },
];

export const getBlock = (id: string) => partnerBlocks.find((b) => b.id === id);

/** Whether a partner's bookings let them book this block (see requiresBlock) */
export const blockUnlocked = (block: PartnerBlock, bookings: { blockId: string; status: string }[]) =>
  !block.requiresBlock || bookings.some((b) => b.blockId === block.requiresBlock && b.status === "confirmed");

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
  s.dates.length * (PARTNER_RATE_PENCE + (bowlingMachine ? BOWLING_MACHINE_PENCE : 0));

/** Deposit for a block booking (the full amount when the block takes no deposits) */
export const depositFor = (block: PartnerBlock, totalPence: number) =>
  block.deposit ? Math.round((totalPence * block.deposit.percent) / 100) : totalPence;

/** A partner's last paid session date (ISO) in a block — sets the deadline for a deposit balance */
export function lastSessionDate(blockId: string, bookings: { blockId: string; status: string; items: { slotKey: string }[] }[]) {
  let last: string | undefined;
  for (const b of bookings) {
    if (b.blockId !== blockId || b.status !== "confirmed") continue;
    for (const i of b.items) {
      const d = findSlot(blockId, i.slotKey)?.slot.dates.at(-1);
      if (d && (!last || d > last)) last = d;
    }
  }
  return last;
}

/** Midnight UK time at the end of a date ("2026-12-13" → 14 Dec 00:00 London) */
export function endOfDayLondon(iso: string) {
  const next = new Date(`${iso}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  // London is UTC or UTC+1; at UTC midnight it reads 0 or 1 o'clock
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hourCycle: "h23" }).format(next));
  return new Date(next.getTime() - hour * 3_600_000);
}

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
