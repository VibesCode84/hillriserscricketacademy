import type { Metadata } from "next";
import Link from "next/link";
import { launch } from "@/data/launch";
import { formatPrice } from "@/data/site";
import { REGISTRATION_FEE_PENCE } from "@/data/programmes";
import { LegalPage } from "@/components/LegalPage";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Draft terms and conditions for HillRisers Cricket Academy: trial deposits, booking autumn and spring, cancellations, missed sessions and safeguarding.",
  alternates: { canonical: "/terms" },
};

const sections = [
  ["about", "About these terms"],
  ["interest", "Registering your interest"],
  ["trial", "Trial sessions and deposits"],
  ["booking", "Booking autumn and spring terms"],
  ["cancellation", "Your cancellation rights"],
  ["missed", "Missed sessions"],
  ["injury", "Injury or long illness"],
  ["changes", "Changes to times and groups"],
  ["tiers", "Moving between programmes"],
  ["safeguarding", "Safeguarding and photography"],
  ["liability", "Liability"],
  ["law", "Governing law"],
] as const;

/* TODO: owner to confirm all wording; add legal entity details. */
export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Policies"
      title="Terms and Conditions"
      intro={<p>How booking, trials, payments and cancellations work at HillRisers Cricket Academy.</p>}
    >
      <nav aria-label="Contents" className="mb-12 rounded-2xl bg-cream-200 p-6">
        <p className="!mb-3 font-semibold text-navy-950">Contents</p>
        <ol className="grid list-decimal gap-x-8 gap-y-1 pl-5 sm:grid-cols-2">
          {sections.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <h2 id="about">1. About these terms</h2>
      <p>
        These terms apply when you book coaching with HillRisers Cricket Academy (&ldquo;HillRisers&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;). The person booking must be the child&rsquo;s parent or legal guardian and aged 18 or over. To get in touch,{" "}
        <ContactLink />.
      </p>

      <h2 id="interest">2. Registering your interest</h2>
      <p>
        Registering your interest is free and does not commit you to anything. Registered families get {launch.priorityBookingHours}{" "}
        hours&rsquo; priority booking when the timetable is published. Registering does not guarantee a place.
      </p>

      <h2 id="trial">3. Trial sessions and deposits</h2>
      <ul>
        <li>Trial sessions run in trial week ({launch.trialWeek}). Your child&rsquo;s trial is on the same day of the week as the group they plan to join.</li>
        <li>To book a trial, you pay a deposit equal to one session fee.</li>
        <li>If your child joins after the trial, the deposit is credited to their remaining sessions.</li>
        <li>
          If your child does not join, we refund the deposit, provided your child attended the trial or you cancelled with at least{" "}
          {launch.trialCancellationHours} hours&rsquo; notice.
        </li>
        <li>New players pay a one-off registration fee of {formatPrice(REGISTRATION_FEE_PENCE)}, which includes a HillRisers playing shirt.</li>
      </ul>

      <h2 id="booking">4. Booking autumn and spring terms</h2>
      <ul>
        <li>After the trial, players join for the autumn and spring terms together.</li>
        <li>You can pay in full, or monthly.</li>
        <li>
          The autumn and spring balance (or the first monthly payment) is due by 9am, at least {launch.paymentNoticeDays} days before your
          child&rsquo;s first regular (non-trial) session:{" "}
          {launch.paymentDeadlines.map((d) => `${d.due} for a first session on ${d.firstSession}`).join("; ")}.
        </li>
        <li>Prices are shown on our <Link href="/programmes">programmes page</Link> and confirmed when you book.</li>
      </ul>

      <h2 id="cancellation">5. Your cancellation rights</h2>
      <p>
        When you book online you have a 14-day cancellation period. If you ask us to start coaching within those 14 days and then cancel, we
        may charge a proportionate amount for the coaching already provided.
      </p>

      <h2 id="missed">6. Missed sessions</h2>
      <p>
        We don&rsquo;t refund sessions your child misses. Where possible, we may offer a make-up session.
      </p>

      <h2 id="injury">7. Injury or long illness</h2>
      <p>
        If your child cannot take part for a long period because of injury or illness, please tell us as soon as possible and we&rsquo;ll
        discuss the options with you.
      </p>

      <h2 id="changes">8. Changes to times and groups</h2>
      <p>
        We may need to adjust session times or merge groups. We&rsquo;ll give you notice of any change.
      </p>

      <h2 id="tiers">9. Moving between programmes</h2>
      <p>
        Players are placed by ability and may move between programmes when they&rsquo;re ready. Where the new programme has a different
        price, the difference will apply from the move.
      </p>

      <h2 id="safeguarding">10. Safeguarding and photography</h2>
      <ul>
        <li>
          Every HillRisers coach holds an enhanced cricket DBS check and safeguarding training. See our{" "}
          <Link href="/safeguarding">safeguarding page</Link>.
        </li>
        <li>We will only use photographs or video of your child publicly with your consent, which you can withdraw at any time.</li>
      </ul>

      <h2 id="liability">11. Liability</h2>
      <p>
        Cricket is a physical sport and carries some risk of injury. Nothing in these terms limits our liability for death or personal
        injury caused by our negligence, or anything else that cannot be limited by law. Your statutory rights are not affected.
      </p>

      <h2 id="law">12. Governing law</h2>
      <p>These terms are governed by the law of England and Wales.</p>
    </LegalPage>
  );
}
