import { site, formatPrice } from "../data/site";
import { bankDetails, ukDateTime } from "../data/invoicing";
import { formatTimeRange, sessionLabel, type AcademySession } from "../data/sessions";
import { FUTURE_CAMPS, getCamp } from "../data/camps";
import type { Booking, CampInterest, CoachInterest, InterestRegistration, Parent, Player } from "./booking/types";
import { labelFor, summariseCoachAvailability, summariseCoachCamps, summariseCoachTerms, summariseHolidays } from "./interest-options";

type Email = { to: string; subject: string; text: string };

/**
 * Sends via Resend when RESEND_API_KEY and EMAIL_FROM are set; otherwise logs.
 * Internal notifications go to ACADEMY_NOTIFY_EMAIL (skipped if unset).
 */
async function send(email: Email) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.info(`[hillrisers] email (not sent — RESEND_API_KEY/EMAIL_FROM unset)\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email.to],
      reply_to: site.email ?? process.env.ACADEMY_NOTIFY_EMAIL,
      subject: email.subject,
      text: email.text,
    }),
  });
  if (!res.ok) console.error("[hillrisers] email failed", res.status, await res.text());
}

async function notifyAcademy(subject: string, text: string) {
  const to = process.env.ACADEMY_NOTIFY_EMAIL;
  if (to) await send({ to, subject, text });
  else console.info(`[hillrisers] academy notification (ACADEMY_NOTIFY_EMAIL unset): ${subject}`);
}

function contactLine() {
  const parts = [site.email, site.phone].filter(Boolean);
  return parts.length ? `Questions? Reply to this email or contact us: ${parts.join(" · ")}.` : "Questions? Just reply to this email.";
}

const signOff = "The HillRisers coaching team";

/* ── Register your interest ─────────────────────────────────────────────── */

export async function sendInterestConfirmation(r: InterestRegistration) {
  const names = r.children.map((c) => c.firstName);
  const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  await send({
    to: r.email,
    subject: `Thanks for registering ${who} with HillRisers`,
    text: `Hi ${r.parentName.split(" ")[0]},

Thank you for registering your interest in HillRisers Cricket Academy for ${who}. There's nothing to pay at this stage.

WHAT HAPPENS NEXT
1. We're using every family's answers — which days they can make, level and what each child wants from cricket — to shape our programmes.
2. We'll be in touch with the details when programmes are ready.
3. The first session is a paid taster. After that, fees are paid termly in advance.

We'll be in touch as soon as programmes are ready. How it works: ${site.url}/how-booking-works

${contactLine()}

${signOff}
`,
  });
  await notifyAcademy(
    `New registration: ${who} (${r.postcode})`,
    `${r.parentName} <${r.email}> ${r.mobile} · ${r.postcode}\nHeard via: ${r.heardAbout ?? "—"}\n\n` +
      r.children
        .map(
          (c) =>
            `${c.firstName} (DOB ${c.dateOfBirth}) — ${labelFor("level", c.level)}, ${labelFor("mainRole", c.mainRole)}\n` +
            `  Available: ${c.availability.join(", ") || "—"}${c.availabilityNotes ? ` (${c.availabilityNotes})` : ""}\n` +
            (c.earlyRisersSlots?.length ? `  Early Risers: ${c.earlyRisersSlots.join(", ")}\n` : "") +
            `  Holidays: ${summariseHolidays(c.holidays) || "—"}${c.holidayNotes ? ` (${c.holidayNotes})` : ""}\n` +
            `  Wants: ${c.wants.join(", ") || "—"}\n  Formats: ${c.formats.join(", ") || "—"} · Lengths: ${c.sessionLengths.join(", ") || "—"}`,
        )
        .join("\n\n") +
      `\n\nSee ${site.url}/admin/bookings`,
  );
}

/* ── Coach with us ──────────────────────────────────────────────────────── */

export async function sendCoachInterestConfirmation(c: CoachInterest) {
  await send({
    to: c.email,
    subject: "Thanks for your interest in coaching with HillRisers",
    text: `Hi ${c.name.split(" ")[0]},

Thank you for getting in touch about coaching with HillRisers. We'll be in touch soon to talk it through.

${signOff}
`,
  });
  await notifyAcademy(
    `Coach interest: ${c.name} — ${c.roles.join(", ")}`,
    `${c.name} <${c.email}> ${c.phone}\nRoles: ${c.roles.join(", ")}${c.specialism ? `\nSpecialism: ${c.specialism}` : ""}\nQualifications: ${c.qualifications}\nPlaying background: ${c.playingBackground ?? "—"}\nCoaching experience: ${c.coachingExperience}\nCoaching philosophy: ${c.coachingPhilosophy}\nStrengths: ${c.strengths}\nWeaknesses / working on: ${c.weaknesses}\nTerms: ${summariseCoachTerms(c.availability)}\nWeekly: ${summariseCoachAvailability(c.availability)}${c.availability.notes ? ` (${c.availability.notes})` : ""}${c.availability.summerNotes ? `\nSummer notes: ${c.availability.summerNotes}` : ""}\nCamp weeks: ${summariseCoachCamps(c.availability)}${c.availability.holidayWeekly ? `\nHoliday weekly sessions: ${c.availability.holidayWeekly}` : ""}${c.availability.campNotes ? `\nHoliday notes: ${c.availability.campNotes}` : ""}\nDBS: ${c.dbsStatus}\nSafeguarding: ${c.safeguardingStatus}\nFirst aid: ${c.firstAid ? "Yes" : "No"}${c.message ? `\n\n${c.message}` : ""}`,
  );
}

/* ── Holiday camps ──────────────────────────────────────────────────────── */

export async function sendCampInterestConfirmation(c: CampInterest) {
  const first = c.childName.split(" ")[0];
  const campList = c.camps.map((id) => `• ${id === FUTURE_CAMPS ? "Future holiday camps" : getCamp(id)?.name ?? id}`).join("\n");
  await send({
    to: c.email,
    subject: `Holiday camps — we'll keep you posted about ${first}`,
    text: `Hi ${c.parentName.split(" ")[0]},

Thank you for registering ${first}'s interest in HillRisers specialist holiday camps:
${campList}

Details are to be confirmed. You'll hear from us first, before booking opens to everyone. There's nothing to pay, and registering doesn't commit you to anything.

${signOff}
`,
  });
  await notifyAcademy(
    `Camp interest: ${c.childName} (${c.childAge})`,
    `${c.parentName} <${c.email}> ${c.mobile ?? ""}\nChild: ${c.childName}, age ${c.childAge}, interest: ${c.interest}\nCamps:\n${campList}${c.notes ? `\n\nNotes: ${c.notes}` : ""}`,
  );
}

