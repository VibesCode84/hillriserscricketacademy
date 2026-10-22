import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  findSlot,
  getBlock,
  itemPricePence,
  machineKey,
  PARTNER_HOLD_MINUTES,
  slotKey,
  type DocumentKind,
  type PartnerDay,
} from "../../data/partners";
import type { D1Database } from "../booking/d1-store";

/* ── Types ─────────────────────────────────────────────────────────────── */

export type Partner = {
  id: string;
  /** sha256 of the partner's private portal key */
  keyHash: string;
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  type: string;
  sports: string;
  website?: string;
  about?: string;
  createdAt: string;
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
  pricePence: number;
};

export type NetBookingStatus = "pending_payment" | "confirmed" | "cancelled" | "expired";

export type NetBooking = {
  id: string;
  partnerId: string;
  blockId: string;
  items: NetBookingItem[];
  /** Level 2 coach operating the bowling machine */
  machineCoach?: string;
  totalPence: number;
  status: NetBookingStatus;
  holdExpiresAt?: string;
  checkoutId?: string;
  paymentIntentId?: string;
  createdAt: string;
  paidAt?: string;
};

type Data = { partners: Partner[]; documents: PartnerDocument[]; bookings: NetBooking[] };
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
const now = () => new Date().toISOString();

/** A slot is taken by a confirmed booking or by a payment hold that hasn't expired */
const holds = (b: NetBooking, at = Date.now()) =>
  b.status === "confirmed" || (b.status === "pending_payment" && !!b.holdExpiresAt && Date.parse(b.holdExpiresAt) > at);

export type ReserveResult =
  | { ok: true; booking: NetBooking }
  | { ok: false; reason: "taken" | "invalid"; keys?: string[]; message: string };

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

  async createPartner(input: Omit<Partner, "id" | "keyHash" | "createdAt">) {
    const key = randomBytes(24).toString("base64url");
    const partner = await this.tx((d) => {
      const p: Partner = { ...input, email: input.email.trim().toLowerCase(), id: randomUUID(), keyHash: hashKey(key), createdAt: now() };
      d.partners.push(p);
      return p;
    });
    return { partner, key };
  }

  async partnerByKey(key: string | undefined) {
    if (!key) return undefined;
    const h = hashKey(key);
    return (await this.read()).partners.find((p) => p.keyHash === h);
  }

  /** Issues a new portal key (the old link stops working) */
  async rotateKey(email: string) {
    const key = randomBytes(24).toString("base64url");
    const partner = await this.tx((d) => {
      const p = d.partners.find((x) => x.email === email.trim().toLowerCase());
      if (p) p.keyHash = hashKey(key);
      return p;
    });
    return partner ? { partner, key } : undefined;
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

  /** Taken keys (nets and the bowling machine) for a block, from live bookings */
  async taken(blockId: string) {
    const at = Date.now();
    const set = new Set<string>();
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
   * Holds the requested nets (and bowling machine) while the partner pays.
   * Atomic: either every item is free and all are held, or nothing changes.
   */
  reserve(input: { partnerId: string; blockId: string; items: { slotKey: string; bowlingMachine: boolean }[]; machineCoach?: string }): Promise<ReserveResult> {
    return this.tx<ReserveResult>((d) => {
      const block = getBlock(input.blockId);
      if (!block || !input.items.length) return { ok: false, reason: "invalid", message: "Please choose at least one slot." };
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
        items.push({ slotKey: key, day: slot.day, start: slot.start, end: slot.end, net, weeks: slot.dates.length, bowlingMachine: it.bowlingMachine, pricePence: itemPricePence(slot, it.bowlingMachine) });
      }
      const at = Date.now();
      const clash = new Set<string>();
      for (const b of d.bookings) {
        if (b.blockId !== input.blockId || !holds(b, at)) continue;
        for (const i of b.items) {
          if (wanted.has(i.slotKey)) clash.add(i.slotKey);
          const m = machineKey(input.blockId, i);
          if (i.bowlingMachine && wanted.has(m)) clash.add(m);
        }
      }
      if (clash.size) {
        return { ok: false, reason: "taken", keys: [...clash], message: "Sorry — someone has just booked one of those. The grid has been updated." };
      }
      const booking: NetBooking = {
        id: randomUUID(),
        partnerId: input.partnerId,
        blockId: input.blockId,
        items,
        machineCoach: items.some((i) => i.bowlingMachine) ? input.machineCoach : undefined,
        totalPence: items.reduce((n, i) => n + i.pricePence, 0),
        status: "pending_payment",
        holdExpiresAt: new Date(at + PARTNER_HOLD_MINUTES * 60_000).toISOString(),
        createdAt: now(),
      };
      d.bookings.push(booking);
      return { ok: true, booking };
    });
  }

  attachCheckout(bookingId: string, checkoutId: string) {
    return this.tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (b) b.checkoutId = checkoutId;
      return b;
    });
  }

  /** Called from the Stripe webhook (or dev checkout) once payment is confirmed */
  confirm(bookingId: string, paymentIntentId?: string) {
    return this.tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status === "confirmed") return b;
      b.status = "confirmed";
      b.paidAt = now();
      b.paymentIntentId = paymentIntentId;
      b.holdExpiresAt = undefined;
      return b;
    });
  }

  release(bookingId: string, status: "cancelled" | "expired", checkoutId?: string) {
    return this.tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status !== "pending_payment") return b;
      if (checkoutId && b.checkoutId && b.checkoutId !== checkoutId) return b;
      b.status = status;
      return b;
    });
  }

  async getBooking(id: string) {
    return (await this.read()).bookings.find((b) => b.id === id);
  }

  async bookingsFor(partnerId?: string) {
    return (await this.read()).bookings
      .filter((b) => !partnerId || b.partnerId === partnerId)
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
