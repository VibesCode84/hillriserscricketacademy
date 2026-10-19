import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = { title: "Safeguarding", alternates: { canonical: "/safeguarding" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Policies" title="Safeguarding" intro={<p>Every child should feel safe, respected and able to enjoy their cricket.</p>}>
      <h2>Our commitment</h2>
      <p>HillRisers Cricket Academy is committed to safeguarding and promoting the welfare of every child who takes part.</p>
      <h2>Our coaches</h2>
      <ul>
        <li>Every HillRisers coach holds an ECB coaching qualification, an enhanced cricket DBS check and safeguarding training.</li>
        <li>Junior helpers always work under the supervision of a qualified coach.</li>
        <li>Photographs will only be used publicly where a parent has given consent.</li>
      </ul>
      <h2>Welfare contact</h2>
      <p>
        {site.welfareEmail ? (
          <>
            If you have any concern about a child&rsquo;s welfare, contact our welfare officer at{" "}
            <a href={`mailto:${site.welfareEmail}`}>{site.welfareEmail}</a>.
          </>
        ) : (
          <>
            We will publish our welfare officer&rsquo;s contact details before sessions start. In the meantime, if you have a concern,{" "}
            <ContactLink />.
          </>
        )}{" "}
        If a child is in immediate danger, call 999.
      </p>
    </LegalPage>
  );
}
