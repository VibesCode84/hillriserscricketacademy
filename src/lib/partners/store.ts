import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashPassword, verifyPassword } from "./password";
import { INVOICE_DUE_HOURS, invoiceNumber } from "../../data/invoicing";
import {
  blockUnlocked,
  findSlot,
  firstInvoiceMonths,
  getBlock,
  heldNets,
  itemPricePence,
  londonDate,
  londonTime,
  machineKey,
  priorityEndsLabel,
  priorityWindowOpen,
  REMINDER_HOUR,
  slotKey,
  type DocumentKind,
  type PartnerDay,
  type PaymentTerms,
} from "../../data/partners";
import type { D1Database } from "../booking/d1-store";
import { monthsToInvoice } from "./describe";

export { monthsToInvoice, paidToDate } from "./describe";

/* ── Types ─────────────────────────────────────────────────────────────── */

export type Partner = {
  id: string;
  /** sha256 of the current emailed sign-in link's key: single use, expires after SIGN_IN_LINK_MINUTES */
  keyHash?: string;
  keyExpiresAt?: string;
  /** PBKDF2 password hash (see password.ts) */
  passwordHash?: string;
  /** Signed-in devices: sha256 of each session token (expire after SESSION_DAYS) */
  sessions?: { hash: string; createdAt: string }[];
  /** Wrong-password lockout */
  failedLogins?: number;
  lockedUntil?: string;
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  type: string;
  /** No longer asked; kept for early registrations */
  sports?: string;
  website?: string;
  about?: string;
  /** Redeemed priority code (see PriorityCode) */
  priorityCode?: string;
  createdAt: string;
};

/** A priority code for an invited partner: books during the priority window, and unlocks a hold if linked */
export type PriorityCode = {
  code: string;
  /** Who it's for, e.g. "Sanjiv" */
  name: string;
  /** netHolds id this code can book */
  holdId?: string;
  createdAt: string;
  redeemedBy?: string;
  redeemedAt?: string;
};

export type DocumentReview = "pending" | "approved" | "rejected";

export type PartnerDocument = {
  id: string;
  partnerId: string;
  kind: DocumentKind;
  filename: string;
  contentType: string;
  size: number;
  expiresOn?: string;
  uploadedAt: string;
  review: DocumentReview;
  reviewNote?: string;
};

export type NetBookingItem = {
  slotKey: string;
  day: PartnerDay;
  start: string;
  end: string;
  net: number;
  weeks: number;
  bowlingMachine: boolean;
  /** Who the session is for */
  ageGroup?: string;
  ability?: string;
  gender?: string;
  pricePence: number;
};

export type PaymentMethod = "card" | "bank";

/**
 * A bank-transfer invoice, payable within INVOICE_DUE_HOURS. "initial" is the first one for a booking
 * (the whole block when termly; the first month(s) when monthly); "month" is a later monthly one.
 * "balance" belongs to the earlier deposit scheme.
 */
export type PartnerInvoice = {
  number: string;
  stage: "initial" | "month" | "balance";
  /** Months covered ("2026-11"), for monthly payment terms */
  months?: string[];
  amountPence: number;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  /** Overdue reminder days already emailed (ISO dates) */
  remindersSent?: string[];
};

/** reserved = deposit paid, balance still due; forfeited = balance missed its deadline (shown, never stored) */
export type NetBookingStatus = "pending_payment" | "reserved" | "confirmed" | "cancelled" | "expired" | "forfeited";

export type NetBooking = {
  id: string;
  partnerId: string;
  blockId: string;
  items: NetBookingItem[];
  /** Level 2 coach operating the bowling machine */
  machineCoach?: string;
  totalPence: number;
  /** Payment terms (earlier bookings: "full" or "deposit") */
  plan?: PaymentTerms | "full" | "deposit";
  /** A card holding deposit for a bank-transfer booking: the balance is invoiced once it's paid */
  holding?: boolean;
  /** How the first payment was (or is being) made; card adds a card processing fee */
  method?: PaymentMethod;
  cardFeePence?: number;
  balanceMethod?: PaymentMethod;
  balanceCardFeePence?: number;
  invoices?: PartnerInvoice[];
  depositPence?: number;
  /** First autumn session date (ISO); balance reminders start two weeks after it */
  firstSessionDate?: string;
  /** Last autumn session date (ISO); the balance is due by midnight at the end of it */
  balanceDueDate?: string;
  balanceDueAt?: string;
  balanceCheckoutId?: string;
  balancePaymentIntentId?: string;
  balancePaidAt?: string;
  /** Balance reminder days already emailed (ISO dates) */
  remindersSent?: string[];
  status: NetBookingStatus;
  holdExpiresAt?: string;
  checkoutId?: string;
  paymentIntentId?: string;
  createdAt: string;
  paidAt?: string;
};

