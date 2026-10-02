import Link from "next/link";
import type { DisciplineKey } from "@/data/academies";
import { DAYS, formatTimeRange, sessions, sessionsFor } from "@/data/sessions";
import type { SessionAvailability } from "@/lib/booking";
import { SessionCard } from "./SessionCard";
import { ButtonLink } from "./Button";

/**
 * Session times for one academy. Shows bookable slots once the academy has been
 * assigned to days in src/data/sessions.ts; until then, explains that the
 * programme is being finalised and takes a trial request with preferred days.
 */
export function WhenItRuns({
  discipline,
  availability,
}: {
  discipline: DisciplineKey;
  availability: Record<string, SessionAvailability> | null;
}) {
  const slots = sessionsFor(discipline);
  if (slots.length) {
    return (
      <div className="grid gap-5">
        {slots.map((s) => (
          <SessionCard key={s.id} session={s} availability={availability?.[s.id]} />
        ))}
      </div>
    );
  }

  const days = DAYS.map((day) => ({
    day,
    times: sessions.filter((s) => s.active && s.day === day).map((s) => formatTimeRange(s)),
  })).filter((d) => d.times.length);

  return (
    <div className="rounded-2xl border border-cream/10 bg-navy-900 p-6 md:p-8">
      <p className="font-serif text-2xl text-cream">Days and times being finalised</p>
      <p className="mt-3 leading-relaxed text-slate">
        Academy sessions run on these days at John Lyon School. We&rsquo;re finalising which academy runs on which day — tell us the days
        that suit you and we&rsquo;ll confirm the right session before you pay anything.
      </p>
      <ul className="mt-6 divide-y divide-cream/10 border-y border-cream/10">
        {days.map((d) => (
          <li key={d.day} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <span className="text-cream">{d.day}</span>
            <span className="text-sm text-slate">{[...new Set(d.times)].join(" · ")}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonLink href={`/book?discipline=${discipline}`}>Request a trial</ButtonLink>
        <Link href="/sessions" className="link-underline text-sm font-semibold text-gold">See the full timetable</Link>
      </div>
    </div>
  );
}
