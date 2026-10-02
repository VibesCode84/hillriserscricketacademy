import type { Metadata } from "next";
import Link from "next/link";
import { depositFor, getAcademy } from "@/data/academies";
import { formatPrice, site } from "@/data/site";
import { getStore } from "@/lib/booking";
import { AutoRefresh } from "@/components/booking/AutoRefresh";
import { buttonClass } from "@/components/Button";
import { Crest } from "@/components/Logo";
import { TermDates } from "@/components/TermDates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Place Secured", robots: { index: false } };

export default async function DepositSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: checkoutId } = await searchParams;
  const store = getStore();
  // Only the webhook marks a deposit paid; the redirect alone proves nothing.
  const request = checkoutId ? await store.findTrialRequestByCheckoutId(checkoutId) : undefined;
  const player = request && (await store.getPlayer(request.playerId));
  const parent = request && (await store.getParent(request.parentId));

  if (!request || !player || !parent) {
    return (
      <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-36">
        <div className="container-x max-w-3xl">
          <h1 className="text-5xl text-navy-950">Thank you.</h1>
          <p className="mt-4 text-lg text-ink-muted">If you&rsquo;ve paid a deposit, your confirmation email is on its way. Questions? Call {site.phone}.</p>
        </div>
      </section>
    );
  }

  const first = player.name.split(" ")[0];
  if (request.depositStatus !== "paid" && request.depositStatus !== "applied") {
    return (
      <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-36">
        <div className="container-x max-w-3xl">
          <p className="eyebrow">Confirming</p>
          <h1 className="mt-4 text-5xl text-navy-950">Confirming {first}&rsquo;s deposit…</h1>
          <p className="mt-4 text-lg text-ink-muted">We&rsquo;re waiting for confirmation from our payment provider. This usually takes a few seconds.</p>
          <AutoRefresh />
        </div>
      </section>
    );
  }

  const academy = getAcademy(request.academy);
  const steps = [
    { t: "Your place is held", b: `${first}'s place in ${academy?.name ?? "the academy"} is secured while we finalise the weekly programme.` },
    { t: "We confirm the day and time", b: `A coach will contact you to confirm the best session${request.preferredDays.length ? ` (you said ${request.preferredDays.join(" or ")})` : ""}.` },
    { t: "Your deposit covers the trial", b: `The ${formatPrice(request.depositPence ?? depositFor(request.academy))} deposit is credited to ${first}'s trial session.` },
    { t: "Fully refundable", b: "If we can't offer a session that suits you, or you change your mind before it's confirmed, we'll refund it in full." },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 pb-16 pt-32 md:pt-40">
        <div className="container-x max-w-4xl text-center">
          <Crest className="mx-auto h-14 w-auto" />
          <p className="eyebrow mt-8 justify-center">Place secured</p>
          <h1 className="mt-5 text-5xl leading-[1.02] text-cream md:text-7xl">{first}&rsquo;s place is secured.</h1>
          <p className="mt-6 text-sm text-slate">
            A confirmation has been sent to {parent.email}. Reference {request.id.slice(0, 8).toUpperCase()}.
          </p>
          <TermDates className="mt-6 justify-center" />
        </div>
      </section>
      <section className="surface-light bg-cream py-20">
        <div className="container-x grid max-w-5xl gap-6 md:grid-cols-2">
          {steps.map((s) => (
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
