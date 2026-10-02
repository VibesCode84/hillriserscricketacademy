import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Accessibility", alternates: { canonical: "/accessibility" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Trust" title="Accessibility">
      <h2>This website</h2>
      <p>
        We want everyone to be able to use this website. It is designed to work with screen readers, keyboard navigation and browser
        zoom, respects reduced-motion settings, and uses colour contrast in line with WCAG 2.2 AA guidance.
      </p>
      <h2>Our sessions</h2>
      <p>
        Cricket is for everyone. If your child has additional needs, tell us when booking or get in touch beforehand and we&rsquo;ll
        talk about how we can make the session work for them.
      </p>
      <h2>Feedback</h2>
      <p>
        If something on this site doesn&rsquo;t work for you, please email <a href={`mailto:${site.email}`}>{site.email}</a> and we&rsquo;ll fix it.
      </p>
    </LegalPage>
  );
}