/* ── General enquiries ──────────────────────────────────────────────────── */

export async function sendEnquiryNotification(args: { parentName: string; email: string; message: string }) {
  await notifyAcademy(`New enquiry from ${args.parentName}`, `${args.parentName} <${args.email}>\n\n${args.message}`);
}

/* ── Session bookings (used once trial booking opens) ───────────────────── */

export async function sendBookingConfirmation(args: { booking: Booking; session: AcademySession; player: Player; parent: Parent }) {
  const { booking, session, player, parent } = args;
  const first = player.name.split(" ")[0];
  await send({
    to: parent.email,
    subject: `${first}'s HillRisers place is confirmed — ${session.day} ${formatTimeRange(session)}`,
    text: `Hi ${parent.name.split(" ")[0]},

${first}'s place is confirmed. Welcome to HillRisers.

YOUR PLACE
Player: ${player.name}
Session: ${sessionLabel(session)}
When: ${session.day}, ${formatTimeRange(session)}
Venue: ${site.venue.name}, ${site.venue.addressLines.join(", ")}
Paid: ${formatPrice(booking.amountPaidPence ?? session.pricePence)}

WHAT TO BRING
• Comfortable sportswear and indoor trainers
• A named water bottle
• Any cricket kit they have

WHEN YOU ARRIVE
Please arrive 10 minutes early. A coach will meet you and sign ${first} in. Arrival details: ${site.url}/venue

${contactLine()}

${signOff}
Booking reference: ${booking.id.slice(0, 8).toUpperCase()}
`,
  });
}

