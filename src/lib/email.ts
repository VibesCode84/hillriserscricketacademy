import { site, formatPrice } from "../data/site";
import { formatTimeRange, sessionLabel, type AcademySession } from "../data/sessions";
import { depositFor, getAcademy } from "../data/academies";
import { coachesFor } from "../data/coaches";
import { formatTermDate, paymentDueDate, termStartLabel, upcomingTerm } from "../data/term";

function termLine() {
  const t = upcomingTerm();
  return `${t.name} starts the ${termStartLabel(t)} and runs until ${formatTermDate(t.endsOn, { weekday: true })}. Fees are paid termly and are due by ${formatTermDate(paymentDueDate(t), { weekday: true })}. Term dates: ${site.url}/sessions#term-dates`;
}
import type { Booking, Parent, Player, TrialRequest } from "./booking/types";

type Email = { to: string; subject: string; text: string };

async function send(email: Email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[hillrisers] email (not sent — RESEND_API_KEY unset)\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${site.name} <${site.email}>`,
      to: [email.to],
      reply_to: site.email,
      subject: email.subject,
      text: email.text,
    }),
  });
  if (!res.ok) console.error("[hillrisers] email failed", res.status, await res.text());
}

/** The welcome email is part of the product: everything a parent needs before the first session. */
export async function sendBookingConfirmation(args: {
  booking: Booking;
  session: AcademySession;
  player: Player;
  parent: Parent;
}) {
  const { booking, session, player, parent } = args;
  const coach = session.discipline ? coachesFor(session.discipline)[0] : undefined;
  const first = player.name.split(" ")[0];
  const text = `Hi ${parent.name.split(" ")[0]},

${first}'s place is confirmed. Welcome to Hillrisers.

YOUR ACADEMY PLACE
Player: ${player.name}
Session: ${sessionLabel(session)}
When: ${session.day}, ${formatTimeRange(session)}${session.confirmed ? "" : " — we'll confirm the exact time with you"}
Venue: ${site.venue.name}, ${site.venue.addressLines.join(", ")}
${coach ? `Coach: ${coach.name} — ${coach.role}\n` : ""}Paid: ${formatPrice(booking.amountPaidPence ?? session.pricePence)}

TERM DATES
${termLine()}

WHAT TO BRING
• Comfortable sportswear and indoor trainers
• A named water bottle
• Any cricket kit they have — for hard-ball sessions a helmet, pads and gloves are essential (reply if you need to borrow kit)

WHEN YOU ARRIVE
Please arrive 10 minutes early. A coach will meet you at the entrance and sign ${first} in. Parking and arrival details: ${site.url}/venue

WHAT TO EXPECT
The coaching team will know ${first} is new. They'll introduce ${first} to the group, work in small stations so there are plenty of turns, and finish with one clear thing to work on next time.
Within a day or two we'll get in touch to ask how ${first} found it.

Questions? Reply to this email or call ${site.phone}.

See you soon,
The Hillrisers coaching team

Booking reference: ${booking.id.slice(0, 8).toUpperCase()}
Cancellations more than 48 hours before the session are refunded in full: ${site.url}/refunds
`;
  await send({ to: parent.email, subject: `${first}'s Hillrisers place is confirmed — ${session.day} ${formatTimeRange(session)}`, text });
}

export async function sendWaitlistConfirmation(args: { to: string; playerName: string; session: AcademySession }) {
  const { to, playerName, session } = args;
  await send({
    to,
    subject: `You're on the waiting list — ${session.title}, ${session.day}`,
    text: `Thanks — ${playerName} is on the waiting list for ${sessionLabel(session)}, ${session.day} ${formatTimeRange(session)}.

There's nothing to pay. As soon as a place opens we'll email you a link to book it.

In the meantime, if another day would work, reply and we'll suggest an alternative.

The Hillrisers coaching team · ${site.phone}`,
  });
}

/** Sent when a family requests a trial while the weekly programme is being finalised. */
export async function sendTrialRequestConfirmation(args: {
  parent: Parent;
  player: Player;
  academyKey: string;
  preferredDays: string[];
}) {
  const { parent, player, academyKey, preferredDays } = args;
  const academy = getAcademy(academyKey);
  const first = player.name.split(" ")[0];
  const days = preferredDays.length ? preferredDays.join(", ") : "Any day";
  const text = `Hi ${parent.name.split(" ")[0]},

Thank you — we've received ${first}'s trial request. There's nothing to pay yet.

YOUR REQUEST
Player: ${player.name}
Academy: ${academy?.name ?? academyKey}
Preferred days: ${days}
Venue: ${site.venue.name}, ${site.venue.addressLines.join(", ")}

WHAT HAPPENS NEXT
We're finalising which academy runs on which day. A coach will be in touch shortly to confirm the best day and time for ${first}, and send you a link to secure the place.

${termLine()}

Questions? Reply to this email or call ${site.phone}.

The Hillrisers coaching team
`;
  await send({ to: parent.email, subject: `We've received ${first}'s trial request — Hillrisers`, text });
  await send({
    to: site.email,
    subject: `New trial request: ${player.name} — ${academy?.name ?? academyKey}`,
    text: `${player.name} (DOB ${player.dateOfBirth}, ${player.experience}, interest: ${player.interest})\nAcademy: ${academy?.name ?? academyKey}\nPreferred days: ${days}\nParent: ${parent.name} <${parent.email}> ${parent.mobile}\n\nSee /admin/bookings`,
  });
}

export async function sendDepositConfirmation(args: { request: TrialRequest; player: Player; parent: Parent }) {
  const { request, player, parent } = args;
  const academy = getAcademy(request.academy);
  const first = player.name.split(" ")[0];
  const days = request.preferredDays.length ? request.preferredDays.join(", ") : "Any day";
  const amount = formatPrice(request.depositPence ?? depositFor(request.academy));
  await send({
    to: parent.email,
    subject: `${first}'s place is secured — Hillrisers`,
    text: `Hi ${parent.name.split(" ")[0]},

Thank you — we've received your ${amount} refundable holding deposit, and ${first}'s place in ${academy?.name ?? request.academy} is secured.

WHAT HAPPENS NEXT
We're finalising which academy runs on which day. A coach will be in touch to confirm the best day and time for ${first} (preferred: ${days}).
Your deposit pays for ${first}'s first session, and counts towards the term fee if ${first} continues for the term.
${termLine()}

IF PLANS CHANGE
If we can't offer a session that suits you, or you change your mind before the session is confirmed, just reply and we'll refund the deposit in full.

The Hillrisers coaching team · ${site.phone}
Reference: ${request.id.slice(0, 8).toUpperCase()}
`,
  });
  await send({
    to: site.email,
    subject: `Deposit paid: ${player.name} — ${academy?.name ?? request.academy}`,
    text: `${amount} holding deposit received for ${player.name}.\nPreferred days: ${days}\nParent: ${parent.name} <${parent.email}> ${parent.mobile}\n\nSee /admin/bookings`,
  });
}

export async function sendEnquiryNotification(args: { parentName: string; email: string; message: string }) {
  await send({
    to: site.email,
    subject: `New enquiry from ${args.parentName}`,
    text: `${args.parentName} <${args.email}>\n\n${args.message}`,
  });
}
