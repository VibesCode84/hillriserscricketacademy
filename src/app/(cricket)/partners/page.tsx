import { redirect } from "next/navigation";
import { BOWLING_MACHINE_PENCE, documentKinds, PARTNER_RATE_PENCE, partnerBlocks } from "@/data/partners";
import { formatPrice } from "@/data/site";
import { currentPartner } from "@/lib/partners/session";
import { RegisterPartner, ResendLink } from "@/components/partners/RegisterPartner";

export const dynamic = "force-dynamic";

export default async function PartnersHome({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  if (await currentPartner()) redirect("/partners/portal");
  const { link } = await searchParams;
  const block = partnerBlocks[0];
  return (
    <main>
      <section className="bg-navy-950 pb-16 pt-12 text-cream md:pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Coaches and delivery partners</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.05] md:text-6xl">Book nets at John Lyon School.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">
              Hire indoor nets in the John Lyon School sports hall, Harrow on the Hill, for your own coaching sessions — booked by the block, with
              live availability.
            </p>
          </div>
          <dl className="grid gap-4 self-end sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/25 bg-navy-900 p-5">
              <dt className="text-sm text-slate">Net hire</dt>
              <dd className="mt-1 font-serif text-3xl text-gold">{formatPrice(PARTNER_RATE_PENCE)}<span className="text-base text-slate"> per net per hour</span></dd>
            </div>
            <div className="rounded-2xl border border-gold/25 bg-navy-900 p-5">
              <dt className="text-sm text-slate">Bowling machine</dt>
              <dd className="mt-1 font-serif text-3xl text-gold">+{formatPrice(BOWLING_MACHINE_PENCE)}<span className="text-base text-slate"> per hour</span></dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-x grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl">How it works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-muted">
              <li>Create your partner account below.</li>
              <li>Choose your nets and times on the live grid — each booking is the same slot every week of the block.</li>
              <li>Pay securely by card through Stripe. Your nets are held for 30 minutes while you pay.</li>
              <li>Upload your documents. You can book straight away; we check documents before your first session.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-2xl">Now booking: {block.label}</h2>
            <p className="mt-1 text-ink-muted">{block.summary}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {block.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl">Documents you&rsquo;ll need</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {documentKinds.filter((d) => d.value !== "other").map((d) => <li key={d.value}>{d.label}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#8c1d18]/25 bg-[#fbeae8] p-5 text-sm text-[#8c1d18]">
            <strong>No filming or video.</strong> No filming or video recording of any kind is permitted at the venue, including on phones.
          </div>
          <div className="rounded-2xl bg-cream-200 p-5 text-sm">
            <strong>Bowling machine:</strong> one machine, so one net per time slot. You must supply your own balls, and it must be operated by a Level 2
            qualified coach.
          </div>
        </div>

        <div className="space-y-6">
          {link === "invalid" && (
            <p className="rounded-2xl border border-[#8c1d18]/30 bg-[#fbeae8] p-4 text-sm text-[#8c1d18]" role="alert">
              That portal link isn&rsquo;t valid any more. Ask for a new one below.
            </p>
          )}
          <div className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
            <h2 className="text-3xl">Create a partner account</h2>
            <p className="mt-1 text-sm text-ink-muted">Takes a minute. You&rsquo;ll go straight to the booking grid.</p>
            <div className="mt-6"><RegisterPartner /></div>
          </div>
          <div className="rounded-3xl bg-white p-6 md:p-8">
            <h2 className="text-xl">Already registered?</h2>
            <p className="mt-1 text-sm text-ink-muted">Use the private portal link we gave you, or get a new one by email.</p>
            <div className="mt-4"><ResendLink /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
