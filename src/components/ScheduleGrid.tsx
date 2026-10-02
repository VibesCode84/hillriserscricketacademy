"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DAYS, formatTimeRange, sessions, type AcademySession, type Day } from "@/data/sessions";
import { academies } from "@/data/academies";
import { formatPrice } from "@/data/site";
import type { SessionAvailability } from "@/lib/booking";
import { AvailabilityBadge, sessionCta } from "./SessionCard";

const venueNotes: Record<Day, string> = {
  Tuesday: "John Lyon weekday academy block",
  Wednesday: "John Lyon weekday academy block",
  Saturday: "John Lyon weekend block",
  Sunday: "John Lyon Sunday block",
};

type Filter = "all" | "girls" | "little" | "specialist";

export function ScheduleGrid({
  availability,
  initialFilter = "all",
}: {
  availability: Record<string, SessionAvailability> | null;
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const visible = useMemo(() => {
    const active = sessions.filter((s) => s.active);
    const match = (s: AcademySession) =>
      filter === "all" ||
      (filter === "girls" && (s.girlsOnly || s.discipline !== "little-cricketers")) ||
      (filter === "little" && s.discipline === "little-cricketers") ||
      (filter === "specialist" && s.discipline !== "little-cricketers" && !s.girlsOnly);
    return DAYS.map((day) => ({
      day,
      items: active.filter((s) => s.day === day && match(s)).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
  }, [filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All sessions" },
    { key: "specialist", label: "Specialist academy" },
    { key: "girls", label: "Open to girls" },
    { key: "little", label: "Little Cricketers" },
  ];

  return (
    <div>
      <div role="group" aria-label="Filter sessions" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
              filter === f.key ? "border-gold bg-gold text-navy-950" : "border-cream/20 text-cream/80 hover:border-gold/60 hover:text-cream"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {visible.map(({ day, items }) => (
          <div key={day} className="rounded-2xl border border-cream/10 bg-navy-900/70 p-5">
            <div className="border-b border-cream/10 pb-4">
              <h3 className="text-[1.75rem] text-cream">{day}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate">{venueNotes[day]}</p>
            </div>
            <ul className="mt-2 divide-y divide-cream/10">
              {items.length === 0 && <li className="py-6 text-sm text-slate">No sessions match this filter.</li>}
              {items.map((s) => {
                const a = availability?.[s.id];
                const cta = sessionCta(s, a);
                const academy = academies.find((x) => x.key === s.discipline);
                return (
                  <li key={s.id} className="py-5 transition-opacity duration-300">
                    <p className="text-sm font-semibold text-gold">
                      {formatTimeRange(s)}
                      {!s.confirmed && <span className="font-normal text-slate"> · provisional</span>}
                    </p>
                    <p className="mt-1.5 font-serif text-xl leading-snug text-cream">
                      {academy ? (
                        <Link href={academy.href} className="link-underline">{s.title}</Link>
                      ) : (
                        s.title
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate">
                      {s.group} · Ages {s.ageMin}–{s.ageMax}
                      {s.girlsOnly && " · Girls only"} · {formatPrice(s.pricePence)}
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
      <p className="mt-6 text-sm text-slate">
        Saturday and Sunday times are provisional while the John Lyon weekend blocks are confirmed. Register your interest and we&rsquo;ll
        be in touch as soon as they are fixed.
      </p>
    </div>
  );
}
