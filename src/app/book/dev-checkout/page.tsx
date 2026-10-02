import { notFound } from "next/navigation";
import { getSession, formatTimeRange, sessionLabel } from "@/data/sessions";
import { depositFor, getAcademy } from "@/data/academies";
import { formatPrice } from "@/data/site";
import { getStore } from "@/lib/booking";
import { devPaymentsEnabled } from "@/lib/payments";
import { DevCheckoutButtons } from "@/components/booking/DevCheckoutButtons";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

/** Stand-in for Stripe Checkout in local development (no STRIPE_SECRET_KEY). */
export default async function DevCheckoutPage({ searchParams }: { searchParams: Promise<{ booking?: string; deposit?: string }> }) {
  if (!devPaymentsEnabled()) notFound();
  const { booking: bookingId, deposit: depositId } = await searchParams;
  const store = getStore();

  let product: string, amount: number, detail: string, target: { bookingId?: string; trialRequestId?: string };
  if (depositId) {
    const request = await store.getTrialRequest(depositId);
    if (!request) notFound();
    product = "Hillrisers refundable holding deposit";
    amount = request.depositPence ?? depositFor(request.academy);
    detail = getAcademy(request.academy)?.name ?? request.academy;
    target = { trialRequestId: request.id };
  } else {
    const booking = bookingId ? await store.getBooking(bookingId) : undefined;
    const session = booking && getSession(booking.sessionId);
    if (!booking || !session) notFound();
    product = "Hillrisers Cricket Academy Session";
    amount = session.pricePence;
    detail = `${sessionLabel(session)} · ${session.day} ${formatTimeRange(session)}`;
    target = { bookingId: booking.id };
  }

  return (
    <section className="min-h-screen bg-[#f6f9fc] pb-24 pt-32 text-[#1a1f36]">
      <div className="mx-auto max-w-md px-5">
        <p className="rounded-lg bg-[#fff4e5] p-3 text-sm text-[#8a5300]">
          <strong>Development checkout.</strong> Add <code>STRIPE_SECRET_KEY</code> to use real Stripe Checkout.
        </p>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-[#697386]">{product}</p>
          <p className="mt-1 text-3xl font-semibold">{formatPrice(amount)}</p>
          <p className="mt-2 text-sm text-[#697386]">{detail}</p>
          <DevCheckoutButtons {...target} />
        </div>
      </div>
    </section>
  );
}
