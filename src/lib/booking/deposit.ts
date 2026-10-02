import { depositFor, getAcademy } from "../../data/academies";
import { sendTrialRequestConfirmation } from "../email";
import { getPaymentProvider } from "../payments";
import { getStore } from "./index";
import type { TrialRequest } from "./types";

/**
 * Start (or restart) Stripe Checkout for a trial request's holding deposit.
 * Returns undefined if online payment isn't available.
 */
export async function startDepositCheckout(request: TrialRequest, baseUrl: string) {
  const provider = getPaymentProvider();
  if (!provider) return undefined;
  const store = getStore();
  const [player, parent] = await Promise.all([store.getPlayer(request.playerId), store.getParent(request.parentId)]);
  if (!player || !parent) return undefined;
  const checkout = await provider.createDepositCheckout({
    request,
    academyName: getAcademy(request.academy)?.name ?? request.academy,
    player,
    parent,
    amountPence: request.depositPence ?? depositFor(request.academy),
    baseUrl,
  });
  await store.attachDepositCheckout(request.id, checkout.id);
  // Close a previous unpaid checkout so the deposit can't be paid twice
  if (request.stripeCheckoutSessionId && request.stripeCheckoutSessionId !== checkout.id) {
    await provider.expireCheckout(request.stripeCheckoutSessionId);
  }
  return checkout;
}

/** Keep the trial request but without a deposit, and send the standard confirmation. */
export async function continueWithoutDeposit(request: TrialRequest) {
  const store = getStore();
  await store.markDepositUnpaid(request.id);
  const [player, parent] = await Promise.all([store.getPlayer(request.playerId), store.getParent(request.parentId)]);
  if (player && parent) {
    try {
      await sendTrialRequestConfirmation({ parent, player, academyKey: request.academy, preferredDays: request.preferredDays });
    } catch (err) {
      console.error("[hillrisers] trial request email failed", err);
    }
  }
}
