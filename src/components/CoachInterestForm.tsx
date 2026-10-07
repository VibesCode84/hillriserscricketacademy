"use client";

import { useState } from "react";
import { coachAvailabilityOptions as opts, coachRoles } from "@/lib/interest-options";
import { campDayOptions, campWeeks, sessionTerms } from "@/data/calendar";
import { buttonClass } from "./Button";

export function CoachInterestForm() {
  const [roles, setRoles] = useState<string[]>([]);
  const [firstAid, setFirstAid] = useState(false);
  const [saturday, setSaturday] = useState<string[]>([]);
  const [sunday, setSunday] = useState<string[]>([]);
  const [weekdayBlocks, setWeekdayBlocks] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [camps, setCamps] = useState<Record<string, string[]>>({});
  const [holidayWeekly, setHolidayWeekly] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggle = (r: string) => setRoles((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState("sending");
    setErrors({});
    try {
      const res = await fetch("/api/coach-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fd,
          roles,
          firstAid,
          availability: {
            saturday,
            sunday,
            weekdayBlocks,
            notes: fd.availabilityNotes,
            terms,
            summerNotes: fd.summerNotes,
            holidayWeekly: holidayWeekly || undefined,
            camps,
            campNotes: fd.campNotes,
          },
          availabilityNotes: undefined,
          summerNotes: undefined,
          campNotes: undefined,
          holidayWeeklyChoice: undefined,
          company: fd.company || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrors(json.errors ?? {});
        setMessage(json.message ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setMessage("We couldn't send that. Please check your connection and try again.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div role="status" className="rounded-2xl bg-navy-950 p-8 text-cream">
        <p className="eyebrow">Thank you</p>
        <p className="mt-4 font-serif text-3xl">We&rsquo;ll be in touch soon.</p>
        <p className="mt-3 text-slate">We&rsquo;ve emailed you to confirm we&rsquo;ve received your details.</p>
      </div>
    );
  }

  const text = (name: string, label: string, opts: { type?: string; optional?: boolean; area?: boolean; placeholder?: string; autoComplete?: string } = {}) => (
    <div className={opts.area ? "sm:col-span-2" : ""}>
      <label htmlFor={`co-${name}`} className="label">
        {label} {opts.optional && <span className="font-normal text-ink-muted">(optional)</span>}
      </label>
      {opts.area ? (
        <textarea id={`co-${name}`} name={name} rows={3} className="field" placeholder={opts.placeholder} aria-invalid={!!errors[name]} />
      ) : (
        <input id={`co-${name}`} name={name} type={opts.type ?? "text"} autoComplete={opts.autoComplete} className="field" placeholder={opts.placeholder} aria-invalid={!!errors[name]} />
      )}
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {text("name", "Name", { autoComplete: "name" })}
        {text("phone", "Phone", { type: "tel", autoComplete: "tel" })}
        {text("email", "Email", { type: "email", autoComplete: "email" })}
      </div>

      <fieldset aria-invalid={!!errors.roles}>
        <legend className="label">Role(s) you&rsquo;re interested in</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {coachRoles.map((r) => (
            <label
              key={r}
              className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                roles.includes(r) ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white text-navy-950 hover:border-navy-950/40"
              }`}
            >
              <input type="checkbox" className="sr-only" checked={roles.includes(r)} onChange={() => toggle(r)} />
              {r}
            </label>
          ))}
        </div>
        {errors.roles && <p className="error-text">{errors.roles}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {text("specialism", "Specialism", { optional: true, placeholder: "e.g. batting incl. sweeps and ramps, seam, spin" })}
        {text("qualifications", "Coaching qualifications", { placeholder: "e.g. ECB Level 2" })}
        {text("playingBackground", "Playing background", { optional: true, area: true, placeholder: "e.g. club 1st XI, county age-group, league cricket" })}
        {text("coachingExperience", "Your coaching experience", { area: true, placeholder: "Who you've coached, where and at what level — e.g. club juniors U9–U15, school cricket, county age-group" })}
        {text("coachingPhilosophy", "Your coaching philosophy", { area: true, placeholder: "In a few sentences, how do you like to coach — and why?" })}
        {text("strengths", "Your strengths as a coach", { area: true, placeholder: "What do you do especially well?" })}
        {text("weaknesses", "Your weaknesses, or areas you're working on", { area: true, placeholder: "What are you working to improve as a coach?" })}
        {text("dbsStatus", "DBS status", { placeholder: "e.g. enhanced cricket DBS, issued 2025" })}
        {text("safeguardingStatus", "Safeguarding training", { placeholder: "e.g. ECB Safeguarding Young People, 2025" })}
        <label className="flex cursor-pointer items-center gap-3 self-end pb-3 text-[0.95rem] text-navy-950">
          <input type="checkbox" checked={firstAid} onChange={(e) => setFirstAid(e.target.checked)} className="h-5 w-5 accent-[#0b2345]" />
          I hold a current first aid certificate
        </label>
        {text("message", "Anything else you'd like to tell us?", { optional: true, area: true })}
      </div>

      <AvailabilityPicker
        saturday={saturday}
        setSaturday={setSaturday}
        sunday={sunday}
        setSunday={setSunday}
        weekdayBlocks={weekdayBlocks}
        setWeekdayBlocks={setWeekdayBlocks}
        terms={terms}
        setTerms={setTerms}
        camps={camps}
        setCamps={setCamps}
        holidayWeekly={holidayWeekly}
        setHolidayWeekly={setHolidayWeekly}
        errors={errors}
      />

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>
          {state === "sending" ? "Sending…" : "Send expression of interest"}
        </button>
      </div>
      {state === "error" && <p className="error-text" role="alert">{message}</p>}
    </form>
  );
}

const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Tick({ label, checked, onChange, compact = false }: { label: string; checked: boolean; onChange: () => void; compact?: boolean }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center rounded-lg border text-center text-sm font-medium transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
        compact ? "px-2 py-2" : "px-4 py-2.5"
      } ${checked ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white text-navy-950 hover:border-navy-950/40"}`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function HourGrid({
  day,
  hours,
  value,
  onChange,
  split = false,
}: {
  day: string;
  hours: string[];
  value: string[];
  onChange: (v: string[]) => void;
  /** Offer morning / afternoon shortcuts */
  split?: boolean;
}) {
  // A slot is a morning slot if it starts before noon ("9–10am", "11am–12pm")
  const isMorning = (h: string) => h.endsWith("am") || h.split("–")[0].endsWith("am");
  const quick = [
    { label: "All", set: hours },
    ...(split
      ? [
          { label: "Mornings", set: hours.filter(isMorning) },
          { label: "Afternoons", set: hours.filter((h) => !isMorning(h)) },
        ]
      : []),
    { label: "Clear", set: [] as string[] },
  ];
  return (
    <fieldset>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <legend className="label !mb-0">{day}</legend>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          {quick.map((q) => (
            <button key={q.label} type="button" onClick={() => onChange([...q.set])} className="text-gold-deep underline underline-offset-2 hover:text-navy-950">
              {q.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {hours.map((h) => (
          <Tick key={h} label={h} compact checked={value.includes(h)} onChange={() => onChange(toggleIn(value, h))} />
        ))}
      </div>
    </fieldset>
  );
}

function AvailabilityPicker(props: {
  saturday: string[];
  setSaturday: (v: string[]) => void;
  sunday: string[];
  setSunday: (v: string[]) => void;
  weekdayBlocks: string[];
  setWeekdayBlocks: (v: string[]) => void;
  terms: string[];
  setTerms: (v: string[]) => void;
  camps: Record<string, string[]>;
  setCamps: (v: Record<string, string[]>) => void;
  holidayWeekly: string;
  setHolidayWeekly: (v: string) => void;
  errors: Record<string, string>;
}) {
  const termErr = props.errors["availability.termTime"];
  const termsErr = props.errors["availability.terms"];
  const periods = [...new Set(campWeeks.map((w) => w.period))];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-cream p-5 md:p-6">
        <h3 className="font-serif text-2xl text-navy-950">Session dates 2026/27</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Weekly sessions run in term time at John Lyon. We&rsquo;re closed over Christmas, 21 December – 3 January. Tick every term you
          could coach.
        </p>
        <fieldset className="mt-5">
          <legend className="sr-only">Terms you could coach</legend>
          <div className="grid gap-3">
            {sessionTerms.map((t) => {
              const on = props.terms.includes(t.label);
              return (
                <label
                  key={t.id}
                  className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                    on ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white text-navy-950 hover:border-navy-950/40"
                  }`}
                >
                  <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#c9a227]" checked={on} onChange={() => props.setTerms(toggleIn(props.terms, t.label))} />
                  <span>
                    <span className="block font-semibold">
                      {t.label} · {t.weeks} weeks
                    </span>
                    <span className="block text-sm">{t.dates}</span>
                    <span className={`mt-1 block text-sm ${on ? "text-slate" : "text-ink-muted"}`}>{t.note}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {termsErr && <p className="error-text">{termsErr}</p>}
      </section>

      <section className="rounded-2xl bg-cream p-5 md:p-6">
        <h3 className="font-serif text-2xl text-navy-950">Weekly availability</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Indoors at John Lyon, with a bowling machine available in autumn and spring. Tick every hour you could coach at weekends, and
          whether you could take the 3-hour evening block on Wednesdays or Thursdays.
        </p>
        <div className="mt-5 space-y-5">
          <HourGrid day="Saturdays (2:30–5:30pm)" hours={opts.saturdayHours} value={props.saturday} onChange={props.setSaturday} />
          <HourGrid day="Sundays (9am–5pm)" hours={opts.sundayHours} value={props.sunday} onChange={props.setSunday} split />
          <fieldset>
            <legend className="label">Midweek evenings</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {opts.weekdayBlocks.map((b) => (
                <Tick key={b} label={b} checked={props.weekdayBlocks.includes(b)} onChange={() => props.setWeekdayBlocks(toggleIn(props.weekdayBlocks, b))} />
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="co-availabilityNotes" className="label">Anything else about your weekly availability? <span className="font-normal text-ink-muted">(optional)</span></label>
            <input id="co-availabilityNotes" name="availabilityNotes" className="field" placeholder="e.g. not available alternate Sundays" />
          </div>
          <div>
            <label htmlFor="co-summerNotes" className="label">
              Anything about the summer term we should know? <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input id="co-summerNotes" name="summerNotes" className="field" placeholder="e.g. I play club cricket on Saturdays" />
            <p className="hint">Summer times may change once outdoor nets are confirmed.</p>
          </div>
        </div>
        {termErr && <p className="error-text">{termErr}</p>}
      </section>

      <section className="rounded-2xl bg-navy-950 p-5 text-cream md:p-6">
        <h3 className="font-serif text-2xl">Holiday camps: potential dates</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate">
          We&rsquo;re planning holiday camps, Monday to Friday. Dates and formats are still to be confirmed. Tick any weeks you might be able to
          coach, and whether full or part days suit you.
        </p>
        <div className="mt-5 space-y-5">
          {periods.map((period) => (
            <fieldset key={period}>
              <legend className="label !text-cream">{period}</legend>
              <div className="mt-1 divide-y divide-cream/10 rounded-xl border border-cream/10">
                {campWeeks
                  .filter((w) => w.period === period)
                  .map((w) => (
                    <div key={w.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm">{w.dates}</span>
                      <div className="grid grid-cols-2 gap-2 sm:w-64">
                        {campDayOptions.map((o) => {
                          const on = props.camps[w.id]?.includes(o) ?? false;
                          return (
                            <label
                              key={o}
                              className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                                on ? "border-gold bg-gold text-navy-950" : "border-cream/20 text-cream hover:border-cream/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                aria-label={`${w.dates}: ${o}`}
                                checked={on}
                                onChange={() => props.setCamps({ ...props.camps, [w.id]: toggleIn(props.camps[w.id] ?? [], o) })}
                              />
                              {o}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </fieldset>
          ))}
          <fieldset>
            <legend className="label !text-cream">Could you also coach weekly sessions in the school holidays?</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {opts.holidayWeekly.map((o) => {
                const on = props.holidayWeekly === o.value;
                return (
                  <label
                    key={o.value}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                      on ? "border-gold bg-gold text-navy-950" : "border-cream/20 text-cream hover:border-cream/50"
                    }`}
                  >
                    <input type="radio" name="holidayWeeklyChoice" className="sr-only" checked={on} onChange={() => props.setHolidayWeekly(o.value)} />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="co-campNotes" className="label !text-cream">
              Anything else about the holidays? <span className="font-normal text-slate">(optional)</span>
            </label>
            <input id="co-campNotes" name="campNotes" className="field" placeholder="e.g. away the first two weeks of August" />
          </div>
        </div>
      </section>
    </div>
  );
}
