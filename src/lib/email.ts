import { site, formatPrice } from "../data/site";
import { formatTimeRange, sessionLabel, type AcademySession } from "../data/sessions";
import { launch } from "../data/launch";
import { FUTURE_CAMPS, getCamp } from "../data/camps";
import type { Booking, CampInterest, CoachInterest, InterestRegistration, Parent, Player } from "./booking/types";
import { labelFor, summariseCoachAvailability } from "./interest-options";

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
1. We're using every family's answers — availability, level and what each child wants from cricket — to build the timetable.
2. When the timetable is published, registered families get ${launch.priorityBookingHours} hours' priority booking before places open to everyone.
3. You then book a trial session in trial week (${launch.trialWeek}), paying a deposit equal to one session fee.
4. After the trial, the deposit is credited if your child joins, or refunded if they don't (provided they attended or cancelled with at least ${launch.trialCancellationHours} hours' notice).

Regular sessions start from ${launch.regularSessionsFrom}. How booking works: ${site.url}/how-booking-works

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
    `${c.name} <${c.email}> ${c.phone}\nRoles: ${c.roles.join(", ")}${c.specialism ? `\nSpecialism: ${c.specialism}` : ""}\nQualifications: ${c.qualifications}\nPlaying background: ${c.playingBackground ?? "—"}\nCoaching experience: ${c.coachingExperience}\nCoaching philosophy: ${c.coachingPhilosophy}\nStrengths: ${c.strengths}\nWeaknesses / working on: ${c.weaknesses}\nAutumn/spring: ${summariseCoachAvailability(c.availability)}${c.availability.notes ? ` (${c.availability.notes})` : ""}\nSummer: ${c.availability.summer.join(", ") || "—"}${c.availability.summerNotes ? ` (${c.availability.summerNotes})` : ""}\nDBS: ${c.dbsStatus}\nSafeguarding: ${c.safeguardingStatus}\nFirst aid: ${c.firstAid ? "Yes" : "No"}${c.message ? `\n\n${c.message}` : ""}`,
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
