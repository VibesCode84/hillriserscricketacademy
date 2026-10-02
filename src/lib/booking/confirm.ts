import { getSession } from "../../data/sessions";
import { sendBookingConfirmation, sendDepositConfirmation } from "../email";
import { getStore } from "./index";

/**
 * Mark a booking paid and send the welcome email. Idempotent — safe to call
 * for repeated webhook deliveries.
 */
export async function confirmPaidBooking(
  bookingId: string,
  payment: { paymentIntentId?: string; amountPaidPence?: number },
) {
  const store = getStore();
  const { booking, changed } = await store.confirmBooking(bookingId, payment);
  if (!booking || !changed) return booking;
  const session = getSession(booking.sessionId);
  const [player, parent] = await Promise.all([store.getPlayer(booking.playerId), store.getParent(booking.parentId)]);
  if (session && player && parent) {
    try {
      await sendBookingConfirmation({ booking, session, player, parent });
    } catch (err) {
      console.error("[hillrisers] confirmation email failed", err);
    }
  }
  return booking;
}

/** Mark a holding deposit paid and email the family. Idempotent. */
export async function confirmPaidDeposit(
  trialRequestId: string,
  payment: { paymentIntentId?: string; amountPaidPence?: number },
) {
  const store = getStore();
  const { request, changed } = await store.markDepositPaid(trialRequestId, payment);
  if (!request || !changed) return request;
  const [player, parent] = await Promise.all([store.getPlayer(request.playerId), store.getParent(request.parentId)]);
  if (player && parent) {
    try {
      await sendDepositConfirmation({ request, player, parent });
    } catch (err) {
      console.error("[hillrisers] deposit email failed", err);
    }
  }
  return request;
}
