import { randomUUID } from "node:crypto";
import { FileBookingStore, empty, type Data } from "./file-store";
import type { BookingStore, CampInterest, CoachInterest, Enquiry, InterestRegistration } from "./types";

/** The parts of Cloudflare's D1 binding we use (avoids a dependency on @cloudflare/workers-types). */
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

type Kind = "interest" | "coach" | "camp" | "enquiry";

/**
 * Cloudflare D1 store, used on Cloudflare when DATABASE_URL is not set.
 *
 * - Registrations, coach and camp interest and enquiries are one row each in
 *   `records`, so simultaneous submissions never overwrite each other.
 * - Booking-engine data (parents, players, bookings, waitlist) is one JSON
 *   document in `store_doc`, written with a version check and retried on
 *   conflict, so capacity checks stay atomic across Workers instances.
 */
export class D1BookingStore extends FileBookingStore {
  private ready?: Promise<unknown>;

  constructor(private db: D1Database) {
    super();
  }

  private init() {
    this.ready ??= this.db.batch([
      this.db.prepare("CREATE TABLE IF NOT EXISTS store_doc (id TEXT PRIMARY KEY, version INTEGER NOT NULL, data TEXT NOT NULL)"),
      this.db.prepare("CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL, data TEXT NOT NULL)"),
      this.db.prepare("CREATE INDEX IF NOT EXISTS records_kind_created ON records (kind, created_at)"),
    ]).catch((err) => {
      this.ready = undefined;
      throw err;
    });
    return this.ready;
  }

  /* ── Booking-engine document ─────────────────────────────────────────── */

  private async load(): Promise<{ data: Data; version: number }> {
    await this.init();
    const row = await this.db.prepare("SELECT version, data FROM store_doc WHERE id = 'main'").first<{ version: number; data: string }>();
    return { data: { ...empty(), ...(row ? JSON.parse(row.data) : {}) }, version: row?.version ?? 0 };
  }

  /** Saves only if nobody else has written since `version`; returns false on conflict. */
  private async save(data: Data, version: number) {
    const { parents, players, bookings, waitlist } = data;
    const json = JSON.stringify({ parents, players, bookings, waitlist });
    const res =
      version === 0
        ? await this.db.prepare("INSERT INTO store_doc (id, version, data) VALUES ('main', 1, ?) ON CONFLICT (id) DO NOTHING").bind(json).run()
        : await this.db.prepare("UPDATE store_doc SET data = ?, version = version + 1 WHERE id = 'main' AND version = ?").bind(json, version).run();
    return res.meta.changes === 1;
  }

  protected override async read() {
    return (await this.load()).data;
  }

  protected override async write() {
    throw new Error("D1BookingStore writes go through tx()");
  }

  protected override async tx<T>(fn: (data: Data) => T | Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data, version } = await this.load();
      const result = await fn(data);
      if (await this.save(data, version)) return result;
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 80));
    }
    throw new Error("Could not save — the store is busy. Please try again.");
  }

  protected override async snapshot() {
    return this.read();
  }

  /* ── One row per submission ──────────────────────────────────────────── */

  private async insert<T extends { id: string; createdAt: string }>(kind: Kind, record: T) {
    await this.init();
    await this.db
      .prepare("INSERT INTO records (id, kind, created_at, data) VALUES (?, ?, ?, ?)")
      .bind(record.id, kind, record.createdAt, JSON.stringify(record))
      .run();
    return record;
  }

  private async list<T>(kind: Kind, order: "ASC" | "DESC" = "DESC") {
    await this.init();
    const { results } = await this.db
      .prepare(`SELECT data FROM records WHERE kind = ? ORDER BY created_at ${order === "ASC" ? "ASC" : "DESC"}`)
      .bind(kind)
      .all<{ data: string }>();
    return results.map((r) => JSON.parse(r.data) as T);
  }

  private stamp<T extends { email?: string }>(input: T) {
    return { ...input, ...(input.email ? { email: input.email.trim().toLowerCase() } : {}), id: randomUUID(), createdAt: new Date().toISOString() };
  }

  override createInterestRegistration(input: Parameters<BookingStore["createInterestRegistration"]>[0]) {
    return this.insert<InterestRegistration>("interest", this.stamp(input));
  }
  override listInterestRegistrations() {
    return this.list<InterestRegistration>("interest");
  }

  override createCoachInterest(input: Parameters<BookingStore["createCoachInterest"]>[0]) {
    return this.insert<CoachInterest>("coach", this.stamp(input));
  }
  override listCoachInterests() {
    return this.list<CoachInterest>("coach");
  }

  override createCampInterest(input: Parameters<BookingStore["createCampInterest"]>[0]) {
    return this.insert<CampInterest>("camp", this.stamp(input));
  }
  override listCampInterests() {
    return this.list<CampInterest>("camp");
  }

  override createEnquiry(enquiry: Parameters<BookingStore["createEnquiry"]>[0]) {
    return this.insert<Enquiry>("enquiry", { ...enquiry, id: randomUUID(), createdAt: new Date().toISOString() });
  }
  override listEnquiries() {
    return this.list<Enquiry>("enquiry", "ASC");
  }
}