type Data = { partners: Partner[]; documents: PartnerDocument[]; bookings: NetBooking[]; priorityCodes?: PriorityCode[]; invoiceSeq?: number };
const empty = (): Data => ({ partners: [], documents: [], bookings: [] });

/* ── Storage backends: a versioned JSON document plus file blobs ───────── */

interface Backend {
  load(): Promise<{ data: Data; version: number }>;
  /** Saves only if nobody has written since `version`; false on conflict */
  save(data: Data, version: number): Promise<boolean>;
  putBlob(id: string, bytes: Uint8Array): Promise<void>;
  getBlob(id: string): Promise<Uint8Array | undefined>;
}

/** Local development: a JSON file and an uploads folder */
class FileBackend implements Backend {
  constructor(private dir: string) {}
  private get file() {
    return path.join(this.dir, "partners.json");
  }
  async load() {
    try {
      const doc = JSON.parse(await fs.readFile(this.file, "utf8")) as { version: number; data: Data };
      return { data: { ...empty(), ...doc.data }, version: doc.version };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return { data: empty(), version: 0 };
      throw err;
    }
  }
  async save(data: Data, version: number) {
    const current = await this.load();
    if (current.version !== version) return false;
    await fs.mkdir(this.dir, { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify({ version: version + 1, data }, null, 2));
    await fs.rename(tmp, this.file);
    return true;
  }
  async putBlob(id: string, bytes: Uint8Array) {
    await fs.mkdir(path.join(this.dir, "uploads"), { recursive: true });
    await fs.writeFile(path.join(this.dir, "uploads", id), bytes);
  }
  async getBlob(id: string) {
    try {
      return new Uint8Array(await fs.readFile(path.join(this.dir, "uploads", id)));
    } catch {
      return undefined;
    }
  }
}

/** Cloudflare D1: the document in store_doc (id "partners"), files split into chunks */
class D1Backend implements Backend {
  private ready?: Promise<unknown>;
  constructor(private db: D1Database) {}
  private static CHUNK = 512 * 1024;
  private init() {
    this.ready ??= this.db
      .batch([
        this.db.prepare("CREATE TABLE IF NOT EXISTS store_doc (id TEXT PRIMARY KEY, version INTEGER NOT NULL, data TEXT NOT NULL)"),
        this.db.prepare("CREATE TABLE IF NOT EXISTS blob_chunks (id TEXT NOT NULL, seq INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (id, seq))"),
      ])
      .catch((err) => {
        this.ready = undefined;
        throw err;
      });
    return this.ready;
  }
  async load() {
    await this.init();
    const row = await this.db.prepare("SELECT version, data FROM store_doc WHERE id = 'partners'").first<{ version: number; data: string }>();
    return { data: { ...empty(), ...(row ? JSON.parse(row.data) : {}) }, version: row?.version ?? 0 };
  }
  async save(data: Data, version: number) {
    const json = JSON.stringify(data);
    const res =
      version === 0
        ? await this.db.prepare("INSERT INTO store_doc (id, version, data) VALUES ('partners', 1, ?) ON CONFLICT (id) DO NOTHING").bind(json).run()
        : await this.db.prepare("UPDATE store_doc SET data = ?, version = version + 1 WHERE id = 'partners' AND version = ?").bind(json, version).run();
    return res.meta.changes === 1;
  }
  async putBlob(id: string, bytes: Uint8Array) {
    await this.init();
    const stmts = [];
    for (let i = 0, seq = 0; i < bytes.length; i += D1Backend.CHUNK, seq++) {
      stmts.push(this.db.prepare("INSERT INTO blob_chunks (id, seq, data) VALUES (?, ?, ?)").bind(id, seq, bytes.slice(i, i + D1Backend.CHUNK)));
    }
    await this.db.batch(stmts);
  }
  async getBlob(id: string) {
    await this.init();
    const { results } = await this.db.prepare("SELECT data FROM blob_chunks WHERE id = ? ORDER BY seq").bind(id).all<{ data: ArrayBuffer | number[] }>();
    if (!results.length) return undefined;
    const parts = results.map((r) => (r.data instanceof ArrayBuffer ? new Uint8Array(r.data) : Uint8Array.from(r.data)));
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  }
}

/* ── The store ─────────────────────────────────────────────────────────── */

export const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

/** Signed-in sessions last this long */
export const SESSION_DAYS = 60;
/** Emailed sign-in links work once, within this time */
export const SIGN_IN_LINK_MINUTES = 60;
/** Wrong passwords before a lockout, and how long it lasts */
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;

const newToken = () => randomBytes(24).toString("base64url");
const liveSessions = (p: Partner, at = Date.now()) => (p.sessions ?? []).filter((s) => Date.parse(s.createdAt) + SESSION_DAYS * 86_400_000 > at);

/** Adds a signed-in session for a partner (keeps the latest 10 live ones) and returns its token */
function addSession(p: Partner) {
  const token = newToken();
  p.sessions = [...liveSessions(p), { hash: hashKey(token), createdAt: new Date().toISOString() }].slice(-10);
  return token;
}

export type LoginResult = { ok: true; partner: Partner; token: string } | { ok: false; locked: boolean };
const now = () => new Date().toISOString();

/** A slot is taken by a confirmed booking or by an invoice that's still within its payment time */
export const holds = (b: NetBooking, at = Date.now()) =>
  b.status === "confirmed" ||
  (b.status === "pending_payment" && !!b.holdExpiresAt && Date.parse(b.holdExpiresAt) > at) ||
  (b.status === "reserved" && !!b.balanceDueAt && Date.parse(b.balanceDueAt) > at);

/** Deposit paid but the balance missed its deadline: the nets are released and the deposit kept */
export const balanceOverdue = (b: NetBooking, at = Date.now()) => b.status === "reserved" && !holds(b, at);

/** How a booking reads now: a lapsed reservation shows as forfeited, a lapsed hold as expired */
const view = (b: NetBooking): NetBooking =>
  balanceOverdue(b) ? { ...b, status: "forfeited" } : b.status === "pending_payment" && !holds(b) ? { ...b, status: "expired" } : b;

/**
 * A partner's unpaid invoice, if any — partners can have one at a time. A first invoice counts while its
 * nets are held; a monthly invoice counts until it's paid.
 */
function openInvoice(d: Data, partnerId: string, at = Date.now()) {
  for (const b of d.bookings) {
    if (b.partnerId !== partnerId) continue;
    for (const i of b.invoices ?? []) {
      if (i.paidAt) continue;
      if (i.stage === "initial" && b.status === "pending_payment" && Date.parse(i.dueAt) > at) return i;
      if (i.stage === "month" && b.status === "confirmed") return i;
    }
  }
  return undefined;
}

const unpaidMessage = (i: PartnerInvoice) => `You have an unpaid invoice (${i.number}). Please pay it before making another booking.`;

function newInvoice(d: Data, stage: PartnerInvoice["stage"], amountPence: number, at: number, months?: string[]): PartnerInvoice {
  d.invoiceSeq = (d.invoiceSeq ?? 0) + 1;
  return { number: invoiceNumber(d.invoiceSeq), stage, months, amountPence, issuedAt: new Date(at).toISOString(), dueAt: new Date(at + INVOICE_DUE_HOURS * 3_600_000).toISOString() };
}

/** Readable code, no look-alike characters: "HR-7K3M9P" */
function newCode(existing: Set<string>) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (;;) {
    const code = `HR-${Array.from({ length: 6 }, () => chars[randomInt(chars.length)]).join("")}`;
    if (!existing.has(code)) return code;
  }
}

