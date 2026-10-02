import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Safeguarding", alternates: { canonical: "/safeguarding" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Trust" title="Safeguarding" intro={<p>Every child should feel safe, respected and able to enjoy their cricket.</p>}>
      <h2>Our commitment</h2>
      <p>
        Hillrisers Cricket Academy is committed to safeguarding and promoting the welfare of every child who attends our sessions.
        {/* TODO: reference the specific safeguarding framework the academy follows, once confirmed. */}
      </p>
      <h2>Our coaching environment</h2>
      <ul>
        <li>All coaches and adult helpers working with players are DBS checked.</li>
        <li>Junior helpers are supervised by qualified coaches at all times.</li>
        <li>Players are signed in on arrival and only released to a parent or named adult.</li>
        <li>Medical and additional needs shared at booking are passed to the session&rsquo;s coaching team.</li>
        <li>Photographs are only used publicly where a parent has given consent.</li>
      </ul>
      <h2>Welfare contact</h2>
      <p>
        If you have any concern about a child&rsquo;s welfare, please contact our welfare officer, {site.welfareOfficer.name}, at{" "}
        <a href={`mailto:${site.welfareOfficer.email}`}>{site.welfareOfficer.email}</a>. If a child is in immediate danger, call 999.
      </p>
      <h2>Our full policy</h2>
      <p>A copy of our full safeguarding policy is available on request.</p>
    </LegalPage>
  );
}
