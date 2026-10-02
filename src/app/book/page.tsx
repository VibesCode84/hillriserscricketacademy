import type { Metadata } from "next";
import { getAvailability } from "@/lib/booking";
import { academies, type DisciplineKey } from "@/data/academies";
import { DAYS, getSession, type Day } from "@/data/sessions";
import { testimonials } from "@/data/testimonials";
import { BookingFlow, type BookingPrefill } from "@/components/booking/BookingFlow";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Crest } from "@/components/Logo";
import type { Experience, Gender, Interest } from "@/lib/booking/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book a Trial",
  description: "Book a trial session at Hillrisers Cricket Academy, John Lyon School, Harrow. Tell us about your player and we'll recommend the right group.",
  alternates: { canonical: "/book" },
};

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const pick = <T extends string>(v: string | undefined, allowed: readonly T[]) => (allowed.includes(v as T) ? (v as T) : undefined);

export default async function BookPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const availability = await getAvailability();
  const sessionId = one(sp.session);
  const age = Number(one(sp.age));
  const prefill: BookingPrefill = {
    sessionId: sessionId && getSession(sessionId) ? sessionId : undefined,
    discipline: pick(one(sp.discipline), academies.map((a) => a.key) as DisciplineKey[]),
    age: Number.isInteger(age) && age >= 3 && age <= 18 ? age : undefined,
    gender: pick<Gender>(one(sp.gender), ["boy", "girl", "unspecified"]),
    experience: pick<Experience>(one(sp.experience), ["new", "some", "regular", "performance"]),
    interest: pick<Interest>(one(sp.interest), ["batting", "seam", "spin", "all-round", "not-sure"]),
    referredBy: one(sp.ref)?.slice(0, 60),
    day: pick<Day>(one(sp.day), DAYS),
  };

  return (
    <section className="surface-light min-h-screen bg-cream-200 pb-24 pt-28 md:pt-36">
      <div className="container-x grid gap-12 lg:grid-cols-[1.5fr_0.7fr]">
        <div>
          <p className="eyebrow">Book a trial</p>
          <h1 className="mt-4 text-[2.75rem] leading-[1.02] text-navy-950 md:text-6xl">Let&rsquo;s find the right place for your player.</h1>
          <p className="mb-10 mt-4 max-w-2xl text-lg text-ink-muted">
            A few questions, a recommended session, then secure their place. It takes about three minutes.
          </p>
          <BookingFlow availability={availability} prefill={prefill} />
        </div>
        <aside className="space-y-6 lg:pt-44">
          <div className="rounded-3xl bg-navy-950 p-7 text-cream">
            <Crest className="h-10 w-auto" />
            <h2 className="mt-5 text-2xl">Every trial includes</h2>
            <ul className="mt-4 space-y-3 text-[0.95rem] text-cream/85">
              {[
                "90 minutes of specialist coaching",
                "A coaching team of four, max 18 players",
                "A coach who knows your child is new",
                "A follow-up call to recommend their pathway",
                "No term commitment",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="text-gold" aria-hidden="true">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <TestimonialCard t={testimonials[0]} />
        </aside>
      </div>
    </section>
  );
}
