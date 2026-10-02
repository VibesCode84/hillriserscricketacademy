import type { Metadata } from "next";
import { PageHero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { ReferralShare } from "@/components/ReferralShare";

export const metadata: Metadata = {
  title: "Invite a Friend — Cricket Is Better With a Mate",
  description: "Invite a friend to try a session at HillRisers Cricket Academy.",
  alternates: { canonical: "/refer" },
};

export default function ReferPage() {
  return (
    <>
      <PageHero
        eyebrow="Invite a friend"
        title="Cricket is better with a mate."
        intro={<p>Know someone who&rsquo;d love it? Send them an invitation to book a trial — it&rsquo;s more fun learning alongside a friend.</p>}
      />
      <Section tone="cream" className="!pt-14">
        <div className="mx-auto max-w-2xl">
          <ReferralShare />
        </div>
      </Section>
    </>
  );
}
