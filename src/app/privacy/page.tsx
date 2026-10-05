import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Policies" title="Privacy Policy">
      <h2>What we collect</h2>
      <p>
        When you register your interest we collect your name, email, mobile and postcode, and for each child their first name, date of
        birth, school and club (if you give them), cricket level, preferences and availability. We don&rsquo;t collect medical information
        at this stage.
      </p>
      <p>
        When you book a session we will also ask for emergency contact details and any medical or additional needs, so we can keep your child
        safe.
      </p>
      <h2>Why we collect it</h2>
      <ul>
        <li>To plan the timetable and the right groups for each child.</li>
        <li>To contact you about HillRisers sessions, as you agreed when registering.</li>
        <li>To send news and offers — only if you opted in.</li>
        <li>To meet our safeguarding responsibilities once sessions start.</li>
      </ul>
      <h2>How we store it</h2>
      <p>
        Your details are stored securely and are only available to the HillRisers team. Payments are processed by Stripe; we never see or
        store full card details.
      </p>
      <h2>Who we share it with</h2>
      <p>Only the coaching team working with your child, and service providers who help us run bookings, payments and email. We never sell your data.</p>
      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete the information we hold, or withdraw consent, at any time — just <ContactLink />.
      </p>
    </LegalPage>
  );
}