export async function sendWaitlistConfirmation(args: { to: string; playerName: string; session: AcademySession }) {
  const { to, playerName, session } = args;
  await send({
    to,
    subject: `You're on the waiting list — ${sessionLabel(session)}, ${session.day}`,
    text: `Thanks — ${playerName} is on the waiting list for ${sessionLabel(session)}, ${session.day} ${formatTimeRange(session)}.

There's nothing to pay. As soon as a place opens we'll email you a link to book it.

${signOff}
`,
  });
}

/* ── Delivery partner portal ────────────────────────────────────────────── */

export const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

type PartnerContact = { orgName: string; contactName: string; email: string; phone: string; type: string };

export async function sendPartnerWelcome(p: PartnerContact) {
  await send({
    to: p.email,
    subject: "Your HillRisers partner portal",
    text: `Hi ${p.contactName.split(" ")[0]},

Thank you for registering ${p.orgName} with HillRisers.

Sign in any time at ${site.url}/partners with your email and the password you chose.

In the portal you can upload your qualifications, DBS, safeguarding and insurance documents, and book your session slots for the season.

${contactLine()}

${signOff}
`,
  });
  await notifyAcademy(
    `New delivery partner: ${p.orgName}`,
    `${p.orgName} (${p.type}) — ${p.contactName} <${p.email}> ${p.phone}\n\nSee ${site.url}/admin/partners`,
  );
}

export async function sendPartnerLink(p: PartnerContact, portalLink: string) {
  await send({
    to: p.email,
    subject: "Sign in to your HillRisers partner account",
    text: `Hi ${p.contactName.split(" ")[0]},

Sign in to your HillRisers partner account:
${portalLink}

This link works once and expires in 1 hour. You can then set a new password under Account.

${signOff}
`,
  });
}

/** A booking request has been received: HillRisers will review it and send the invoice */
export async function sendBookingRequestReceived(p: PartnerContact, r: { blockLabel: string; nets: string[]; totalPence: number; terms: string; reference: string }) {
  await send({
    to: p.email,
    subject: `Booking request received: ${r.blockLabel} (ref ${r.reference})`,
    text: `Hi ${p.contactName.split(" ")[0]},

Thank you — we've received your booking request. Your nets are held for you while we review it, and we'll email your invoice once it's approved.

${r.blockLabel} (${r.terms.toLowerCase()}), total ${formatPrice(r.totalPence)}:
${r.nets.map((n) => `• ${n}`).join("\n")}

Your first payment confirms the booking. Invoices are paid by bank transfer within 24 hours.

See your requests: ${site.url}/partners/account

${contactLine()}

${signOff}
`,
  });
  await notifyAcademy(
    `Booking request: ${p.orgName} — ${r.blockLabel} ${formatPrice(r.totalPence)}`,
    `${p.orgName} — ${p.contactName} <${p.email}> ${p.phone}\n${r.terms}\n\n${r.nets.join("\n")}\n\nApprove or decline: ${site.url}/admin/partners`,
  );
}

/** A booking request wasn't approved */
export async function sendBookingDeclined(p: PartnerContact, r: { blockLabel: string; nets: string[] }) {
  await send({
    to: p.email,
    subject: `Your ${r.blockLabel} booking request`,
    text: `Hi ${p.contactName.split(" ")[0]},

Thank you for your booking request. Unfortunately we can't accept it this time, and the nets have been released:
${r.nets.map((n) => `• ${n}`).join("\n")}

We're happy to talk through other options — just reply to this email.

${signOff}
`,
  });
}

