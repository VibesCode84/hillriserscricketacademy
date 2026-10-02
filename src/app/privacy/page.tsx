import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Trust" title="Privacy Policy">
      <h2>What we collect</h2>
      <p>
        When you book or enquire we collect parent/guardian contact details, your child&rsquo;s name, date of birth, cricket experience,
        emergency contact details and any medical or additional needs you choose to share.
      </p>
      <h2>Why we collect it</h2>
      <ul>
        <li>To place your child in the right session and run it safely.</li>
        <li>To contact you about bookings, changes and your child&rsquo;s progress.</li>
        <li>To meet our safeguarding responsibilities.</li>
      </ul>
      <h2>Payments</h2>
      <p>Payments are processed by Stripe. We never see or store your full card details.</p>
      <h2>Who we share it with</h2>
      <p>Only the coaching team working with your child, and service providers who help us run bookings, payments and email. We never sell your data.</p>
      <h2>How long we keep it</h2>
      <p>We keep booking records for as long as needed to run the academy and meet legal obligations, then delete them securely.</p>
      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete the information we hold at any time by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
