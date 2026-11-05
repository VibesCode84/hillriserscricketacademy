import { INVOICE_DUE_HOURS } from "./invoicing";
import { MONTHLY_INVOICE_DAYS_BEFORE, REFUND_DAYS_BEFORE } from "./partners";

/** Draft delivery partner terms for coaches and delivery partners — to be reviewed by HillRisers */
export const partnerTerms = [
  { t: "Block bookings", b: "Sessions are booked in blocks: the same net, at the same time, every week of the block. We only accept block bookings, and the block rate is shown in the partner portal." },
  { t: "How booking works", b: "Bookings are first come, first served. You send a booking request, and your nets are held for you while we review it. When we approve it, we email your first invoice. Your first payment confirms the booking." },
  { t: "Paying", b: `Bookings are invoiced and paid by bank transfer. Each invoice must be paid within ${INVOICE_DUE_HOURS} hours of being issued. If your first invoice isn't paid in time, the nets are released. You can have one unpaid invoice at a time.` },
  { t: "Monthly or termly", b: `You choose in your booking request. Termly: one invoice for the whole block, in advance. Monthly: one invoice per calendar month, in advance, each issued ${MONTHLY_INVOICE_DAYS_BEFORE} days before that month's first session. Sessions up to Christmas are invoiced in full in your first invoice.` },
  { t: "Cancellations and refunds", b: `You can cancel and get a refund only if you tell us more than ${REFUND_DAYS_BEFORE} days before your first session. After that, bookings can't be cancelled and you are liable for the full fee for every session in the block, including any monthly invoices still to come.` },
  { t: "Bowling machine", b: "The bowling machine is charged per hour on top of the net. There is one machine, so it can be booked on one net per time slot. You must supply your own balls, and the machine must be operated by a coach holding at least an ECB Level 2 (or equivalent) qualification." },
  { t: "Safeguarding and documents", b: "You must hold, and upload, a current coaching qualification, enhanced DBS check, safeguarding training and public liability insurance for everyone coaching in your sessions. HillRisers reviews documents and may cancel a booking if they are missing or invalid." },
  { t: "Session details", b: "For each session you book, you must tell us the age group, ability and gender of the players you are providing for. Let us know before making any change." },
  { t: "Your sessions and liability", b: "As the hirer, you are responsible and liable for your sessions, your participants, their supervision and their safety during your booking, and for any loss or damage you cause. Leave the net as you found it, and arrive and leave within your booked time." },
  { t: "Venue rules", b: "You must follow John Lyon School's site rules and any instructions from HillRisers or school staff." },
  { t: "If we cancel", b: "If HillRisers or the school has to cancel a session (for example, the venue is unavailable), we will offer a replacement session or a refund for that session." },
  { t: "Changes", b: "HillRisers may update these terms. The terms in place when you book apply to that booking." },
];
