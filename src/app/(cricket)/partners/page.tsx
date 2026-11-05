import { redirect } from "next/navigation";
import { documentKinds, REFUND_DAYS_BEFORE, releasedBlocks } from "@/data/partners";
import { currentPartner } from "@/lib/partners/session";
import { RegisterPartner, ResendLink, SignIn } from "@/components/partners/RegisterPartner";
import { PartnerEnquiryForm } from "@/components/partners/PartnerEnquiryForm";
import { BookingGrid } from "@/components/partners/PartnerPortal";

export const dynamic = "force-dynamic";

export default async function PartnersHome({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  if (await currentPartner()) redirect("/partners/account");
  const { link } = await searchParams;
  return (
    <div>
      <section className="bg-navy-950 pb-16 pt-12 text-cream md:pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Coaches and delivery partners</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.05] md:text-6xl">Deliver sessions with HillRisers at John Lyon School.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">
              Book nets by the block in the John Lyon School sports hall, Harrow on the Hill.
            </p>
          </div>
          <dl className="grid gap-4 self-end sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/25 bg-navy-900 p-5">
              <dt className="text-sm text-slate">Indoor nets</dt>
              <dd className="mt-1 font-serif text-3xl text-gold">3<span className="text-base text-slate"> in the sports hall</span></dd>
            </div>
            <div className="rounded-2xl border border-gold/25 bg-navy-900 p-5">
              <dt className="text-sm text-slate">Bowling machine</dt>
              <dd className="mt-1 font-serif text-3xl text-gold">1<span className="text-base text-slate"> available to book</span></dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-x grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl">How it works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-muted">
              <li>Create an account and upload your documents.</li>
              <li>Send a booking request with your nets and termly or monthly payment.</li>
              <li>We email your invoice, payable by bank transfer within 24 hours.</li>
              <li>Your first payment confirms the booking.</li>
            </ol>
            <p className="mt-3 text-sm text-ink-muted">
              First come, first served. Sessions up to Christmas are invoiced in full. Refunds only if you cancel more than {REFUND_DAYS_BEFORE} days before
              your first session.
            </p>
          </div>
          <p>
            <a href="#availability" className="font-semibold underline underline-offset-4">See live availability</a>
            <span className="text-ink-muted"> — no account needed.</span>
          </p>
          <div>
            <h2 className="text-2xl">Documents you&rsquo;ll need</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {documentKinds.filter((d) => d.value !== "other").map((d) => <li key={d.value}>{d.label}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl bg-cream-200 p-5 text-sm">
            <strong>Bowling machine:</strong> one machine, so one net per time slot. You must supply your own balls, and it must be operated by a Level 2
            qualified coach.
          </div>
        </div>

        <div className="space-y-6">
          {link === "invalid" && (
            <p className="rounded-2xl border border-[#8c1d18]/30 bg-[#fbeae8] p-4 text-sm text-[#8c1d18]" role="alert">
              That sign-in link has expired or been used. Ask for a new one below.
            </p>
          )}
          <div id="register" className="scroll-mt-6 rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
            <h2 className="text-3xl">Create a partner account</h2>
            <div className="mt-6"><RegisterPartner /></div>
          </div>
          <div id="talk-first" className="scroll-mt-6 rounded-3xl bg-white p-6 md:p-8">
            <h2 className="text-2xl">Want to talk first?</h2>
            <p className="mt-1 text-sm text-ink-muted">Not ready to send a booking request? Send us a message and we&rsquo;ll be in touch.</p>
            <div className="mt-5"><PartnerEnquiryForm /></div>
          </div>
          <div id="sign-in" className="scroll-mt-6 rounded-3xl bg-white p-6 md:p-8">
            <h2 className="text-2xl">Already registered? Sign in</h2>
            <p className="mt-1 text-sm text-ink-muted">See your bookings, invoices and payments.</p>
            <div className="mt-5"><SignIn /></div>
            <div className="mt-8 border-t border-navy-950/10 pt-6">
              <h3 className="text-lg">Forgotten your password, or haven&rsquo;t set one?</h3>
              <p className="mt-1 text-sm text-ink-muted">We&rsquo;ll email you a sign-in link.</p>
              <div className="mt-4"><ResendLink /></div>
            </div>
          </div>
        </div>
      </section>

      <section id="availability" className="scroll-mt-6 border-t border-navy-950/10 bg-cream-200/60 py-14">
        <div className="container-x">
          <h2 className="text-4xl">Live availability</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">Hourly slots in the John Lyon School sports hall.</p>
          {releasedBlocks.map((block) => <BookingGrid key={block.id} block={block} guest />)}
        </div>
      </section>
    </div>
  );
}
