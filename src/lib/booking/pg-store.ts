import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { sessions } from "../../data/sessions";
import type {
  Booking,
  BookingStore,
  BookingView,
  Enquiry,
  Parent,
  Player,
  ReserveResult,
  SessionCounts,
  WaitlistEntry,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const iso = (v: any) => (v instanceof Date ? v.toISOString() : v ?? undefined);
const date = (v: any) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ?? undefined);
const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

const toParent = (r: any): Parent => ({
  id: r.id,
  name: r.name,
  email: r.email,
  mobile: r.mobile,
  createdAt: iso(r.created_at),
});

const toPlayer = (r: any): Player => ({
  id: r.id,
  parentId: r.parent_id,
  name: r.name,
  dateOfBirth: date(r.date_of_birth),
  gender: r.gender,
  experience: r.experience,
  interest: r.interest,
  clubOrSchool: opt(r.club_or_school),
  playingProfile: opt(r.playing_profile),
  recommendedPathway: opt(r.recommended_pathway),
  heardAbout: opt(r.heard_about),
  emergencyContactName: r.emergency_contact_name,
  emergencyContactPhone: r.emergency_contact_phone,
  medicalNotes: opt(r.medical_notes),
  photoConsent: r.photo_consent,
  createdAt: iso(r.created_at),
});

