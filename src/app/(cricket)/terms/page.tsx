import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions for HillRisers Cricket Academy: registering your interest, booking, safeguarding and photography.",
  alternates: { canonical: "/terms" },
};

const sections = [
  ["about", "About these terms"],
  ["interest", "Registering your interest"],
  ["booking", "Booking"],
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
      intro={<p>How registering your interest works at HillRisers Cricket Academy.</p>}
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
        These terms apply when you register your interest in, or book coaching with, HillRisers Cricket Academy (&ldquo;HillRisers&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;). The person booking must be the child&rsquo;s parent or legal guardian and aged 18 or over. To get in touch,{" "}
        <ContactLink />.
      </p>

      <h2 id="interest">2. Registering your interest</h2>
      <p>
        Registering your interest is free and does not commit you to anything. We use your answers to plan our programmes. Registering
        does not guarantee a place.
      </p>

      <h2 id="booking">3. Booking</h2>
      <p>
        Fees, payment and cancellation terms will be published before booking opens.
      </p>

      <h2 id="safeguarding">4. Safeguarding and photography</h2>
      <ul>
        <li>
          Every HillRisers coach holds an enhanced cricket DBS check and safeguarding training. See our{" "}
          <Link href="/safeguarding">safeguarding page</Link>.
        </li>
        <li>We will only use photographs or video of your child publicly with your consent, which you can withdraw at any time.</li>
      </ul>

      <h2 id="liability">5. Liability</h2>
      <p>
        Cricket is a physical sport and carries some risk of injury. Nothing in these terms limits our liability for death or personal
        injury caused by our negligence, or anything else that cannot be limited by law. Your statutory rights are not affected.
      </p>

      <h2 id="law">6. Governing law</h2>
      <p>These terms are governed by the law of England and Wales.</p>
    </LegalPage>
  );
}
