import Link from "next/link";
import { launch } from "@/data/launch";
import { Reveal } from "./Reveal";

export const bookingSteps = [
  {
    t: "Register your interest",
    b: "Tell us when your child can attend and what they want from cricket. It takes a few minutes and costs nothing.",
  },
  {
    t: "Timetable published",
    b: `We build the timetable around registered families, who then get ${launch.priorityBookingHours} hours’ priority booking.`,
  },
  {
    t: "Book a trial session",
    b: `Trials run in the first week of term (${launch.trialWeek}). You pay a deposit equal to one session fee.`,
  },
  {
    t: "After the trial",
    b: `Joining? The deposit is credited to the remaining sessions, and you book autumn and spring terms together — paid in full or monthly. Not joining? The deposit is refunded, provided your child attended or you cancelled with at least ${launch.trialCancellationHours} hours’ notice.`,
  },
  {
    t: "Regular sessions start",
    b: `From ${launch.regularSessionsFrom}.`,
  },
];

export function BookingSteps({ tone = "light", showTermsLink = true }: { tone?: "light" | "dark"; showTermsLink?: boolean }) {
  const light = tone === "light";
  return (
    <div>
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {bookingSteps.map((s, i) => (
          <Reveal as="li" key={s.t} delay={i * 70} className={`rounded-2xl p-6 ${light ? "bg-white" : "bg-navy-900"}`}>
            <span className={`font-serif text-4xl ${light ? "text-gold-deep" : "text-gold"}`}>{i + 1}</span>
            <h3 className={`mt-3 text-2xl ${light ? "text-navy-950" : "text-cream"}`}>{s.t}</h3>
            <p className={`mt-2 text-[0.95rem] leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>{s.b}</p>
          </Reveal>
        ))}
      </ol>
      {showTermsLink && (
        <p className={`mt-6 text-sm ${light ? "text-ink-muted" : "text-slate"}`}>
          Full details are in our{" "}
          <Link href="/terms" className={`underline underline-offset-4 ${light ? "text-navy-950" : "text-cream"}`}>terms and conditions</Link>.
        </p>
      )}
    </div>
  );
}