const normaliseCode = (code: string) => {
  const c = code.trim().toUpperCase().replace(/\s+/g, "");
  return c.startsWith("HR-") ? c : `HR-${c.replace(/^HR/, "")}`;
};

/** The priority code a partner has redeemed */
const codeFor = (d: Data, partnerId: string) => {
  const p = d.partners.find((x) => x.id === partnerId);
  return p?.priorityCode ? d.priorityCodes?.find((c) => c.code === p.priorityCode) : undefined;
};

export type RedeemResult = { ok: true; code: PriorityCode } | { ok: false; message: string };

function redeem(d: Data, p: Partner, raw: string): RedeemResult {
  const code = d.priorityCodes?.find((c) => c.code === normaliseCode(raw));
  if (!code) return { ok: false, message: "That priority code isn't recognised. Please check it and try again." };
  if (code.redeemedBy && code.redeemedBy !== p.id) return { ok: false, message: "That priority code has already been used." };
  Object.assign(code, { redeemedBy: p.id, redeemedAt: code.redeemedAt ?? now() });
  p.priorityCode = code.code;
  return { ok: true, code };
}

/** Records a first payment (→ confirmed) or a deposit balance from the earlier scheme */
function settle(d: Data, b: NetBooking, stage: "initial" | "balance", p: { method: PaymentMethod; paymentIntentId?: string; cardFeePence?: number }) {
  const at = now();
  if (stage === "balance") {
    if (b.status !== "reserved") return b;
    Object.assign(b, { status: "confirmed", balancePaidAt: at, balancePaymentIntentId: p.paymentIntentId, balanceMethod: p.method, balanceCardFeePence: p.cardFeePence });
  } else {
    if (b.status === "confirmed" || b.status === "reserved") return b;
    Object.assign(b, { status: b.plan === "deposit" ? "reserved" : "confirmed", paidAt: at, paymentIntentId: p.paymentIntentId, method: p.method, cardFeePence: p.cardFeePence, holdExpiresAt: undefined });
  }
  for (const inv of b.invoices ?? []) if (inv.stage === stage && !inv.paidAt) inv.paidAt = at;
  return b;
}

