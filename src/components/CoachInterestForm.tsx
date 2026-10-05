"use client";

import { useState } from "react";
import { coachAvailabilityOptions as opts, coachRoles } from "@/lib/interest-options";
import { buttonClass } from "./Button";

export function CoachInterestForm() {
  const [roles, setRoles] = useState<string[]>([]);
  const [firstAid, setFirstAid] = useState(false);
  const [saturday, setSaturday] = useState<string[]>([]);
  const [sunday, setSunday] = useState<string[]>([]);
  const [weekdayBlocks, setWeekdayBlocks] = useState<string[]>([]);
  const [summer, setSummer] = useState<string[]>([]);
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
          availability: { saturday, sunday, weekdayBlocks, summer, notes: fd.availabilityNotes, summerNotes: fd.summerNotes },
          availabilityNotes: undefined,
          summerNotes: undefined,
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
        summer={summer}
        setSummer={setSummer}
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

function HourGrid({ day, value, onChange }: { day: string; value: string[]; onChange: (v: string[]) => void }) {
  const hours = opts.weekendHours;
  const quick = [
    { label: "All day", set: hours },
    { label: "Mornings", set: hours.filter((h) => h.endsWith("am") || h === "11am–12pm") },
    { label: "Afternoons", set: hours.filter((h) => h.endsWith("pm") && h !== "11am–12pm") },
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
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
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
  summer: string[];
  setSummer: (v: string[]) => void;
  errors: Record<string, string>;
}) {
  const termErr = props.errors["availability.termTime"];
  const summerErr = props.errors["availability.summer"];
  const notInSummer = "Not available in summer";
  const toggleSummer = (v: string) =>
    props.setSummer(
      v === notInSummer
        ? props.summer.includes(v) ? [] : [v]
        : toggleIn(props.summer.filter((x) => x !== notInSummer), v),
    );
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-cream p-5 md:p-6">
        <h3 className="font-serif text-2xl text-navy-950">Autumn and spring availability</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Indoors at John Lyon. Tick every hour you could coach at weekends, and whether you could take a 3-hour evening block midweek.
        </p>
        <div className="mt-5 space-y-5">
          <HourGrid day="Saturdays" value={props.saturday} onChange={props.setSaturday} />
          <HourGrid day="Sundays" value={props.sunday} onChange={props.setSunday} />
          <fieldset>
            <legend className="label">Midweek evenings</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {opts.weekdayBlocks.map((b) => (
                <Tick key={b} label={b} checked={props.weekdayBlocks.includes(b)} onChange={() => props.setWeekdayBlocks(toggleIn(props.weekdayBlocks, b))} />
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="co-availabilityNotes" className="label">Anything else about your autumn/spring availability? <span className="font-normal text-ink-muted">(optional)</span></label>
            <input id="co-availabilityNotes" name="availabilityNotes" className="field" placeholder="e.g. not available alternate Sundays" />
          </div>
        </div>
        {termErr && <p className="error-text">{termErr}</p>}
      </section>

      <section className="rounded-2xl bg-navy-950 p-5 text-cream md:p-6">
        <h3 className="font-serif text-2xl">Summer availability</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate">
          In summer, coaching moves outdoors and fits around the cricket season — so sessions are likely to be on weekday evenings and
          weekend mornings, leaving afternoons free for matches. Tick what could work for you; we&rsquo;ll confirm the summer timetable nearer
          the time.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {opts.summer.map((s) => (
            <label
              key={s}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                props.summer.includes(s) ? "border-gold bg-gold text-navy-950" : "border-cream/20 text-cream hover:border-gold/60"
              }`}
            >
              <input type="checkbox" className="sr-only" checked={props.summer.includes(s)} onChange={() => toggleSummer(s)} />
              {s}
            </label>
          ))}
        </div>
        <label htmlFor="co-summerNotes" className="label mt-5 !text-cream">Summer notes <span className="font-normal text-slate">(optional)</span></label>
        <input id="co-summerNotes" name="summerNotes" className="field" placeholder="e.g. I play Saturdays, so Sundays and weekday evenings suit best" />
        {summerErr && <p className="error-text !text-[#f4c7c3]">{summerErr}</p>}
      </section>
    </div>
  );
}
