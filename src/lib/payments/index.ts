import Stripe from "stripe";
import { site } from "../../data/site";
import { sessionLabel, type AcademySession } from "../../data/sessions";
import type { Booking, Parent, Player } from "../booking/types";
import { STRIPE_CHECKOUT_MINUTES } from "../booking";
import type { NetBooking, Partner } from "../partners/store";
import { getBlock, PARTNER_HOLD_MINUTES, timeLabel } from "../../data/partners";
import { cardFeePence } from "../../data/invoicing";

/**
 * Payment layer. Stripe is replaceable: the rest of the app only talks to
 * this interface, and the academy database stays the source of truth.
 */
export type CheckoutInput = {
  booking: Booking;
  session: AcademySession;
  player: Player;
  parent: Parent;
  baseUrl: string;
};

export type CheckoutResult = { id: string; url: string; expiresAt?: string };


export interface PaymentProvider {
  name: "stripe" | "dev";
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  /** Close a superseded checkout so it can't also be paid. */
  expireCheckout(id: string): Promise<void>;
}

let stripeClient: Stripe | undefined;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return undefined;
  // Fetch-based client works in Node and on Cloudflare Workers
  return (stripeClient ??= new Stripe(key, { httpClient: Stripe.createFetchHttpClient() }));
}

class StripeProvider implements PaymentProvider {
  name = "stripe" as const;
  constructor(private stripe: Stripe) {}

  async createCheckout({ booking, session, player, parent, baseUrl }: CheckoutInput) {
    const priceId = session.stripePriceId ?? process.env.STRIPE_ACADEMY_PRICE_ID;
    const expiresAt = Math.floor(Date.now() / 1000) + STRIPE_CHECKOUT_MINUTES * 60;
    const description = `${sessionLabel(session)} · ${session.day} ${session.startTime}–${session.endTime} · ${site.venue.name}`;
    const checkout = await this.stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parent.email,
      client_reference_id: booking.id,
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "gbp",
                unit_amount: session.pricePence,
                product_data: { name: "HillRisers Cricket Academy Session", description },
              },
            },
      ],
      payment_intent_data: {
        description: `${player.name} — ${description}`,
        metadata: {
          bookingId: booking.id,
          playerId: player.id,
          parentId: parent.id,
          academySessionId: session.id,
        },
      },
      metadata: {
        bookingId: booking.id,
        playerId: player.id,
        academySessionId: session.id,
        parentId: parent.id,
      },
      custom_text: {
        submit: {
          message: `Place for ${player.name} in ${session.title}, ${session.day} ${session.startTime}. Free cancellation up to 48 hours before the session.`,
        },
      },
      allow_promotion_codes: true,
      expires_at: expiresAt,
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/checkout?booking=${booking.id}`,
    });
    if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
    return { id: checkout.id, url: checkout.url, expiresAt: new Date(expiresAt * 1000).toISOString() };
  }

  async expireCheckout(id: string) {
    try {
      await this.stripe.checkout.sessions.expire(id);
    } catch (err) {
      // Already completed or expired — nothing to do
      console.warn("[hillrisers] could not expire checkout", id, (err as Error).message);
    }
  }
}

/** Development-only stand-in so the full journey can be tried without Stripe keys. */
class DevProvider implements PaymentProvider {
  name = "dev" as const;
  async createCheckout({ booking, baseUrl }: CheckoutInput) {
    const id = `dev_cs_${booking.id}`;
    return { id, url: `${baseUrl}/book/dev-checkout?booking=${booking.id}` };
  }

  async expireCheckout() {}
}

export function devPaymentsEnabled() {
  return !process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== "production";
}

export function getPaymentProvider(): PaymentProvider | undefined {
  const stripe = getStripe();
  if (stripe) return new StripeProvider(stripe);
  if (devPaymentsEnabled()) return new DevProvider();
  return undefined;
}

/* ── Delivery partner net booking──────────────────────────────────────────── */


/**
 * Stripe Checkout for a block booking: the first payment (in full, or the deposit) or,
 * for a reserved booking, the balance. The dev stand-in is used locally without Stripe keys.
 */
export async function createPartnerCheckout(booking: NetBooking, partner: Partner, baseUrl: string, stage: "initial" | "balance" = "initial"): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    if (!devPaymentsEnabled()) throw new Error("Payments are not set up yet");
    return { id: `dev_cs_${stage}_${booking.id}`, url: `${baseUrl}/partners/dev-checkout?booking=${booking.id}` };
  }
  const block = getBlock(booking.blockId);
  const label = block?.label ?? booking.blockId;
  const nets = booking.items.map((i) => `Net ${i.net} ${i.day.slice(0, 3)} ${timeLabel(i.start)}${i.bowlingMachine ? " + machine" : ""}`).join(", ");
  const single = (name: string, amount: number) => [
    { quantity: 1, price_data: { currency: "gbp", unit_amount: amount, product_data: { name, description: `${nets} · ${site.venue.name}`.slice(0, 500) } } },
  ];
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    stage === "balance"
      ? single(`${label} — balance`, booking.totalPence - (booking.depositPence ?? 0))
      : booking.plan === "deposit"
        ? single(`${label} — ${block?.deposit?.percent ?? ""}% deposit to reserve`, booking.depositPence ?? booking.totalPence)
        : booking.items.map((i) => ({
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: i.pricePence,
              product_data: {
                name: `Net ${i.net} · ${i.day} ${timeLabel(i.start)}–${timeLabel(i.end)}${i.bowlingMachine ? " + bowling machine" : ""}`,
                description: `${label} · ${i.weeks} weeks · ${site.venue.name}`,
              },
            },
          }));
  // Card payments carry a processing fee so Stripe's charge doesn't come out of the booking price
  const base = stage === "balance" ? booking.totalPence - (booking.depositPence ?? 0) : booking.plan === "deposit" ? (booking.depositPence ?? booking.totalPence) : booking.totalPence;
  const fee = cardFeePence(base);
  line_items.push({
    quantity: 1,
    price_data: {
      currency: "gbp",
      unit_amount: fee,
      product_data: { name: "Card processing fee" },
    },
  });
  const expiresAt = Math.floor(Date.now() / 1000) + PARTNER_HOLD_MINUTES * 60;
  const metadata = { kind: "partner", partnerBookingId: booking.id, partnerId: partner.id, stage, cardFeePence: String(fee) };
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: partner.email,
    client_reference_id: booking.id,
    line_items,
    metadata,
    payment_intent_data: {
      description: `${partner.orgName} — delivery partner sessions, ${label}${stage === "balance" ? " (balance)" : booking.plan === "deposit" ? " (deposit)" : ""}`,
      metadata,
    },
    expires_at: expiresAt,
    success_url: `${baseUrl}/partners/account?paid=${booking.id}${stage === "balance" ? "&balance=1" : ""}`,
    // Abandoning a balance payment leaves the reservation as it was
    cancel_url: stage === "balance" || booking.method === "bank" ? `${baseUrl}/partners/account` : `${baseUrl}/partners/portal?cancelled=${booking.id}`,
  });
  if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
  return { id: checkout.id, url: checkout.url, expiresAt: new Date(expiresAt * 1000).toISOString() };
}