/** "I'd like to talk first": acknowledges the enquiry and passes it to HillRisers */
export async function sendPartnerEnquiry(e: { name: string; email: string; phone?: string; orgName?: string; message: string }) {
  await send({
    to: e.email,
    subject: "Thanks for getting in touch with HillRisers",
    text: `Hi ${e.name.split(" ")[0]},

Thanks for your message. We'll be in touch soon.

${signOff}
`,
  });
  await notifyAcademy(
    `Partner enquiry: ${e.orgName ?? e.name}`,
    `${e.name}${e.orgName ? ` (${e.orgName})` : ""} <${e.email}>${e.phone ? ` ${e.phone}` : ""}\n\n${e.message}\n\nSee ${site.url}/admin/partners`,
  );
}

/** An invoice as the emails describe it */
type InvoiceEmail = {
  number: string;
  amountPence: number;
  dueAt: string;
  /** "Autumn block 2026 — November 2026 (monthly, in advance)" */
  description: string;
  blockLabel: string;
  nets: string[];
  /** The booking's first invoice: its nets are released if it isn't paid in time */
  first: boolean;
  /** Monthly terms with months still to invoice after this one */
  moreToFollow: boolean;
};

const bankLines = (reference: string) => `Pay by bank transfer to:
Account name: ${bankDetails.accountName ?? "—"}
Sort code: ${bankDetails.sortCode ?? "—"}
Account number: ${bankDetails.accountNumber ?? "—"}
Reference: ${reference}`;

/** An invoice, payable by bank transfer within INVOICE_DUE_HOURS */
export async function sendPartnerInvoice(p: PartnerContact, inv: InvoiceEmail) {
  const due = ukDateTime(inv.dueAt);
  await send({
    to: p.email,
    subject: `Invoice ${inv.number}: ${formatPrice(inv.amountPence)}, payable within 24 hours`,
    text: `Hi ${p.contactName.split(" ")[0]},

Here is your invoice for ${inv.description}.

Invoice: ${inv.number}
Amount due: ${formatPrice(inv.amountPence)}
Please pay by: ${due}

${bankLines(inv.number)}

${inv.first ? "Your nets are held until then. If payment hasn't arrived in time, they're released." : "Bookings can't be cancelled, so the full block fee remains payable."}${inv.moreToFollow ? " Each later month's invoice is emailed a week before that month's first session." : ""}
Our bank details will never change by email — if you get a message saying they have, please contact us first.

Your nets:
${inv.nets.map((n) => `• ${n}`).join("\n")}

View or print the invoice: ${site.url}/partners/invoice/${inv.number}

${contactLine()}

${signOff}
`,
  });
  await notifyAcademy(
    `Invoice ${inv.number} issued: ${p.orgName} — ${formatPrice(inv.amountPence)}`,
    `${p.orgName} — ${p.contactName} <${p.email}>\n${inv.description}: ${formatPrice(inv.amountPence)}, payable by ${due}.\n\nMark it paid when the transfer arrives: ${site.url}/admin/partners`,
  );
}

/** A monthly invoice that's past its payment time: one reminder a day */
export async function sendInvoiceReminder(p: PartnerContact, inv: Omit<InvoiceEmail, "first" | "moreToFollow">) {
  await send({
    to: p.email,
    subject: `Reminder: invoice ${inv.number} for ${formatPrice(inv.amountPence)} is overdue`,
    text: `Hi ${p.contactName.split(" ")[0]},

Invoice ${inv.number} for ${inv.description} was due by ${ukDateTime(inv.dueAt)}. Please pay ${formatPrice(inv.amountPence)} today.

${bankLines(inv.number)}

If you've already paid, thank you — please ignore this email.

View the invoice: ${site.url}/partners/invoice/${inv.number}

${contactLine()}

${signOff}
`,
  });
}

