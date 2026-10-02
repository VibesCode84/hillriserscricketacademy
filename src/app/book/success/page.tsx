import type { Metadata } from "next";
import Link from "next/link";
import { getSession, formatTimeRange, sessionLabel } from "@/data/sessions";
import { coachesFor } from "@/data/coaches";
import { site } from "@/data/site";
import { getStore } from "@/lib/booking";
import { AutoRefresh } from "@/components/booking/AutoRefresh";
import { buttonClass } from "@/components/Button";
import { Crest } from "@/components/Logo";
import { TermDates } from "@/components/TermDates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Welcome to HillRisers", robots: { index: false } };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: checkoutId } = await searchParams;
  const store = getStore();
  // The redirect is not proof of payment: we only show "confirmed" once the webhook has updated the booking.
  const booking = checkoutId ? await store.findBookingByCheckoutId(checkoutId) : undefined;
  const session = booking && getSession(booking.sessionId);
  const player = booking && (await store.getPlayer(booking.playerId));
  const parent = booking && (await store.getParent(booking.parentId));

  if (!booking || !session || !player || !parent) {
    return (
      <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-36">
        <div className="container-x max-w-3xl">
          <h1 className="text-5xl text-navy-950">Thank you.</h1>
          <p className="mt-4 text-lg text-ink-muted">
            If you&rsquo;ve completed payment, your confirmation email is on its way. Any questions, call us on {site.phone}.
          </p>
        </div>
      </section>
    );
  }

  const first = player.name.split(" ")[0];
  const confirmed = booking.status === "confirmed";
  const coach = session.discipline ? coachesFor(session.discipline)[0] : undefined;

  if (!confirmed) {
    return (
      <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-36">
        <div className="container-x max-w-3xl">
          <p className="eyebrow">Confirming</p>
          <h1 className="mt-4 text-5xl text-navy-950">Confirming {first}&rsquo;s place…</h1>
          <p className="mt-4 text-lg text-ink-muted">We&rsquo;re just waiting for confirmation from our payment provider. This usually takes a few seconds.</p>
          <AutoRefresh />
        </div>
      </section>
    );
  }

  const nextSteps = [
    { t: "What to bring", b: "Sportswear, indoor trainers, a named water bottle and any cricket kit they have. For hard-ball sessions a helmet, pads and gloves are essential — reply to your email if you need to borrow kit." },
    { t: "When you arrive", b: `Arrive 10 minutes early at ${site.venue.name}. A coach will meet you at the entrance and sign ${first} in.` },
    { t: "Your coach", b: coach ? `${coach.name} (${coach.role}) and the coaching team know ${first} is new and will help them settle in.` : `The coaching team know ${first} is new and will help them settle in.` },
    { t: "Afterwards", b: `Within a day or two we'll ask how ${first} found it, and recommend their academy pathway.` },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 pb-16 pt-32 md:pt-40">
        <div className="container-x max-w-4xl text-center">
          <Crest className="mx-auto h-14 w-auto" />
          <p className="eyebrow mt-8 justify-center">Place confirmed</p>
          <h1 className="mt-5 text-5xl leading-[1.02] text-cream md:text-7xl">Welcome to HillRisers, {first}.</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate">
            {sessionLabel(session)} · {session.day} {formatTimeRange(session)} · {site.venue.name}
          </p>
          <p className="mt-3 text-sm text-slate">
            A confirmation has been sent to {parent.email}. Booking reference {booking.id.slice(0, 8).toUpperCase()}.
          </p>
          <TermDates className="mt-6 justify-center" />
        </div>
      </section>
      <section className="surface-light bg-cream py-20">
        <div className="container-x grid max-w-5xl gap-6 md:grid-cols-2">
          {nextSteps.map((s) => (
            <div key={s.t} className="rounded-2xl bg-white p-7">
              <h2 className="text-2xl text-navy-950">{s.t}</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{s.b}</p>
            </div>
          ))}
        </div>
        <div className="container-x mt-12 flex max-w-5xl flex-col gap-3 sm:flex-row">
          <Link href="/venue" className={buttonClass("dark")}>Venue &amp; parking</Link>
          <Link href="/refer" className="rounded-full border border-navy-950/20 px-6 py-3.5 text-center font-semibold text-navy-950 hover:border-navy-950">
            Cricket is better with a mate — invite a friend
          </Link>
        </div>
      </section>
    </>
  );
}
