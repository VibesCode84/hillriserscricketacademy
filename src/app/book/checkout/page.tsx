import type { Metadata } from "next";
import Link from "next/link";
import { getSession, formatTimeRange } from "@/data/sessions";
import { formatPrice, site } from "@/data/site";
import { getStore } from "@/lib/booking";
import { ConfirmPlaceButton } from "@/components/booking/ConfirmPlaceButton";
import { buttonClass } from "@/components/Button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Academy Place", robots: { index: false } };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-28 md:pt-36">
      <div className="container-x max-w-3xl">{children}</div>
    </section>
  );
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const { booking: bookingId } = await searchParams;
  const store = getStore();
  const booking = bookingId && /^[0-9a-f-]{36}$/i.test(bookingId) ? await store.getBooking(bookingId) : undefined;
  const session = booking && getSession(booking.sessionId);
  const player = booking && (await store.getPlayer(booking.playerId));

  if (!booking || !session || !player) {
    return (
      <Shell>
        <h1 className="text-5xl text-navy-950">We couldn&rsquo;t find that booking.</h1>
        <p className="mt-4 text-lg text-ink-muted">It may have expired. Start again and we&rsquo;ll find your player the right session.</p>
        <Link href="/book" className={buttonClass("dark", "mt-8")}>Book a trial</Link>
      </Shell>
    );
  }

  if (booking.status === "confirmed") {
    return (
      <Shell>
        <p className="eyebrow">Confirmed</p>
        <h1 className="mt-4 text-5xl text-navy-950">{player.name.split(" ")[0]}&rsquo;s place is confirmed.</h1>
        <p className="mt-4 text-lg text-ink-muted">Check your inbox for your welcome email with everything you need.</p>
        <Link href="/" className={buttonClass("dark", "mt-8")}>Back to home</Link>
      </Shell>
    );
  }

  const holdLive = booking.status === "pending_payment" && booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() > Date.now();
  if (!holdLive) {
    return (
      <Shell>
        <p className="eyebrow">Place released</p>
        <h1 className="mt-4 text-5xl text-navy-950">Your reserved place has timed out.</h1>
        <p className="mt-4 text-lg text-ink-muted">
          We hold places for a short time while you pay, so groups never go over 18. Choose the session again — it only takes a moment.
        </p>
        <Link href={`/book?session=${session.id}`} className={buttonClass("dark", "mt-8")}>Choose session again</Link>
      </Shell>
    );
  }

  const rows: [string, string][] = [
    ["Player", player.name],
    ["Academy", session.title],
    ["Group", session.group],
    ["Day", session.day],
    ["Time", formatTimeRange(session)],
    ["Venue", site.venue.name],
    ["Session fee", formatPrice(session.pricePence)],
  ];
  const minutesLeft = Math.max(1, Math.round((new Date(booking.holdExpiresAt!).getTime() - Date.now()) / 60000));

  return (
    <Shell>
      <p className="eyebrow">Step 4 · Secure place</p>
      <h1 className="mt-4 text-5xl text-navy-950 md:text-6xl">Your Academy Place</h1>
      <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)]">
        <dl className="divide-y divide-navy-950/10 px-6 md:px-10">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 py-4">
              <dt className="text-sm font-semibold text-ink-muted">{k}</dt>
              <dd className={`text-right ${k === "Session fee" ? "font-serif text-3xl" : "text-lg"} text-navy-950`}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="bg-navy-950 px-6 py-8 text-cream md:px-10">
          <ConfirmPlaceButton bookingId={booking.id} label={`Confirm Place — ${formatPrice(session.pricePence)}`} />
          <p className="mt-4 flex items-center gap-2 text-sm text-slate">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Secure payment powered by Stripe. Apple Pay and Google Pay accepted where available.
          </p>
          <p className="mt-2 text-sm text-slate">
            We&rsquo;re holding this place for {player.name.split(" ")[0]} for about {minutesLeft} more minute{minutesLeft === 1 ? "" : "s"}.
          </p>
        </div>
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        Free cancellation more than 48 hours before the session — see our <Link href="/refunds" className="underline underline-offset-2">refund policy</Link>.
        Need to change something? <Link href={`/book?session=${session.id}`} className="underline underline-offset-2">Start again</Link>.
      </p>
    </Shell>
  );
}
