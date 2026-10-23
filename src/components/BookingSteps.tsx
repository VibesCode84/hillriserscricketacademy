import Link from "next/link";
import { Reveal } from "./Reveal";

export const bookingSteps = [
  {
    t: "Register your interest",
    b: "What your child wants from cricket and which sessions they can make. Free, no commitment.",
  },
  {
    t: "We shape the programmes",
    b: "Groups, days and times planned around your answers.",
  },
  {
    t: "We'll be in touch",
    b: "When programmes are ready, we'll contact you with the details.",
  },
  {
    t: "Try a session",
    b: "Your child can try a session before you commit.",
  },
];

export function BookingSteps({ tone = "light", showTermsLink = true }: { tone?: "light" | "dark"; showTermsLink?: boolean }) {
  const light = tone === "light";
  return (
    <div>
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
