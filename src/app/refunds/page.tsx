import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Refund Policy", alternates: { canonical: "/refunds" } };

// TODO: confirm refund terms with the academy before launch.
export default function Page() {
  return (
    <LegalPage eyebrow="Trust" title="Refund Policy">
      <h2>If you need to cancel</h2>
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
