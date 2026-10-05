import type { ReactNode } from "react";
import { ButtonLink } from "./Button";
import { Reveal } from "./Reveal";

export function CTASection({
  title = "Help us build the timetable around your child.",
  body = "Tell us when your child can attend and what they want from cricket. Registered families get priority booking.",
  primary = { href: "/register", label: "Register your interest" },
  secondary = { href: "/how-booking-works", label: "How booking works" },
  children,
}: {
  title?: ReactNode;
  body?: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg className="absolute bottom-0 left-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 400">
          <path d="M0 360 C 360 330 620 220 900 180 S 1300 120 1440 80" stroke="#d5a93f" strokeOpacity="0.25" fill="none" />
          <path d="M0 390 C 380 370 660 270 940 230 S 1320 170 1440 140" stroke="#e8cf83" strokeOpacity="0.1" fill="none" />
        </svg>
      </div>
      <Reveal className="container-x relative text-center">
        <h2 className="mx-auto max-w-4xl text-[2.5rem] leading-[1.05] text-cream md:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate">{body}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={primary.href} arrow className="group w-full sm:w-auto">{primary.label}</ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="secondary" className="w-full sm:w-auto">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
        {children}
      </Reveal>
    </section>
  );
}

/** Repeated reassurance line — appears throughout the site. */
export function NotSureBanner({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-6 md:flex-row md:items-center md:justify-between md:p-7 ${
        light ? "border-navy-950/10 bg-white" : "border-gold/25 bg-navy-900"
      }`}
    >
      <p className={`max-w-2xl text-[1.05rem] leading-relaxed ${light ? "text-navy-950" : "text-cream"}`}>
        <span className="font-serif text-xl">Not sure which group is right?</span>{" "}
        <span className={light ? "text-ink-muted" : "text-slate"}>
          You don&rsquo;t need to know. Tell us about your child and we&rsquo;ll place them by ability, not just age.
        </span>
      </p>
      <ButtonLink href="/register" variant={light ? "dark" : "secondary"} className="shrink-0">
        Register your interest
      </ButtonLink>
    </div>
  );
}
