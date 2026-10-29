import { INVOICE_DUE_HOURS } from "./invoicing";
import { getBlock } from "./partners";

const springDeposit = getBlock("spring-2027")?.deposit?.percent ?? 25;

/** Draft delivery partner terms for coaches and delivery partners — to be reviewed by HillRisers */
export const partnerTerms = [
  { t: "Block bookings", b: `Sessions are booked in blocks: the same net, at the same time, every week of the block. We only accept block bookings, and the block rate is shown in the partner portal. The autumn block is paid in full when you book.` },
  { t: "Paying", b: `You can pay by bank transfer or by card. Bank transfer has no fee: we email an invoice, due on receipt, that must be paid within ${INVOICE_DUE_HOURS} hours, and your nets are held until then. For the autumn block, a 25% holding deposit is paid by card first and the invoice is for the balance. You can have one unpaid invoice at a time. If payment hasn't arrived in time, the nets are released and any deposit is not refunded. Card payments include a card processing fee, shown before you pay. Only UK cards are accepted. Card processing fees are not refundable, and if a card payment is disputed without good reason you are responsible for any charges that result.` },
  { t: "Spring: deposit or pay in full", b: `The spring block is only open to partners who have booked and paid for the autumn block. You can pay for spring in full when you book, or reserve your nets with a ${springDeposit}% deposit. If you pay a deposit, the balance must be paid in full by midnight (UK time) on the day of your final autumn session. If it isn't paid by then, your spring nets are released and the deposit is not refunded.` },
  { t: "Bowling machine", b: `The bowling machine is charged per hour on top of the net. There is one machine, so it can be booked on one net per time slot. You must supply your own balls, and the machine must be operated by a coach holding at least an ECB Level 2 (or equivalent) qualification.` },
  { t: "No filming or video", b: "No filming or video recording of any kind is permitted at the venue, including on phones. This applies to coaches, players and anyone attending." },
  { t: "Safeguarding and documents", b: "You must hold, and upload, a current coaching qualification, enhanced DBS check, safeguarding training and public liability insurance for everyone coaching in your sessions. HillRisers reviews documents and may cancel a booking if they are missing or invalid." },
  { t: "Session details", b: "For each session you book, you must tell us the age group, ability and gender of the players you are providing for. Let us know before making any change." },
  { t: "Your sessions", b: "You are responsible for your participants, their supervision and their safety during your booking, and for leaving the net as you found it. Arrive and leave within your booked time." },
  { t: "Venue rules", b: "You must follow John Lyon School's site rules and any instructions from HillRisers or school staff." },
  { t: "Cancellations", b: "Bookings are non-refundable once paid. If HillRisers or the school has to cancel a session (for example, the venue is unavailable), we will offer a replacement session or a refund for that session." },
  { t: "Changes", b: "HillRisers may update these terms. The terms in place when you book apply to that booking." },
];
