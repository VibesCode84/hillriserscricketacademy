import { BOWLING_MACHINE_PENCE, PARTNER_RATE_PENCE } from "./partners";
import { formatPrice } from "./site";

/** Draft net-hire terms for coaches and delivery partners — to be reviewed by HillRisers */
export const partnerTerms = [
  { t: "Block bookings", b: `Nets are hired in blocks: the same net, at the same time, every week of the block. The rate is ${formatPrice(PARTNER_RATE_PENCE)} per net per hour, paid in full when you book.` },
  { t: "Bowling machine", b: `The bowling machine is ${formatPrice(BOWLING_MACHINE_PENCE)} per hour on top of the net. There is one machine, so it can be booked on one net per time slot. You must supply your own balls, and the machine must be operated by a coach holding at least an ECB Level 2 (or equivalent) qualification.` },
  { t: "No filming or video", b: "No filming or video recording of any kind is permitted at the venue, including on phones. This applies to coaches, players and anyone attending." },
  { t: "Safeguarding and documents", b: "You must hold, and upload, a current coaching qualification, enhanced DBS check, safeguarding training and public liability insurance for everyone coaching in your sessions. HillRisers reviews documents and may cancel a booking if they are missing or invalid." },
  { t: "Your sessions", b: "You are responsible for your participants, their supervision and their safety during your booking, and for leaving the net as you found it. Arrive and leave within your booked time." },
  { t: "Venue rules", b: "You must follow John Lyon School's site rules and any instructions from HillRisers or school staff." },
  { t: "Cancellations", b: "Bookings are non-refundable once paid. If HillRisers or the school has to cancel a session (for example, the venue is unavailable), we will offer a replacement session or a refund for that session." },
  { t: "Changes", b: "HillRisers may update these terms. The terms in place when you book apply to that booking." },
];