/** Balance still to pay on a reserved booking */
export const balanceDue = (b: NetBooking) => b.totalPence - (b.depositPence ?? b.totalPence);

export type ReserveResult =
  | { ok: true; booking: NetBooking }
  | { ok: false; reason: "taken" | "invalid" | "locked"; keys?: string[]; message: string };

export class PartnerStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private backend: Backend) {}

  /** Read-modify-write with a version check, retried on conflict (safe across server instances) */
  private tx<T>(fn: (data: Data) => T): Promise<T> {
    const run = this.queue.then(async () => {
      for (let attempt = 0; attempt < 8; attempt++) {
        const { data, version } = await this.backend.load();
        const result = fn(data);
        if (await this.backend.save(data, version)) return result;
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 80));
      }
      throw new Error("Could not save — please try again.");
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async read() {
    return (await this.backend.load()).data;
  }

  /* Partners */

  /**
   * Creates a partner and signs them in: returns a session token for the cookie. A priority code, if
   * given, must be valid (nothing is created otherwise).
   */
  async createPartner(
    input: Omit<Partner, "id" | "createdAt" | "keyHash" | "keyExpiresAt" | "passwordHash" | "sessions" | "failedLogins" | "lockedUntil"> & { password?: string },
  ): Promise<{ partner: Partner; token: string; error?: undefined } | { error: string; partner?: undefined; token?: undefined }> {
    const { password, priorityCode, ...details } = input;
    const passwordHash = password ? await hashPassword(password) : undefined;
    return this.tx((d) => {
      const p: Partner = { ...details, email: details.email.trim().toLowerCase(), id: randomUUID(), passwordHash, createdAt: now() };
      if (priorityCode) {
        const r = redeem(d, p, priorityCode);
        if (!r.ok) return { error: r.message };
      }
      const token = addSession(p);
      d.partners.push(p);
      return { partner: p, token };
    });
  }

  /* Priority codes */

  /** Admin: a new priority code for a named partner, optionally linked to a hold */
  createPriorityCode(name: string, holdId?: string) {
    return this.tx((d) => {
      const code: PriorityCode = { code: newCode(new Set((d.priorityCodes ?? []).map((c) => c.code))), name: name.trim(), holdId: holdId || undefined, createdAt: now() };
      d.priorityCodes = [...(d.priorityCodes ?? []), code];
      return code;
    });
  }

  /** Admin: removes a code that hasn't been used */
  deletePriorityCode(code: string) {
    return this.tx((d) => {
      const c = d.priorityCodes?.find((x) => x.code === code);
      if (!c || c.redeemedBy) return false;
      d.priorityCodes = d.priorityCodes!.filter((x) => x !== c);
      return true;
    });
  }

  async listPriorityCodes() {
    return [...((await this.read()).priorityCodes ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** A partner enters a priority code in the portal */
  redeemPriorityCode(partnerId: string, raw: string) {
    return this.tx<RedeemResult>((d) => {
      const p = d.partners.find((x) => x.id === partnerId);
      if (!p) return { ok: false, message: "Please sign in again." };
      if (p.priorityCode && p.priorityCode !== normaliseCode(raw)) return { ok: false, message: "Your account already has a priority code." };
      return redeem(d, p, raw);
    });
  }

  /** A partner's priority code (and the hold it unlocks), if they have one */
  async priorityFor(partnerId: string) {
    return codeFor(await this.read(), partnerId);
  }

  async partnerByEmail(email: string) {
    return (await this.read()).partners.find((x) => x.email === email.trim().toLowerCase());
  }

  /** The signed-in partner, from a live session token */
  async partnerBySession(token: string | undefined) {
    if (!token) return undefined;
    const h = hashKey(token);
    return (await this.read()).partners.find((p) => liveSessions(p).some((s) => s.hash === h));
  }

  /**
   * Email and password sign-in. After MAX_FAILED_LOGINS wrong passwords the account is locked for
   * LOCKOUT_MINUTES (an emailed sign-in link still works).
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const p = await this.partnerByEmail(email);
    if (!p) return { ok: false, locked: false };
    if (p.lockedUntil && Date.parse(p.lockedUntil) > Date.now()) return { ok: false, locked: true };
    const ok = await verifyPassword(password, p.passwordHash);
    return this.tx<LoginResult>((d) => {
      const x = d.partners.find((y) => y.id === p.id);
      if (!x) return { ok: false, locked: false };
      if (!ok) {
        x.failedLogins = (x.failedLogins ?? 0) + 1;
        if (x.failedLogins >= MAX_FAILED_LOGINS) {
          x.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString();
          x.failedLogins = 0;
          return { ok: false, locked: true };
        }
        return { ok: false, locked: false };
      }
      x.failedLogins = 0;
      x.lockedUntil = undefined;
      return { ok: true, partner: x, token: addSession(x) };
    });
  }

  /** Signing out ends this device's session */
  endSession(token: string | undefined) {
    if (!token) return Promise.resolve(undefined);
    const h = hashKey(token);
    return this.tx((d) => {
      for (const p of d.partners) if (p.sessions?.some((s) => s.hash === h)) p.sessions = p.sessions.filter((s) => s.hash !== h);
    });
  }

  /**
   * Sets a new password and signs out every other device (and cancels any sign-in link).
   * Returns a fresh session token for this device.
   */
  async setPassword(partnerId: string, password: string) {
    const passwordHash = await hashPassword(password);
    return this.tx((d) => {
      const p = d.partners.find((x) => x.id === partnerId);
      if (!p) return undefined;
      Object.assign(p, { passwordHash, sessions: [], keyHash: undefined, keyExpiresAt: undefined, failedLogins: 0, lockedUntil: undefined });
      return { partner: p, token: addSession(p) };
    });
  }

  /** Issues a single-use sign-in link key, valid for SIGN_IN_LINK_MINUTES (any earlier link stops working) */
  async issueSignInLink(email: string) {
    const key = newToken();
    const partner = await this.tx((d) => {
      const p = d.partners.find((x) => x.email === email.trim().toLowerCase());
      if (p) Object.assign(p, { keyHash: hashKey(key), keyExpiresAt: new Date(Date.now() + SIGN_IN_LINK_MINUTES * 60_000).toISOString() });
      return p;
    });
    return partner ? { partner, key } : undefined;
  }

  /** Uses up a sign-in link: returns a session token, or undefined if it's wrong, used or expired */
  useSignInLink(key: string | undefined) {
    if (!key) return Promise.resolve(undefined);
    const h = hashKey(key);
    return this.tx((d) => {
      const p = d.partners.find((x) => x.keyHash === h);
      if (!p || !p.keyExpiresAt || Date.parse(p.keyExpiresAt) <= Date.now()) return undefined;
      Object.assign(p, { keyHash: undefined, keyExpiresAt: undefined, failedLogins: 0, lockedUntil: undefined });
      return { partner: p, token: addSession(p) };
    });
  }

  async listPartners() {
    return [...(await this.read()).partners].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /* Documents */

  async addDocument(partnerId: string, meta: Pick<PartnerDocument, "kind" | "filename" | "contentType" | "size" | "expiresOn">, bytes: Uint8Array) {
    const id = randomUUID();
    await this.backend.putBlob(id, bytes);
    return this.tx((d) => {
      const doc: PartnerDocument = { ...meta, id, partnerId, uploadedAt: now(), review: "pending" };
      d.documents.push(doc);
      return doc;
    });
  }

  async documentsFor(partnerId?: string) {
    return (await this.read()).documents
      .filter((x) => !partnerId || x.partnerId === partnerId)
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  async getDocument(id: string) {
    const doc = (await this.read()).documents.find((x) => x.id === id);
    if (!doc) return undefined;
    const bytes = await this.backend.getBlob(id);
    return bytes ? { doc, bytes } : undefined;
  }

  reviewDocument(id: string, review: DocumentReview, reviewNote?: string) {
    return this.tx((d) => {
      const doc = d.documents.find((x) => x.id === id);
      if (doc) Object.assign(doc, { review, reviewNote: reviewNote || undefined });
      return doc;
    });
  }

  /* Availability and bookings */

  /**
   * Taken keys (nets and the bowling machine) for a block, from live bookings and held nets.
   * Nets held for `holdId` count as free (that partner may book them).
   */
  async taken(blockId: string, holdId?: string) {
    const at = Date.now();
    const set = new Set<string>();
    if (getBlock(blockId)?.test) return set;
    for (const [key, hold] of heldNets(blockId)) if (hold.id !== holdId) set.add(key);
    for (const b of (await this.read()).bookings) {
      if (b.blockId !== blockId || !holds(b, at)) continue;
      for (const i of b.items) {
        set.add(i.slotKey);
        if (i.bowlingMachine) set.add(machineKey(blockId, i));
      }
    }
    return set;
  }

  /**
   * Books the requested nets (and bowling machine) and issues the first invoice. The nets are held for
   * INVOICE_DUE_HOURS while it's paid. Atomic: either every item is free and all are held, or nothing changes.
   */
  reserve(input: {
    partnerId: string;
    blockId: string;
    items: { slotKey: string; bowlingMachine: boolean; ageGroup?: string; ability?: string; gender?: string }[];
    machineCoach?: string;
    terms?: PaymentTerms;
    /** For tests: the time to book at */
    at?: number;
  }): Promise<ReserveResult> {
    return this.tx<ReserveResult>((d) => {
      const at = input.at ?? Date.now();
      const block = getBlock(input.blockId);
      if (!block || !input.items.length) return { ok: false, reason: "invalid", message: "Please choose at least one slot." };
      const code = codeFor(d, input.partnerId);
      if (!block.test && priorityWindowOpen(at) && !code) {
        return { ok: false, reason: "locked", message: `Priority booking is open to invited partners until ${priorityEndsLabel()}. Booking opens to everyone after that. If you have a priority code, enter it above.` };
      }
      if (!blockUnlocked(block, d.bookings.filter((b) => b.partnerId === input.partnerId))) {
        const needed = getBlock(block.requiresBlock!)?.label ?? "the previous block";
        return { ok: false, reason: "locked", message: `${block.label} is only open to partners who have booked ${needed}. Please book ${needed} first.` };
      }
      const open = openInvoice(d, input.partnerId, at);
      if (open) return { ok: false, reason: "invalid", message: unpaidMessage(open) };
      const items: NetBookingItem[] = [];
      const wanted = new Set<string>();
      for (const it of input.items) {
        const found = findSlot(input.blockId, it.slotKey);
        if (!found) return { ok: false, reason: "invalid", message: "One of those slots isn't available to book." };
        const { slot, net } = found;
        const key = slotKey(input.blockId, slot, net);
        if (wanted.has(key)) continue;
        wanted.add(key);
        if (it.bowlingMachine) {
          const m = machineKey(input.blockId, slot);
          if (wanted.has(m)) return { ok: false, reason: "invalid", message: "There is one bowling machine, so it can only go on one net per time slot." };
          wanted.add(m);
        }
        items.push({ slotKey: key, day: slot.day, start: slot.start, end: slot.end, net, weeks: slot.dates.length, bowlingMachine: it.bowlingMachine, ageGroup: it.ageGroup, ability: it.ability, gender: it.gender, pricePence: itemPricePence(slot, it.bowlingMachine) });
      }
      const clash = new Set<string>();
      if (!block.test) {
        for (const [key, hold] of heldNets(input.blockId)) if (wanted.has(key) && hold.id !== code?.holdId) clash.add(key);
        for (const b of d.bookings) {
          if (b.blockId !== input.blockId || !holds(b, at)) continue;
          for (const i of b.items) {
            if (wanted.has(i.slotKey)) clash.add(i.slotKey);
            const m = machineKey(input.blockId, i);
            if (i.bowlingMachine && wanted.has(m)) clash.add(m);
          }
        }
      }
      if (clash.size) {
        return { ok: false, reason: "taken", keys: [...clash], message: "Sorry — one of those has just been booked or isn't available. The grid has been updated." };
      }
      const terms: PaymentTerms = input.terms ?? "termly";
      const booking: NetBooking = {
        id: randomUUID(),
        partnerId: input.partnerId,
        blockId: input.blockId,
        items,
        machineCoach: items.some((i) => i.bowlingMachine) ? input.machineCoach : undefined,
        totalPence: items.reduce((n, i) => n + i.pricePence, 0),
        plan: terms,
        method: "bank",
        status: "pending_payment",
        holdExpiresAt: new Date(at + INVOICE_DUE_HOURS * 3_600_000).toISOString(),
        createdAt: new Date(at).toISOString(),
      };
      if (terms === "monthly") {
        // The first invoice covers the first month, plus any month whose invoice would already be due
        const due = firstInvoiceMonths(monthsToInvoice(booking), at);
        booking.invoices = [newInvoice(d, "initial", due.reduce((n, m) => n + m.pence, 0), at, due.map((m) => m.month))];
      } else {
        booking.invoices = [newInvoice(d, "initial", booking.totalPence, at)];
      }
      d.bookings.push(booking);
      return { ok: true, booking };
    });
  }

  /**
   * Admin: the bank transfer for an invoice has arrived. A first invoice confirms the booking; if its
   * payment time has lapsed, that only goes through while the nets are still free (otherwise refund it).
   */
  markInvoicePaid(number: string) {
    return this.tx<{ ok: true; booking: NetBooking; invoice: PartnerInvoice; confirmed: boolean } | { ok: false; message: string }>((d) => {
      const b = d.bookings.find((x) => x.invoices?.some((i) => i.number === number));
      const inv = b?.invoices?.find((i) => i.number === number);
      if (!b || !inv) return { ok: false, message: "Invoice not found." };
      if (inv.paidAt) return { ok: false, message: "That invoice is already marked as paid." };
      if (inv.stage === "month") {
        inv.paidAt = now();
        return { ok: true, booking: b, invoice: inv, confirmed: false };
      }
      const stage = inv.stage === "balance" ? "balance" : "initial";
      const awaiting = stage === "initial" ? b.status === "pending_payment" || b.status === "expired" : b.status === "reserved";
      if (!awaiting) return { ok: false, message: "This booking isn't awaiting payment." };
      if (!holds(b)) {
        const others = d.bookings.filter((x) => x.id !== b.id && x.blockId === b.blockId && holds(x));
        const clash = b.items.some((i) => others.some((o) => o.items.some((j) => j.slotKey === i.slotKey || (i.bowlingMachine && j.bowlingMachine && machineKey(b.blockId, i) === machineKey(b.blockId, j)))));
        if (clash && !getBlock(b.blockId)?.test) return { ok: false, message: "The payment time passed and some of these nets have since been booked by someone else. Please refund the transfer." };
      }
      if (b.status === "expired") b.status = "pending_payment";
      settle(d, b, stage, { method: "bank" });
      return { ok: true, booking: b, invoice: inv, confirmed: true };
    });
  }

  /** Monthly terms: months whose invoice is now due to be issued (8am UK time, a week before the month's first session) */
  async dueMonthlyInvoices(at = Date.now()) {
    const due: { booking: NetBooking; month: string }[] = [];
    for (const b of (await this.read()).bookings) {
      if (b.status !== "confirmed" || b.plan !== "monthly") continue;
      for (const m of monthsToInvoice(b)) if (m.issueAt <= at) due.push({ booking: b, month: m.month });
    }
    return due;
  }

  /** Issues a month's invoice (once): undefined if it already exists */
  issueMonthInvoice(bookingId: string, month: string, at = Date.now()) {
    return this.tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      const m = b && monthsToInvoice(b).find((x) => x.month === month);
      if (!b || !m || b.status !== "confirmed") return undefined;
      const inv = newInvoice(d, "month", m.pence, at, [month]);
      b.invoices = [...(b.invoices ?? []), inv];
      return { booking: b, invoice: inv };
    });
  }

  /**
   * Overdue monthly invoices: one reminder a day at 8am UK time (sent within 20 hours of 8am,
   * never late) until it's paid.
   */
  async dueInvoiceReminders(at = Date.now()) {
    const due: { booking: NetBooking; invoice: PartnerInvoice; date: string }[] = [];
    for (const b of (await this.read()).bookings) {
      if (b.status !== "confirmed") continue;
      for (const i of b.invoices ?? []) {
        if (i.stage !== "month" || i.paidAt || Date.parse(i.dueAt) > at) continue;
        const date = londonDate(new Date(at));
        const sendAt = londonTime(date, REMINDER_HOUR).getTime();
        if (sendAt <= at && sendAt >= Date.parse(i.dueAt) && at - sendAt < 20 * 3_600_000 && !i.remindersSent?.includes(date)) due.push({ booking: b, invoice: i, date });
      }
    }
    return due;
  }

  /** Marks a reminder as sent; false if another run already claimed it */
  claimInvoiceReminder(number: string, date: string) {
    return this.tx((d) => {
      const inv = d.bookings.flatMap((b) => b.invoices ?? []).find((i) => i.number === number);
      if (!inv || inv.paidAt || inv.remindersSent?.includes(date)) return false;
      inv.remindersSent = [...(inv.remindersSent ?? []), date];
      return true;
    });
  }

  async findInvoice(number: string) {
    for (const b of (await this.read()).bookings) {
      const invoice = b.invoices?.find((i) => i.number === number);
      if (invoice) return { booking: view(b), invoice };
    }
    return undefined;
  }

  async getBooking(id: string) {
    const b = (await this.read()).bookings.find((x) => x.id === id);
    return b && view(b);
  }

  async bookingsFor(partnerId?: string) {
    return (await this.read()).bookings
      .filter((b) => !partnerId || b.partnerId === partnerId)
      .map(view)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/* ── Which backend ─────────────────────────────────────────────────────── */

const g = globalThis as unknown as { __hillrisersPartners?: PartnerStore };

function d1(): D1Database | undefined {
  if ((globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent !== "Cloudflare-Workers") return undefined;
  try {
    return (getCloudflareContext().env as { DB?: D1Database }).DB;
  } catch {
    return undefined;
  }
}

/** Cloudflare D1 when deployed; a local folder in development (PARTNER_STORE_DIR overrides) */
export function getPartnerStore() {
  if (!g.__hillrisersPartners) {
    const db = d1();
    g.__hillrisersPartners = new PartnerStore(
      db ? new D1Backend(db) : new FileBackend(process.env.PARTNER_STORE_DIR ?? path.join(process.cwd(), ".data", "partners")),
    );
  }
  return g.__hillrisersPartners;
}

export const partnerStorageIsPermanent = () => !!d1() || process.env.NODE_ENV !== "production";

/** For tests */
export const createFilePartnerStore = (dir: string) => new PartnerStore(new FileBackend(dir));
export const createD1PartnerStore = (db: D1Database) => new PartnerStore(new D1Backend(db));
