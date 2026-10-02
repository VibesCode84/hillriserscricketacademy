import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";
import { PAYMENT_DUE_DAYS_BEFORE, formatTermDate, paymentDueDate, termStartLabel, terms } from "@/data/term";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms and conditions for booking sessions, trials and waiting-list places at HillRisers Cricket Academy.",
  alternates: { canonical: "/terms" },
};

const sections = [
  ["about", "About these terms"],
  ["sessions", "Our sessions"],
  ["trials", "Trial requests, deposits and waiting lists"],
  ["booking", "Booking and payment"],
  ["cancel-you", "If you need to cancel"],
  ["cancel-us", "If we cancel or change a session"],
  ["refunds", "Refunds"],
  ["health", "Health and medical information"],
  ["kit", "Kit and safety"],
  ["supervision", "Arrival, supervision and collection"],
  ["behaviour", "Behaviour"],
  ["safeguarding", "Safeguarding"],
  ["photos", "Photography and video"],
  ["belongings", "Personal belongings"],
  ["liability", "Injury and liability"],
  ["venue", "The venue"],
  ["data", "Your information"],
  ["complaints", "Questions and complaints"],
  ["changes", "Changes to these terms"],
  ["law", "Governing law"],
] as const;

/*
 * TODO before launch: have these terms reviewed by a solicitor, and fill in
 * the academy's legal entity (sole trader / company name and number), the
 * registered address and insurance details.
 */
