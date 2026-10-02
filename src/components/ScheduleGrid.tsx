import Link from "next/link";
import { DAYS, durationMinutes, formatTimeRange, sessions, isBookable } from "@/data/sessions";
import { getAcademy } from "@/data/academies";
import { formatPrice } from "@/data/site";
import type { SessionAvailability } from "@/lib/booking";
import { AvailabilityBadge, sessionCta, slotMeta, slotTitle } from "./SessionCard";

/**
 * Weekly timetable. Shows days and time slots; a slot shows its academy only
 * once one has been assigned in src/data/sessions.ts.
 */
export function ScheduleGrid({ availability }: { availability: Record<string, SessionAvailability> | null }) {
  const days = DAYS.map((day) => ({
    day,
    items: sessions.filter((s) => s.active && s.day === day).sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "")),
  })).filter((d) => d.items.length);
  const anyUnassigned = sessions.some((s) => s.active && !isBookable(s));

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {days.map(({ day, items }) => (
          <div key={day} className="rounded-2xl border border-cream/10 bg-navy-900/70 p-5">
            <div className="border-b border-cream/10 pb-4">
              <h3 className="text-[1.75rem] text-cream">{day}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate">{items[0].block}</p>
            </div>
            <ul className="mt-2 divide-y divide-cream/10">
              {items.map((s) => {
                const a = availability?.[s.id];
                const cta = sessionCta(s, a);
                const academy = s.discipline ? getAcademy(s.discipline) : undefined;
                return (
                  <li key={s.id} className="py-5">
                    <p className="text-sm font-semibold text-gold">{formatTimeRange(s)}</p>
                    <p className="mt-1.5 font-serif text-xl leading-snug text-cream">
                      {academy ? <Link href={academy.href} className="link-underline">{slotTitle(s)}</Link> : slotTitle(s)}
                    </p>
                    <p className="mt-1 text-sm text-slate">
                      {[slotMeta(s), `${durationMinutes(s)} minutes · ${formatPrice(s.pricePence)}`].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <AvailabilityBadge session={s} availability={a} />
                      <Link href={cta.href} className="link-underline text-sm font-semibold text-gold-soft hover:text-gold">
                        {cta.label} →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {anyUnassigned && (
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate">
          We&rsquo;re finalising which academy runs in each slot, and the weekend session times. Request a trial with the days that suit
          you and we&rsquo;ll confirm the right session for your child before you pay anything.
        </p>
      )}
    </div>
  );
}
