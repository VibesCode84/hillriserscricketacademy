import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Refund Policy", alternates: { canonical: "/refunds" } };

// TODO: confirm refund terms with the academy before launch.
export default function Page() {
  return (
    <LegalPage eyebrow="Trust" title="Refund Policy">
      <h2>Holding deposits</h2>
      <p>
        If you paid a refundable holding deposit with a trial request, we&rsquo;ll refund it in full if we can&rsquo;t offer a session that
        suits you, or if you ask before your child&rsquo;s trial session is confirmed. Once the session is confirmed, the deposit pays for
        it and the cancellation terms below apply.
      </p>
      <h2>Term fees</h2>
      <p>
        Fees are paid termly and are due one week before the term&rsquo;s sessions start. If you withdraw before the due date, we&rsquo;ll
        refund any term fee you&rsquo;ve paid in full. After that, term fees are non-refundable except where we cancel sessions, or at our
        discretion in exceptional circumstances such as long-term injury or illness.
      </p>
      <h2>If you need to cancel a single session or trial</h2>
      <p>Cancel more than 48 hours before the session and we&rsquo;ll refund you in full to your original payment method.</p>
      <p>For cancellations within 48 hours we&rsquo;ll try to offer a transfer to another session where places allow.</p>
      <h2>If we cancel</h2>
      <p>If we have to cancel a session, for example because the venue is unavailable, you&rsquo;ll always be offered a full refund or a free transfer.</p>
      <h2>How to cancel</h2>
      <p>
        Email <a href={`mailto:${site.email}`}>{site.email}</a> with your booking reference. Refunds are processed through Stripe and
        usually reach your account within 5–10 working days.
      </p>
    </LegalPage>
  );
}