/** Sent when the first invoice is paid: the booking is confirmed */
export async function sendPartnerBookingConfirmation(
  p: PartnerContact,
  b: { blockLabel: string; nets: string[]; paidPence: number; totalPence: number; monthly: boolean; machineCoach?: string; reference: string },
) {
  await send({
    to: p.email,
    subject: `Booking confirmed: ${b.blockLabel} (ref ${b.reference})`,
    text: `Hi ${p.contactName.split(" ")[0]},

We've received your payment of ${formatPrice(b.paidPence)}. Your booking is confirmed.${b.monthly ? ` We'll email each later month's invoice a week before that month's first session (block total ${formatPrice(b.totalPence)}).` : ""}

${b.blockLabel} — your nets at ${site.venue.name}:
${b.nets.map((n) => `• ${n}`).join("\n")}
${b.machineCoach ? `\nBowling machine operator (Level 2): ${b.machineCoach}. Please bring your own balls.\n` : ""}
Booking reference: ${b.reference}

Before your first session:
• We'll send you the building access code. Please only share it with those who need it for your sessions.
• Your attendees must park in the designated car park. Coaches have a separate car park.
• You set up and pack away the nets and mats.
• Upload your coaching documents (qualifications, DBS, safeguarding, insurance) in your account, if you haven't already.

See your bookings and payment history: ${site.url}/partners/account

${contactLine()}

${signOff}
`,
  });
  await notifyAcademy(
    `Partner booking confirmed: ${p.orgName} — ${b.blockLabel} ${formatPrice(b.paidPence)}`,
    `${p.orgName} — ${p.contactName} <${p.email}> ${p.phone}\n\n${b.nets.join("\n")}\n\nPaid: ${formatPrice(b.paidPence)} · Block total: ${formatPrice(b.totalPence)}${b.monthly ? " (monthly)" : ""}\nRef ${b.reference}\n\nSee ${site.url}/admin/partners`,
  );
}

/** Sent when a later monthly invoice is paid */
export async function sendPartnerPaymentReceipt(p: PartnerContact, r: { number: string; amountPence: number; description: string }) {
  await send({
    to: p.email,
    subject: `Payment received: invoice ${r.number}`,
    text: `Hi ${p.contactName.split(" ")[0]},

Thank you — we've received your payment of ${formatPrice(r.amountPence)} for ${r.description} (invoice ${r.number}).

Your payment history: ${site.url}/partners/account

${signOff}
`,
  });
}

/* ── Invoices raised in admin ───────────────────────────────────────────── */

/** An invoice (or a reminder for it) to a customer such as Eagles Netball Club */
export async function sendCustomerInvoice(
  c: { name: string; contactName?: string; email: string },
  inv: { number: string; totalPence: number; dueAt: string; dueDays: number; link: string },
  reminder = false,
) {
  const due = inv.dueDays === 0 && !reminder ? "on receipt" : `by ${ukDate(inv.dueAt)}`;
  await send({
    to: c.email,
    subject: reminder ? `Reminder: invoice ${inv.number} for ${formatPrice(inv.totalPence)}` : `Invoice ${inv.number} from HillRisers: ${formatPrice(inv.totalPence)}`,
    text: `Hi ${(c.contactName ?? c.name).split(" ")[0]},

${reminder ? `A reminder that invoice ${inv.number} for ${formatPrice(inv.totalPence)} was due ${due}.` : `Please find invoice ${inv.number} for ${formatPrice(inv.totalPence)}, due ${due}.`}

View or print it: ${inv.link}

${bankLines(inv.number)}

${reminder ? "If you've already paid, thank you — please ignore this email." : "Thank you."}

${signOff}
`,
  });
}

/** "13 December 2026" (UK time) */
const ukDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
