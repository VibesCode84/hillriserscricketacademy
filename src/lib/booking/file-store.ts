import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSession } from "../../data/sessions";
import {
  occupiesPlace,
  type Booking,
  type BookingStore,
  type BookingView,
  type Enquiry,
  type Parent,
  type Player,
  type ReserveResult,
  type SessionCounts,
  type TrialRequest,
  type TrialRequestStatus,
  type TrialRequestView,
  type WaitlistEntry,
} from "./types";

type Data = {
  parents: Parent[];
  players: Player[];
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  trialRequests: TrialRequest[];
  enquiries: Enquiry[];
};

const empty = (): Data => ({ parents: [], players: [], bookings: [], waitlist: [], trialRequests: [], enquiries: [] });

/**
 * JSON-file store for local development and demos. All mutations run through
 * a single in-process queue, so capacity checks are atomic within one server
 * process. Use the Postgres store (DATABASE_URL) in production.
 */
export class FileBookingStore implements BookingStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private file: string) {}

  private async read(): Promise<Data> {
    try {
      return { ...empty(), ...JSON.parse(await fs.readFile(this.file, "utf8")) };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return empty();
      throw err;
    }
  }

  private async write(data: Data) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2));
    await fs.rename(tmp, this.file);
  }

  /** Serialise read-modify-write transactions. */
  private tx<T>(fn: (data: Data) => T | Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const data = await this.read();
      const result = await fn(data);
      await this.write(data);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async snapshot() {
    await this.queue;
    return this.read();
  }

  async createProfile(input: Parameters<BookingStore["createProfile"]>[0]) {
    return this.tx((data) => {
      const now = new Date().toISOString();
      const email = input.parent.email.trim().toLowerCase();
      // Parent email is the booking identity (guest checkout)
      let parent = data.parents.find((p) => p.email === email);
      if (parent) {
        Object.assign(parent, { name: input.parent.name, mobile: input.parent.mobile });
      } else {
        parent = { ...input.parent, email, id: randomUUID(), createdAt: now };
        data.parents.push(parent);
      }
      const player: Player = { ...input.player, id: randomUUID(), parentId: parent.id, createdAt: now };
      data.players.push(player);
      return { parent, player };
    });
  }

  async getPlayer(id: string) {
    return (await this.snapshot()).players.find((p) => p.id === id);
  }

  async getParent(id: string) {
    return (await this.snapshot()).parents.find((p) => p.id === id);
  }

  private place(
    data: Data,
    input: { sessionId: string; parentId: string; playerId: string },
    make: (now: string) => Partial<Booking>,
  ): ReserveResult {
    const session = getSession(input.sessionId);
    if (!session) return { ok: false, reason: "not_found" };
    if (!session.active) return { ok: false, reason: "inactive" };
    const taken = data.bookings.filter((b) => b.sessionId === session.id && occupiesPlace(b)).length;
    if (taken >= session.capacity) return { ok: false, reason: "full" };
    const now = new Date().toISOString();
    const booking: Booking = {
      id: randomUUID(),
      playerId: input.playerId,
      parentId: input.parentId,
      sessionId: session.id,
      status: "pending_payment",
      paymentType: "single",
      isTrial: false,
      createdAt: now,
      updatedAt: now,
      ...make(now),
    };
    data.bookings.push(booking);
    return { ok: true, booking };
  }

  reservePlace(input: Parameters<BookingStore["reservePlace"]>[0]) {
    return this.tx((data) =>
      this.place(data, input, () => ({
        status: "pending_payment",
        paymentType: input.paymentType ?? "single",
        isTrial: input.isTrial,
        holdExpiresAt: new Date(Date.now() + input.holdMinutes * 60_000).toISOString(),
      })),
    );
  }

  addManualBooking(input: Parameters<BookingStore["addManualBooking"]>[0]) {
    return this.tx((data) =>
      this.place(data, input, () => ({ status: "confirmed", paymentType: "manual", notes: input.notes })),
    );
  }

  async getBooking(id: string) {
    return (await this.snapshot()).bookings.find((b) => b.id === id);
  }

  async findBookingByCheckoutId(checkoutSessionId: string) {
    return (await this.snapshot()).bookings.find((b) => b.stripeCheckoutSessionId === checkoutSessionId);
  }

  async findBookingByPaymentIntent(paymentIntentId: string) {
    return (await this.snapshot()).bookings.find((b) => b.stripePaymentIntentId === paymentIntentId);
  }

  private update(id: string, fn: (b: Booking) => void) {
    return this.tx((data) => {
      const b = data.bookings.find((x) => x.id === id);
      if (!b) return undefined;
      fn(b);
      b.updatedAt = new Date().toISOString();
      return b;
    });
  }

  async attachCheckout(bookingId: string, checkoutSessionId: string, holdExpiresAt?: string) {
    await this.update(bookingId, (b) => {
      b.stripeCheckoutSessionId = checkoutSessionId;
      if (holdExpiresAt) b.holdExpiresAt = holdExpiresAt;
    });
  }

  confirmBooking(bookingId: string, payment: { paymentIntentId?: string; amountPaidPence?: number }) {
    return this.tx((data) => {
      const b = data.bookings.find((x) => x.id === bookingId);
      if (!b) return { booking: undefined, changed: false };
      if (b.status === "confirmed" || b.status === "refunded" || b.status === "part_refunded") {
        return { booking: b, changed: false };
      }
      // Payment completed after the hold lapsed: still honour the paid place.
      // Admins can see this on the dashboard (it may take a session above capacity).
      b.status = "confirmed";
      b.stripePaymentIntentId = payment.paymentIntentId ?? b.stripePaymentIntentId;
      b.amountPaidPence = payment.amountPaidPence ?? b.amountPaidPence;
      b.holdExpiresAt = undefined;
      b.updatedAt = new Date().toISOString();
      return { booking: b, changed: true };
    });
  }

  cancelBooking(bookingId: string, status: "cancelled" | "expired") {
    return this.update(bookingId, (b) => {
      if (b.status === "pending_payment" || (status === "cancelled" && b.status === "confirmed")) {
        b.status = status;
        b.holdExpiresAt = undefined;
      }
    });
  }

  recordRefund(bookingId: string, amountRefundedPence: number) {
    return this.update(bookingId, (b) => {
      b.amountRefundedPence = amountRefundedPence;
      b.status = amountRefundedPence >= (b.amountPaidPence ?? 0) ? "refunded" : "part_refunded";
    });
  }

  setAttendance(bookingId: string, attended: boolean) {
    return this.update(bookingId, (b) => {
      b.attended = attended;
    });
  }

  moveBooking(bookingId: string, toSessionId: string) {
    return this.tx((data): ReserveResult => {
      const b = data.bookings.find((x) => x.id === bookingId);
      const target = getSession(toSessionId);
      if (!b || !target) return { ok: false, reason: "not_found" };
      if (!target.active) return { ok: false, reason: "inactive" };
      const taken = data.bookings.filter(
        (x) => x.id !== b.id && x.sessionId === target.id && occupiesPlace(x),
      ).length;
      if (taken >= target.capacity) return { ok: false, reason: "full" };
      b.sessionId = target.id;
      b.updatedAt = new Date().toISOString();
      return { ok: true, booking: b };
    });
  }

  async sessionCounts() {
    const data = await this.snapshot();
    const now = Date.now();
    const counts: Record<string, SessionCounts> = {};
    const get = (id: string) => (counts[id] ??= { confirmed: 0, held: 0, waitlist: 0 });
    for (const b of data.bookings) {
      if (!occupiesPlace(b, now)) continue;
      if (b.status === "pending_payment") get(b.sessionId).held++;
      else get(b.sessionId).confirmed++;
    }
    for (const w of data.waitlist) if (w.status === "waiting") get(w.sessionId).waitlist++;
    return counts;
  }

  async listBookings(filter?: { sessionId?: string }): Promise<BookingView[]> {
    const data = await this.snapshot();
    return data.bookings
      .filter((b) => !filter?.sessionId || b.sessionId === filter.sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((b) => ({
        ...b,
        player: data.players.find((p) => p.id === b.playerId),
        parent: data.parents.find((p) => p.id === b.parentId),
      }));
  }

  joinWaitlist(entry: Parameters<BookingStore["joinWaitlist"]>[0]) {
    return this.tx((data) => {
      const w: WaitlistEntry = {
        ...entry,
        email: entry.email.trim().toLowerCase(),
        id: randomUUID(),
        status: "waiting",
        createdAt: new Date().toISOString(),
      };
      data.waitlist.push(w);
      return w;
    });
  }

  async listWaitlist(filter?: { sessionId?: string }) {
    return (await this.snapshot()).waitlist.filter((w) => !filter?.sessionId || w.sessionId === filter.sessionId);
  }

  createTrialRequest(input: Parameters<BookingStore["createTrialRequest"]>[0]) {
    return this.tx((data) => {
      const r: TrialRequest = { ...input, id: randomUUID(), status: "new", createdAt: new Date().toISOString() };
      data.trialRequests.push(r);
      return r;
    });
  }

  async listTrialRequests(): Promise<TrialRequestView[]> {
    const data = await this.snapshot();
    return [...data.trialRequests]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({
        ...r,
        player: data.players.find((p) => p.id === r.playerId),
        parent: data.parents.find((p) => p.id === r.parentId),
      }));
  }

  setTrialRequestStatus(id: string, status: TrialRequestStatus) {
    return this.tx((data) => {
      const r = data.trialRequests.find((x) => x.id === id);
      if (r) r.status = status;
      return r;
    });
  }

  createEnquiry(enquiry: Parameters<BookingStore["createEnquiry"]>[0]) {
    return this.tx((data) => {
      const e: Enquiry = { ...enquiry, id: randomUUID(), createdAt: new Date().toISOString() };
      data.enquiries.push(e);
      return e;
    });
  }

  async listEnquiries() {
    return (await this.snapshot()).enquiries;
  }
}