export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Trust"
      title="Terms and Conditions"
      intro={<p>The agreement between your family and HillRisers Cricket Academy when you book a session, request a trial or join a waiting list.</p>}
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
        These terms apply to every booking, trial request and waiting-list place with HillRisers Cricket Academy (&ldquo;HillRisers&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;). You can contact us at <a href={`mailto:${site.email}`}>{site.email}</a> or on {site.phone}.
      </p>
      <p>
        The person making the booking (&ldquo;you&rdquo;) must be the child&rsquo;s parent or legal guardian, or have their permission, and be
        aged 18 or over. When you book, you accept these terms on behalf of yourself and the player. Please read them alongside our{" "}
        <Link href="/refunds">refund policy</Link>, <Link href="/safeguarding">safeguarding information</Link> and{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2 id="sessions">2. Our sessions</h2>
      <ul>
        <li>Sessions are junior cricket coaching for players aged approximately 4–14, held at {site.venue.name}, Harrow.</li>
        <li>
          Specialist academy sessions last 90 minutes and have a maximum of {site.standardSession.capacity} players. Each is led by a coaching
          team of a lead coach, an assistant coach and two junior helpers. Little Cricketers sessions (ages 4–7) last 60 minutes.
        </li>
        <li>
          We set the weekly programme, including which academy runs on which day and at what time. We may change it from term to term and
          will always tell you in advance about any change that affects a place you have booked.
        </li>
        <li>
          Coaches may adapt session content, groupings and activities to suit the players present, and for safety. If we think a different
          group would suit your child better, we&rsquo;ll talk to you first.
        </li>
        <li>
          We help players develop, but we cannot promise particular results or selection for any school, club, district or county team.
        </li>
      </ul>

      <h2 id="trials">3. Trial requests, deposits and waiting lists</h2>
      <ul>
        <li>
          You can send a trial request or join a waiting list free of charge. A free request or waiting-list place does not guarantee a place.
        </li>
        <li>
          While we finalise which academy runs on which day, you can secure your child&rsquo;s place by paying a{" "}
          <strong>refundable holding deposit</strong> when you request a trial. The deposit is the fee for the first session: £25 for a
          90-minute specialist academy session, or £15 for a 60-minute Little Cricketers session.
        </li>
        <li>
          Once we confirm a day and time with you, the deposit pays for your child&rsquo;s first (trial) session, so there is nothing more
          to pay for it, and it counts towards the term fee if your child continues for the term. From then on, the cancellation terms in
          section 5 apply to that session.
        </li>
        <li>
          We will refund the deposit in full if we can&rsquo;t offer a session that suits you, or if you ask us to before the trial session
          is confirmed.
        </li>
        <li>
          When we offer a place, we&rsquo;ll send you a link to book it. Offers may be time-limited so that the place can be offered to other
          families if it is not taken.
        </li>
        <li>
          We usually offer waiting-list places in the order families joined. We may take age, group balance and availability into account.
        </li>
      </ul>

      <h2 id="booking">4. Booking and payment</h2>
      <ul>
        <li>
          Prices are shown in pounds sterling on our website at the time you book. A 90-minute specialist academy session is currently £
          {site.standardSession.pricePence / 100}, and a 60-minute Little Cricketers session is £{site.littleCricketers.pricePence / 100}.
        </li>
        <li>
          <strong>Fees are paid termly.</strong> The term fee is the number of weekly sessions in the term multiplied by the session fee,
          and is due at least {PAYMENT_DUE_DAYS_BEFORE} days before the term&rsquo;s sessions start. Each term&rsquo;s due date is
          published with the term dates on our <Link href="/sessions#term-dates">timetable page</Link> — for example, our first term
          starts on {termStartLabel(terms[0])}, so fees are due by {formatTermDate(paymentDueDate(terms[0]), { weekday: true })}. Term
          dates follow the John Lyon School calendar. There are no academy sessions during half terms, including the weekends either
          side; we run holiday camps instead, which are booked separately.
        </li>
        <li>
          If the term fee hasn&rsquo;t been paid by the due date, we may offer your child&rsquo;s place to a family on the waiting list. Please
          talk to us if you need more time.
        </li>
        <li>Players joining after a term has started pay for the remaining sessions in that term.</li>
        <li>
          Payment is taken securely by our payment provider, Stripe. We never see or store your full card details.
        </li>
        <li>
          While you complete payment, we hold your child&rsquo;s place for a short time so that groups never go over capacity. If payment is
          not completed in that time, the place is released.
        </li>
        <li>
          A booking is confirmed only when payment has been received and we have sent you a confirmation email. If you don&rsquo;t receive it,
          please contact us before attending.
        </li>
        <li>You must give accurate information when booking and tell us promptly if anything changes.</li>
        <li>Promotional codes, where offered, cannot be exchanged for cash and may have their own conditions.</li>
      </ul>

      <h2 id="cancel-you">5. If you need to cancel</h2>
      <p>
        Because our sessions are leisure services provided on a specific date, the statutory 14-day cancellation period for online purchases
        does not apply. Instead, we offer the following.
      </p>
      <p>
        <strong>Term fees:</strong> if you withdraw your child before the term fee due date, we&rsquo;ll refund any term fee you have paid
        in full. After the due date, term fees are non-refundable, except where we cancel sessions (see section 6) or, at our discretion, in
        exceptional circumstances such as long-term injury or illness.
      </p>
      <p>
        <strong>Single sessions, including trials:</strong>
      </p>
      <ul>
        <li>
          <strong>More than 48 hours before the session:</strong> a full refund.
        </li>
        <li>
          <strong>Within 48 hours of the session:</strong> no refund, but we&rsquo;ll try to offer a transfer to another session where places
          allow.
        </li>
        <li>
          <strong>Not attending without telling us:</strong> no refund or transfer.
        </li>
      </ul>
      <p>
        To cancel, email <a href={`mailto:${site.email}`}>{site.email}</a> with your booking reference. If your child is ill or injured,
        please let us know as early as you can and we&rsquo;ll do our best to help.
      </p>

      <h2 id="cancel-us">6. If we cancel or change a session</h2>
      <p>
        Occasionally we may need to cancel or move a session, for example if the venue is unavailable, a coach is unwell, or we cannot run it
        safely. If we do:
      </p>
      <ul>
        <li>we&rsquo;ll tell you as soon as we can by email, text or phone;</li>
        <li>you can choose a full refund for the affected session, or a free transfer to another session where places allow;</li>
        <li>
          if we change the day or time of a session you&rsquo;ve booked and the new time doesn&rsquo;t suit you, you can have a full refund for
          the affected sessions.
        </li>
      </ul>
      <p>We are not responsible for other costs, such as travel, that result from a cancellation or change.</p>

      <h2 id="refunds">7. Refunds</h2>
      <p>
        Refunds are made to your original payment method through Stripe and usually arrive within 5–10 working days. Full details are in our{" "}
        <Link href="/refunds">refund policy</Link>.
      </p>

      <h2 id="health">8. Health and medical information</h2>
      <ul>
        <li>
          You must tell us about any medical condition, allergy, injury or additional need that could affect your child taking part, and keep
          us updated. We share this only with the coaching team who need to know.
        </li>
        <li>Please don&rsquo;t send your child to a session if they are unwell or have an infectious illness.</li>
        <li>Make sure your child brings any medication they may need, such as an inhaler, clearly labelled.</li>
        <li>
          By booking, you agree that our coaches may give first aid and, if we cannot reach you or your emergency contact, may seek emergency
          medical treatment for your child.
        </li>
      </ul>

      <h2 id="kit">9. Kit and safety</h2>
      <ul>
        <li>Players should wear comfortable sportswear and suitable trainers, and bring a named water bottle.</li>
        <li>
          For any hard-ball activity, players must wear appropriate protective equipment, including a helmet when batting or keeping wicket
          to a hard ball. Let us know if you need to borrow academy kit for a trial.
        </li>
        <li>
          Coaches may stop a player from taking part in an activity if they do not have suitable kit, or if they are not following safety
          instructions.
        </li>
      </ul>

      <h2 id="supervision">10. Arrival, supervision and collection</h2>
      <ul>
        <li>
          We are responsible for players only during the session, from when a coach signs them in until the session ends. Please arrive no
          more than 10 minutes before the start.
        </li>
        <li>Please collect your child promptly at the end of the session from the agreed meeting point.</li>
        <li>
          We will only release a child to a parent or guardian, or to an adult you have named to us in advance. Tell us beforehand if someone
          else is collecting.
        </li>
        <li>
          If you&rsquo;ll be late, call us. A coach will stay with your child, but repeated late collection may affect future bookings.
        </li>
      </ul>

      <h2 id="behaviour">11. Behaviour</h2>
      <p>
        We expect players, parents and coaches to treat each other with respect and to play in the spirit of cricket. If a player&rsquo;s
        behaviour is unsafe or repeatedly disruptive, a coach may remove them from an activity or ask you to collect them early. If problems
        continue, we&rsquo;ll talk to you, and we may end future bookings, refunding any sessions not yet taken. We expect the same
        standards of courtesy from parents and spectators.
      </p>

      <h2 id="safeguarding">12. Safeguarding</h2>
      <p>
        The welfare of every child comes first. All coaches and adult helpers working with players are DBS checked and follow our
        safeguarding policy. If we have a concern about a child&rsquo;s welfare, we will act in line with that policy, which may include
        sharing information with the relevant authorities. You can contact our welfare officer at any time at{" "}
        <a href={`mailto:${site.welfareOfficer.email}`}>{site.welfareOfficer.email}</a>. See our{" "}
        <Link href="/safeguarding">safeguarding page</Link>.
      </p>

      <h2 id="photos">13. Photography and video</h2>
      <ul>
        <li>
          We only use photographs or video of your child on our website, social media or marketing if you have given consent. You can withdraw
          consent at any time by emailing us, and we&rsquo;ll stop using new images straight away.
        </li>
        <li>Coaches may film technique for coaching feedback. This footage is used only for coaching and is not published.</li>
        <li>Please don&rsquo;t photograph or film other people&rsquo;s children without their parents&rsquo; permission.</li>
      </ul>

      <h2 id="belongings">14. Personal belongings</h2>
      <p>
        Please label your child&rsquo;s kit and belongings. We are not responsible for items that are lost, stolen or damaged at sessions,
        unless this is caused by our negligence.
      </p>

      <h2 id="liability">15. Injury and liability</h2>
      <p>
        Cricket is a physical sport and, like any sport, carries some risk of injury. We plan sessions carefully, follow age-appropriate
        guidance and take reasonable care to keep players safe.
      </p>
      <p>
        Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud, or for
        anything else that cannot be limited or excluded by law. Your legal rights as a consumer are not affected.
      </p>
      <p>
        Otherwise, our total liability to you for any booking is limited to the amount you paid for the session or sessions concerned, and we
        are not responsible for losses that were not reasonably foreseeable.
      </p>

      <h2 id="venue">16. The venue</h2>
      <p>
        Sessions take place at {site.venue.name} by arrangement with the school. Please follow the school&rsquo;s site rules and any
        instructions from school staff, including on parking and access. See our <Link href="/venue">venue page</Link> for arrival details.
      </p>

      <h2 id="data">17. Your information</h2>
      <p>
        We use the information you give us to run bookings, keep players safe and contact you about your child&rsquo;s sessions. Our{" "}
        <Link href="/privacy">privacy policy</Link> explains how we collect, use and protect it, and your rights.
      </p>

      <h2 id="complaints">18. Questions and complaints</h2>
      <p>
        If you&rsquo;re unhappy with anything, please tell us. Email <a href={`mailto:${site.email}`}>{site.email}</a> and we&rsquo;ll aim to
        reply within five working days. Safeguarding concerns should always go straight to our welfare officer.
      </p>

      <h2 id="changes">19. Changes to these terms</h2>
      <p>
        We may update these terms from time to time, for example to reflect changes to our programme or the law. The version on our website
        when you make a booking applies to that booking. We&rsquo;ll let you know about significant changes that affect bookings you have
        already made.
      </p>

      <h2 id="law">20. Governing law</h2>
      <p>
        These terms are governed by the law of England and Wales. Any dispute will be dealt with by the courts of England and Wales, although
        you may be able to bring proceedings where you live if you are in Scotland or Northern Ireland.
      </p>
    </LegalPage>
  );
}
