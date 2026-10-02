import { site, formatPrice } from "../data/site";
import { formatTimeRange, type AcademySession } from "../data/sessions";
import { coachesFor } from "../data/coaches";
import type { Booking, Parent, Player } from "./booking/types";

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
  const coach = coachesFor(session.discipline)[0];
  const first = player.name.split(" ")[0];
  const text = `Hi ${parent.name.split(" ")[0]},

${first}'s place is confirmed. Welcome to Hillrisers.

YOUR ACADEMY PLACE
Player: ${player.name}
Academy: ${session.title} (${session.group})
When: ${session.day}, ${formatTimeRange(session)}${session.confirmed ? "" : " — we'll confirm the exact time with you"}
Venue: ${site.venue.name}, ${site.venue.addressLines.join(", ")}
${coach ? `Coach: ${coach.name} — ${coach.role}\n` : ""}Paid: ${formatPrice(booking.amountPaidPence ?? session.pricePence)}

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
    text: `Thanks — ${playerName} is on the waiting list for ${session.title} (${session.group}), ${session.day} ${formatTimeRange(session)}.

There's nothing to pay. As soon as a place opens we'll email you a link to book it.

In the meantime, if another day would work, reply and we'll suggest an alternative.

The Hillrisers coaching team · ${site.phone}`,
  });
}

export async function sendEnquiryNotification(args: { parentName: string; email: string; message: string }) {
  await send({
    to: site.email,
    subject: `New enquiry from ${args.parentName}`,
    text: `${args.parentName} <${args.email}>\n\n${args.message}`,
  });
}
