import type { Metadata } from "next";
import Link from "next/link";
import { launch } from "@/data/launch";
import { LegalPage } from "@/components/LegalPage";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = { title: "Refunds", alternates: { canonical: "/refunds" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Policies" title="Refunds">
      <h2>Trial deposits</h2>
      <p>
        If your child joins after their trial, the deposit is credited to their remaining sessions. If they don&rsquo;t join, we refund the
        deposit, provided they attended the trial or you cancelled with at least {launch.trialCancellationHours} hours&rsquo; notice.
      </p>
      <h2>Online bookings</h2>
      <p>
        You have a 14-day cancellation period for online bookings. If coaching starts within that period at your request, we may charge a
        proportionate amount for the coaching already provided.
      </p>
      <h2>Missed sessions</h2>
      <p>Missed sessions are not refunded. Where possible, we may offer a make-up session.</p>
      <h2>How refunds are paid</h2>
      <p>
        Refunds go back to your original payment method. To ask about a refund, <ContactLink />. Full details are in our{" "}
        <Link href="/terms">terms and conditions</Link>.
      </p>
    </LegalPage>
  );
}
