import { notFound } from "next/navigation";
import { devPaymentsEnabled } from "@/lib/payments";
import { getPartnerStore } from "@/lib/partners/store";
import { formatPrice } from "@/data/site";
import { DevPartnerCheckoutButtons } from "@/components/partners/DevCheckout";

export const dynamic = "force-dynamic";

/** Development-only stand-in for Stripe Checkout */
export default async function DevPartnerCheckout({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  if (!devPaymentsEnabled()) notFound();
  const id = (await searchParams).booking ?? "";
  const booking = await getPartnerStore().getBooking(id);
  if (!booking) notFound();
  return (
    <main className="container-x max-w-xl py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">Test payment — Stripe isn&rsquo;t connected</p>
      <h1 className="mt-3 text-4xl">
        Pay{" "}
        {formatPrice(
          booking.status === "reserved" ? booking.totalPence - (booking.depositPence ?? 0) : booking.plan === "deposit" ? (booking.depositPence ?? booking.totalPence) : booking.totalPence,
        )}
        {booking.status === "reserved" ? " (balance)" : booking.plan === "deposit" ? " (deposit)" : ""}
      </h1>
      <p className="mt-3 text-ink-muted">{booking.items.length} net{booking.items.length === 1 ? "" : "s"} for the block. No money is taken on this test page.</p>
      <DevPartnerCheckoutButtons bookingId={booking.id} />
    </main>
  );
}
