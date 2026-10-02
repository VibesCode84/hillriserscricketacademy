import type { Metadata } from "next";
import Link from "next/link";
import { depositFor, getAcademy } from "@/data/academies";
import { formatPrice } from "@/data/site";
import { getStore } from "@/lib/booking";
import { DepositActions } from "@/components/booking/DepositActions";
import { buttonClass } from "@/components/Button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Secure Your Place", robots: { index: false } };

/** Where Stripe sends parents who leave the deposit checkout without paying. */
export default async function DepositPage({ searchParams }: { searchParams: Promise<{ request?: string }> }) {
  const { request: id } = await searchParams;
  const store = getStore();
  const request = id && /^[0-9a-f-]{36}$/i.test(id) ? await store.getTrialRequest(id) : undefined;
  const player = request && (await store.getPlayer(request.playerId));

  return (
    <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-28 md:pt-36">
      <div className="container-x max-w-3xl">
        {!request || !player ? (
          <>
            <h1 className="text-5xl text-navy-950">We couldn&rsquo;t find that request.</h1>
            <Link href="/book" className={buttonClass("dark", "mt-8")}>Request a trial</Link>
          </>
        ) : request.depositStatus === "paid" || request.depositStatus === "applied" ? (
          <>
            <p className="eyebrow">Place secured</p>
            <h1 className="mt-4 text-5xl text-navy-950">{player.name.split(" ")[0]}&rsquo;s deposit is paid.</h1>
            <p className="mt-4 text-lg text-ink-muted">We&rsquo;ll be in touch soon to confirm the day and time.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">Secure the place</p>
            <h1 className="mt-4 text-5xl text-navy-950">Your trial request is saved.</h1>
            <p className="mt-4 text-lg text-ink-muted">
              You can still secure {player.name.split(" ")[0]}&rsquo;s place in {getAcademy(request.academy)?.name ?? "the academy"} with a{" "}
              {formatPrice(request.depositPence ?? depositFor(request.academy))} refundable holding deposit. It&rsquo;s credited to the trial
              session, and refunded in full if we can&rsquo;t offer a session that suits you.
            </p>
            <div className="mt-8">
              <DepositActions requestId={request.id} amountLabel={formatPrice(request.depositPence ?? depositFor(request.academy))} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
