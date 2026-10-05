import type { Metadata } from "next";
import { launch } from "@/data/launch";
import { InterestForm } from "@/components/InterestForm";
import { KeyDates } from "@/components/KeyDates";

export const metadata: Metadata = {
  title: "Register Your Interest",
  description:
    "Tell us when your child can attend and what they want from cricket. HillRisers will build the timetable around registered families, who get priority booking.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-28 md:pt-36">
      <div className="container-x grid gap-12 lg:grid-cols-[1.5fr_0.7fr]">
        <div>
          <p className="eyebrow">Register your interest</p>
          <h1 className="mt-4 text-[2.75rem] leading-[1.02] text-navy-950 md:text-6xl">Tell us about your cricketer.</h1>
          <p className="mb-10 mt-4 max-w-2xl text-lg text-ink-muted">
            When can your child attend, and what do they want from cricket? We&rsquo;ll build the timetable around your answers.
            Registered families get {launch.priorityBookingHours} hours&rsquo; priority booking. It takes about five minutes per child.
          </p>
          <InterestForm />
        </div>
        <aside className="space-y-6 lg:pt-44">
          <div className="rounded-3xl bg-navy-950 p-7 text-cream">
            <h2 className="text-2xl">Why register?</h2>
            <ul className="mt-4 space-y-3 text-[0.95rem] text-cream/85">
              {[
                "Shape the timetable — days, times and session lengths",
                `${launch.priorityBookingHours} hours' priority booking before places open to everyone`,
                "No payment and no commitment",
                "Add every child in one go",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="text-gold" aria-hidden="true">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-2xl text-navy-950">Key dates</h2>
            <KeyDates />
          </div>
        </aside>
      </div>
    </section>
  );
}