const toBooking = (r: any): Booking => ({
  id: r.id,
  playerId: r.player_id,
  parentId: r.parent_id,
  sessionId: r.session_id,
  sessionDate: date(r.session_date),
  status: r.status,
  paymentType: r.payment_type,
  isTrial: r.is_trial,
  holdExpiresAt: iso(r.hold_expires_at),
  stripeCheckoutSessionId: opt(r.stripe_checkout_session_id),
  stripePaymentIntentId: opt(r.stripe_payment_intent_id),
  amountPaidPence: opt(r.amount_paid_pence),
  amountRefundedPence: opt(r.amount_refunded_pence),
  attended: opt(r.attended),
  notes: opt(r.notes),
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

const toWaitlist = (r: any): WaitlistEntry => ({
  id: r.id,
  sessionId: r.session_id,
  parentName: r.parent_name,
  playerName: r.player_name,
  dateOfBirth: date(r.date_of_birth),
  email: r.email,
  mobile: r.mobile,
  status: r.status,
  createdAt: iso(r.created_at),
});

const toEnquiry = (r: any): Enquiry => ({
  id: r.id,
  parentName: r.parent_name,
  email: r.email,
  mobile: opt(r.mobile),
  childAge: opt(r.child_age),
  message: r.message,
  source: r.source,
  createdAt: iso(r.created_at),
});

/** SQL fragment: bookings that occupy a place */
const OCCUPIES = `(status in ('confirmed','part_refunded') or (status = 'pending_payment' and hold_expires_at > now()))`;

/**
 * PostgreSQL store. Capacity checks lock the academy_sessions row
 * (SELECT … FOR UPDATE) inside a transaction, so two parents paying at the
 * same moment can never put 19 players into an 18-player group.
 */
export class PgBookingStore implements BookingStore {
  private pool: Pool;
  private ready: Promise<void> | undefined;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? undefined : { rejectUnauthorized: false },
      max: 5,
    });
  }

  /** Create tables if needed and sync the timetable config into academy_sessions. */
  private init() {
    this.ready ??= (async () => {
      const schema = readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
      await this.pool.query(schema);
      for (const s of sessions) {
        await this.pool.query(
          `insert into academy_sessions
             (id, title, discipline, day, start_time, end_time, age_min, age_max, capacity, price_pence, stripe_price_id, active, confirmed, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())
           on conflict (id) do update set
             title=excluded.title, discipline=excluded.discipline, day=excluded.day,
             start_time=excluded.start_time, end_time=excluded.end_time, age_min=excluded.age_min,
             age_max=excluded.age_max, capacity=excluded.capacity, price_pence=excluded.price_pence,
             stripe_price_id=excluded.stripe_price_id, active=excluded.active, confirmed=excluded.confirmed,
             updated_at=now()`,
          [
            s.id, s.title, s.discipline, s.day, s.startTime, s.endTime, s.ageMin, s.ageMax,
            s.capacity, s.pricePence, s.stripePriceId ?? null, s.active, s.confirmed,
          ],
        );
      }
    })().catch((err) => {
      this.ready = undefined;
      throw err;
    });
    return this.ready;
  }

  private async q(text: string, params: unknown[] = []) {
    await this.init();
    return this.pool.query(text, params);
  }

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    await this.init();
    const c = await this.pool.connect();
    try {
      await c.query("begin");
      const result = await fn(c);
      await c.query("commit");
      return result;
    } catch (err) {
      await c.query("rollback");
      throw err;
    } finally {
      c.release();
    }
  }

  async createProfile(input: Parameters<BookingStore["createProfile"]>[0]) {
    return this.tx(async (c) => {
      const email = input.parent.email.trim().toLowerCase();
      const { rows } = await c.query(
        `insert into parents (id, name, email, mobile) values ($1,$2,$3,$4)
         on conflict (email) do update set name=excluded.name, mobile=excluded.mobile
         returning *`,
        [randomUUID(), input.parent.name, email, input.parent.mobile],
      );
      const parent = toParent(rows[0]);
      const p = input.player;
      const res = await c.query(
        `insert into players (id, parent_id, name, date_of_birth, gender, experience, interest, club_or_school,
           playing_profile, recommended_pathway, heard_about, emergency_contact_name, emergency_contact_phone, medical_notes, photo_consent)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) returning *`,
        [
          randomUUID(), parent.id, p.name, p.dateOfBirth, p.gender, p.experience, p.interest,
          p.clubOrSchool ?? null, p.playingProfile ?? null, p.recommendedPathway ?? null, p.heardAbout ?? null,
          p.emergencyContactName, p.emergencyContactPhone, p.medicalNotes ?? null, p.photoConsent,
        ],
      );
      return { parent, player: toPlayer(res.rows[0]) };
    });
  }

  async getPlayer(id: string) {
    const { rows } = await this.q(`select * from players where id = $1`, [id]);
    return rows[0] ? toPlayer(rows[0]) : undefined;
  }

  async getParent(id: string) {
    const { rows } = await this.q(`select * from parents where id = $1`, [id]);
    return rows[0] ? toParent(rows[0]) : undefined;
  }

  /** Lock the session row and check there is a free place. Call inside tx. */
  private async lockAndCheck(c: PoolClient, sessionId: string, excludeBookingId?: string) {
    const s = await c.query(`select capacity, active from academy_sessions where id = $1 for update`, [sessionId]);
    if (!s.rows[0]) return "not_found" as const;
    if (!s.rows[0].active) return "inactive" as const;
    const { rows } = await c.query(
      `select count(*)::int as n from bookings where session_id = $1 and ${OCCUPIES} and id <> coalesce($2::uuid, '00000000-0000-0000-0000-000000000000')`,
      [sessionId, excludeBookingId ?? null],
    );
    return rows[0].n >= s.rows[0].capacity ? ("full" as const) : null;
  }

  reservePlace(input: Parameters<BookingStore["reservePlace"]>[0]) {
    return this.tx(async (c): Promise<ReserveResult> => {
      const problem = await this.lockAndCheck(c, input.sessionId);
      if (problem) return { ok: false, reason: problem };
      const { rows } = await c.query(
        `insert into bookings (id, player_id, parent_id, session_id, status, payment_type, is_trial, hold_expires_at)
         values ($1,$2,$3,$4,'pending_payment',$5,$6, now() + make_interval(mins => $7)) returning *`,
        [randomUUID(), input.playerId, input.parentId, input.sessionId, input.paymentType ?? "single", input.isTrial, input.holdMinutes],
      );
      return { ok: true, booking: toBooking(rows[0]) };
    });
  }

  addManualBooking(input: Parameters<BookingStore["addManualBooking"]>[0]) {
    return this.tx(async (c): Promise<ReserveResult> => {
      const problem = await this.lockAndCheck(c, input.sessionId);
      if (problem) return { ok: false, reason: problem };
      const { rows } = await c.query(
        `insert into bookings (id, player_id, parent_id, session_id, status, payment_type, notes)
         values ($1,$2,$3,$4,'confirmed','manual',$5) returning *`,
        [randomUUID(), input.playerId, input.parentId, input.sessionId, input.notes ?? null],
      );
      return { ok: true, booking: toBooking(rows[0]) };
    });
  }

  async getBooking(id: string) {
    const { rows } = await this.q(`select * from bookings where id = $1`, [id]);
    return rows[0] ? toBooking(rows[0]) : undefined;
  }

  async findBookingByCheckoutId(id: string) {
    const { rows } = await this.q(`select * from bookings where stripe_checkout_session_id = $1`, [id]);
    return rows[0] ? toBooking(rows[0]) : undefined;
  }

  async findBookingByPaymentIntent(id: string) {
    const { rows } = await this.q(`select * from bookings where stripe_payment_intent_id = $1`, [id]);
    return rows[0] ? toBooking(rows[0]) : undefined;
  }

  async attachCheckout(bookingId: string, checkoutSessionId: string, holdExpiresAt?: string) {
    await this.q(
      `update bookings set stripe_checkout_session_id = $2,
         hold_expires_at = coalesce($3::timestamptz, hold_expires_at), updated_at = now() where id = $1`,
      [bookingId, checkoutSessionId, holdExpiresAt ?? null],
    );
  }

  async confirmBooking(bookingId: string, payment: { paymentIntentId?: string; amountPaidPence?: number }) {
    const { rows } = await this.q(
      `update bookings set status = 'confirmed', hold_expires_at = null,
         stripe_payment_intent_id = coalesce($2, stripe_payment_intent_id),
         amount_paid_pence = coalesce($3, amount_paid_pence), updated_at = now()
       where id = $1 and status not in ('confirmed','refunded','part_refunded') returning *`,
      [bookingId, payment.paymentIntentId ?? null, payment.amountPaidPence ?? null],
    );
    if (rows[0]) return { booking: toBooking(rows[0]), changed: true };
    return { booking: await this.getBooking(bookingId), changed: false };
  }

  async cancelBooking(bookingId: string, status: "cancelled" | "expired") {
    const allowed = status === "cancelled" ? `('pending_payment','confirmed')` : `('pending_payment')`;
    await this.q(
      `update bookings set status = $2, hold_expires_at = null, updated_at = now()
       where id = $1 and status in ${allowed}`,
      [bookingId, status],
    );
    return this.getBooking(bookingId);
  }

  async recordRefund(bookingId: string, amountRefundedPence: number) {
    const { rows } = await this.q(
      `update bookings set amount_refunded_pence = $2,
         status = case when $2 >= coalesce(amount_paid_pence, 0) then 'refunded' else 'part_refunded' end,
         updated_at = now()
       where id = $1 returning *`,
      [bookingId, amountRefundedPence],
    );
    return rows[0] ? toBooking(rows[0]) : undefined;
  }

  async setAttendance(bookingId: string, attended: boolean) {
    const { rows } = await this.q(
      `update bookings set attended = $2, updated_at = now() where id = $1 returning *`,
      [bookingId, attended],
    );
    return rows[0] ? toBooking(rows[0]) : undefined;
  }

  moveBooking(bookingId: string, toSessionId: string) {
    return this.tx(async (c): Promise<ReserveResult> => {
      const problem = await this.lockAndCheck(c, toSessionId, bookingId);
      if (problem) return { ok: false, reason: problem };
      const { rows } = await c.query(
        `update bookings set session_id = $2, updated_at = now() where id = $1 returning *`,
        [bookingId, toSessionId],
      );
      return rows[0] ? { ok: true, booking: toBooking(rows[0]) } : { ok: false, reason: "not_found" };
    });
  }

  async sessionCounts() {
    const counts: Record<string, SessionCounts> = {};
    const get = (id: string) => (counts[id] ??= { confirmed: 0, held: 0, waitlist: 0 });
    const b = await this.q(
      `select session_id, count(*) filter (where status <> 'pending_payment')::int as confirmed,
              count(*) filter (where status = 'pending_payment')::int as held
       from bookings where ${OCCUPIES} group by session_id`,
    );
    for (const r of b.rows) Object.assign(get(r.session_id), { confirmed: r.confirmed, held: r.held });
    const w = await this.q(
      `select session_id, count(*)::int as n from waitlist where status = 'waiting' group by session_id`,
    );
    for (const r of w.rows) get(r.session_id).waitlist = r.n;
    return counts;
  }

  async listBookings(filter?: { sessionId?: string }): Promise<BookingView[]> {
    const { rows } = await this.q(
      `select b.*, row_to_json(pl) as player_row, row_to_json(pa) as parent_row
       from bookings b join players pl on pl.id = b.player_id join parents pa on pa.id = b.parent_id
       where ($1::text is null or b.session_id = $1) order by b.created_at`,
      [filter?.sessionId ?? null],
    );
    return rows.map((r) => ({
      ...toBooking(r),
      player: r.player_row ? toPlayer(r.player_row) : undefined,
      parent: r.parent_row ? toParent(r.parent_row) : undefined,
    }));
  }

  async joinWaitlist(entry: Parameters<BookingStore["joinWaitlist"]>[0]) {
    const { rows } = await this.q(
      `insert into waitlist (id, session_id, parent_name, player_name, date_of_birth, email, mobile)
       values ($1,$2,$3,$4,$5,$6,$7) returning *`,
      [randomUUID(), entry.sessionId, entry.parentName, entry.playerName, entry.dateOfBirth, entry.email.trim().toLowerCase(), entry.mobile],
    );
    return toWaitlist(rows[0]);
  }

  async listWaitlist(filter?: { sessionId?: string }) {
    const { rows } = await this.q(
      `select * from waitlist where ($1::text is null or session_id = $1) order by created_at`,
      [filter?.sessionId ?? null],
    );
    return rows.map(toWaitlist);
  }

  async createEnquiry(e: Parameters<BookingStore["createEnquiry"]>[0]) {
    const { rows } = await this.q(
      `insert into enquiries (id, parent_name, email, mobile, child_age, message, source)
       values ($1,$2,$3,$4,$5,$6,$7) returning *`,
      [randomUUID(), e.parentName, e.email, e.mobile ?? null, e.childAge ?? null, e.message, e.source],
    );
    return toEnquiry(rows[0]);
  }

  async listEnquiries() {
    const { rows } = await this.q(`select * from enquiries order by created_at desc`);
    return rows.map(toEnquiry);
  }
}
