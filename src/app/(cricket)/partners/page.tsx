import { redirect } from "next/navigation";
import { blockDays, documentKinds, releasedBlocks, shortDate, timeLabel } from "@/data/partners";
import { currentPartner } from "@/lib/partners/session";
import { RegisterPartner, ResendLink, SignIn } from "@/components/partners/RegisterPartner";

export const dynamic = "force-dynamic";

export default async function PartnersHome({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  if (await currentPartner()) redirect("/partners/portal");
  const { link } = await searchParams;
  return (
    <div>
      <section className="bg-navy-950 pb-16 pt-12 text-cream md:pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Coaches and delivery partners</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.05] md:text-6xl">Deliver sessions with HillRisers at John Lyon School.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">
              Run your coaching sessions as a HillRisers delivery partner in the John Lyon School sports hall, Harrow on the Hill — scheduled by the
              block, with live availability.
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
              <li>Create your partner account below. Partner fees are shown once you&rsquo;re signed in.</li>
              <li>Choose your nets and times on the live grid — each booking is the same slot every week of the block.</li>
              <li>Pay securely by card through Stripe. Your slots are held for 30 minutes while you pay.</li>
              <li>Upload your documents. You can book straight away; we check documents before your first session.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-2xl">Sessions available</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Hourly slots in the John Lyon School sports hall. Each booking is the same slot every week of the block.
            </p>
            <div className="mt-4 space-y-6">
              {releasedBlocks.map((block) => (
                <div key={block.id} className="overflow-hidden rounded-2xl bg-white">
                  <div className="border-b border-navy-950/10 px-5 py-3">
                    <h3 className="text-xl">{block.label}</h3>
                    <p className="text-sm text-ink-muted">{block.summary}</p>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-ink-muted">
                      <tr>
                        <th className="px-5 py-2 font-semibold">Day</th>
                        <th className="px-5 py-2 font-semibold">Times</th>
                        <th className="px-5 py-2 font-semibold">Weeks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-950/5">
                      {blockDays(block).map((d) => (
                        <tr key={d.day} className="align-top">
                          <td className="px-5 py-2.5 font-semibold">{d.day}s</td>
                          <td className="whitespace-nowrap px-5 py-2.5">{timeLabel(d.from)}–{timeLabel(d.to)}</td>
                          <td className="px-5 py-2.5 text-ink-muted">
                            {d.dates.length} weeks · {shortDate(d.dates[0])} – {shortDate(d.dates.at(-1)!)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {block.notes.length > 0 && (
                    <ul className="list-disc space-y-1 border-t border-navy-950/10 py-3 pl-10 pr-5 text-sm text-ink-muted">
                      {block.notes.map((n) => <li key={n}>{n}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
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
          <div id="sign-in" className="scroll-mt-6 rounded-3xl bg-white p-6 md:p-8">
            <h2 className="text-2xl">Already registered? Sign in</h2>
            <p className="mt-1 text-sm text-ink-muted">See your bookings and payments, and pay any balance.</p>
            <div className="mt-5"><SignIn /></div>
            <div className="mt-8 border-t border-navy-950/10 pt-6">
              <h3 className="text-lg">Forgotten your password, or haven&rsquo;t set one?</h3>
              <p className="mt-1 text-sm text-ink-muted">We&rsquo;ll email you a link that signs you in. You can then set a new password under Account.</p>
              <div className="mt-4"><ResendLink /></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
