/**
 * Academy booking domain. The academy database is the source of truth for
 * players, sessions, capacity, bookings, attendance and pathway
 * recommendations. The payment provider (Stripe) is the source of truth for
 * payment, refunds and payment status only.
 */

export type Experience = "new" | "some" | "regular" | "performance";
export type Interest = "batting" | "seam" | "spin" | "all-round" | "not-sure";
export type Gender = "boy" | "girl" | "unspecified";

export type Parent = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
};

export type Player = {
  id: string;
  parentId: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  experience: Experience;
  interest: Interest;
  clubOrSchool?: string;
  playingProfile?: string;
  recommendedPathway?: string;
  /** How the family heard about us, including referrals ("Referred by …") */
  heardAbout?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes?: string;
  photoConsent: boolean;
  createdAt: string;
};

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "part_refunded"
  | "waitlist";

export type PaymentType = "single" | "term" | "subscription" | "manual";

export type Booking = {
  id: string;
  playerId: string;
  parentId: string;
  sessionId: string;
  /** ISO date of the specific session attended, if known */
  sessionDate?: string;
  status: BookingStatus;
  paymentType: PaymentType;
  isTrial: boolean;
  /** Pending bookings count against capacity until this time */
  holdExpiresAt?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  amountPaidPence?: number;
  amountRefundedPence?: number;
  attended?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type WaitlistEntry = {
  id: string;
  sessionId: string;
  parentName: string;
  playerName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  status: "waiting" | "invited" | "booked" | "removed";
  createdAt: string;
};

/* ── Register your interest (launch enquiry form) ─────────────────────── */

export type CricketLevel = "new" | "plays-a-little" | "junior-club" | "regular-club-or-rep";
export type MainRole = "batter" | "seam" | "spin" | "all-rounder" | "wicket-keeper" | "not-sure";
export type GirlsOnlyPreference = "yes" | "no" | "not-applicable";

export type ChildInterest = {
  firstName: string;
  dateOfBirth: string; // YYYY-MM-DD
  school?: string;
  club?: string;
  girlsOnly: GirlsOnlyPreference;
  level: CricketLevel;
  mainRole: MainRole;
  /** What they want from sessions (multi) */
  wants: string[];
  /** Small group (up to 6 per net) / group of 3 / 1-to-1 (multi) */
  formats: string[];
  /** 1 hour / 90 minutes / 2 hours (multi) */
  sessionLengths: string[];
  /** Weekday evenings / Saturday / Sunday morning / Sunday afternoon (multi) */
  availability: string[];
  availabilityNotes?: string;
  frequency: "once" | "twice" | "not-sure";
  /** Holiday camps / 1-to-1 / Summer outdoor (multi) */
  otherInterests: string[];
  paymentPreference: "termly" | "monthly";
};

export type InterestRegistration = {
  id: string;
  parentName: string;
  email: string;
  mobile: string;
  postcode: string;
  heardAbout?: string;
  children: ChildInterest[];
  /** Required: permission to contact about HillRisers sessions */
  contactConsent: true;
  /** Optional: news and offers */
  marketingConsent: boolean;
  createdAt: string;
};

/* ── Coach with us ───────────────────────────────────────────────────────── */

export type CoachInterest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  specialism?: string;
  qualifications: string;
  playingBackground?: string;
  availability: string;
  summerAvailability?: string;
  dbsStatus: string;
  safeguardingStatus: string;
  firstAid: boolean;
  message?: string;
  createdAt: string;
};

/** Register-interest record for a holiday camp (no payment). */
export type CampInterest = {
  id: string;
  /** Camp ids from src/data/camps.ts, or "future" */
  camps: string[];
  parentName: string;
  email: string;
  mobile?: string;
  childName: string;
  childAge: number;
  interest: Interest;
  notes?: string;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  parentName: string;
  email: string;
  mobile?: string;
  childAge?: number;
  message: string;
  source: string;
  createdAt: string;
};

export type SessionCounts = {
  confirmed: number;
  /** Unexpired pending_payment holds */
  held: number;
  waitlist: number;
};

export type ReserveResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: "full" | "inactive" | "not_found" };

export type BookingView = Booking & { player?: Player; parent?: Parent };

export interface BookingStore {
  createProfile(input: {
    parent: Omit<Parent, "id" | "createdAt">;
    player: Omit<Player, "id" | "parentId" | "createdAt">;
  }): Promise<{ parent: Parent; player: Player }>;
  getPlayer(id: string): Promise<Player | undefined>;
  getParent(id: string): Promise<Parent | undefined>;

  /**
   * Atomically check capacity and create a pending_payment booking that holds
   * a place until `holdMinutes` have passed. Never over-books.
   */
  reservePlace(input: {
    sessionId: string;
    parentId: string;
    playerId: string;
    holdMinutes: number;
    isTrial: boolean;
    paymentType?: PaymentType;
  }): Promise<ReserveResult>;

  /** Admin manual booking — also capacity-checked, confirmed immediately */
  addManualBooking(input: {
    sessionId: string;
    parentId: string;
    playerId: string;
    notes?: string;
  }): Promise<ReserveResult>;

  getBooking(id: string): Promise<Booking | undefined>;
  findBookingByCheckoutId(checkoutSessionId: string): Promise<Booking | undefined>;
  findBookingByPaymentIntent(paymentIntentId: string): Promise<Booking | undefined>;
  attachCheckout(bookingId: string, checkoutSessionId: string, holdExpiresAt?: string): Promise<void>;
  /** Idempotent. Returns the booking and whether this call changed it. */
  confirmBooking(
    bookingId: string,
    payment: { paymentIntentId?: string; amountPaidPence?: number },
  ): Promise<{ booking: Booking | undefined; changed: boolean }>;
  cancelBooking(bookingId: string, status: "cancelled" | "expired"): Promise<Booking | undefined>;
  recordRefund(bookingId: string, amountRefundedPence: number): Promise<Booking | undefined>;
  setAttendance(bookingId: string, attended: boolean): Promise<Booking | undefined>;
  moveBooking(bookingId: string, toSessionId: string): Promise<ReserveResult>;

  sessionCounts(): Promise<Record<string, SessionCounts>>;
  listBookings(filter?: { sessionId?: string }): Promise<BookingView[]>;

  joinWaitlist(entry: Omit<WaitlistEntry, "id" | "status" | "createdAt">): Promise<WaitlistEntry>;
  listWaitlist(filter?: { sessionId?: string }): Promise<WaitlistEntry[]>;

  createInterestRegistration(input: Omit<InterestRegistration, "id" | "createdAt">): Promise<InterestRegistration>;
  listInterestRegistrations(): Promise<InterestRegistration[]>;

  createCoachInterest(input: Omit<CoachInterest, "id" | "createdAt">): Promise<CoachInterest>;
  listCoachInterests(): Promise<CoachInterest[]>;

  createCampInterest(input: Omit<CampInterest, "id" | "createdAt">): Promise<CampInterest>;
  listCampInterests(): Promise<CampInterest[]>;

  createEnquiry(enquiry: Omit<Enquiry, "id" | "createdAt">): Promise<Enquiry>;
  listEnquiries(): Promise<Enquiry[]>;
}

/** Bookings that occupy a place in a session */
export function occupiesPlace(b: Booking, now = Date.now()) {
  if (b.status === "confirmed" || b.status === "part_refunded") return true;
  if (b.status === "pending_payment") {
    return !b.holdExpiresAt || new Date(b.holdExpiresAt).getTime() > now;
  }
  return false;
}
