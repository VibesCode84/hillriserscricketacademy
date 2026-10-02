import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Booking Terms", alternates: { canonical: "/terms" } };

export default function Page() {
  return (
    <LegalPage eyebrow="Trust" title="Booking Terms">
      <h2>Bookings</h2>
      <p>A place is confirmed once payment has been received. You&rsquo;ll receive a confirmation email with everything you need for the session.</p>
      <h2>Group sizes</h2>
      <p>Academy sessions have a maximum of 18 players. Once a session is full, you can join the waiting list at no cost.</p>
      <h2>Kit and safety</h2>
      <p>Players must wear appropriate protective equipment for hard-ball activities. Coaches may adapt activities for safety at any time.</p>
      <h2>Behaviour</h2>
      <p>We expect players, parents and coaches to treat each other with respect, in line with the spirit of cricket.</p>
      <h2>Cancellations and refunds</h2>
      <p>See our <Link href="/refunds">refund policy</Link>.</p>
    </LegalPage>
  );
}
