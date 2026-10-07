"use client";

import Link from "next/link";
import { useState } from "react";
import { interestOptions } from "@/lib/interest-options";
import { holidayOptions, holidayPeriods, shutdown } from "@/data/calendar";
import { buttonClass } from "./Button";

type Child = {
  firstName: string;
  dateOfBirth: string;
  school: string;
  club: string;
  girlsOnly: string;
  level: string;
  mainRole: string;
  wants: string[];
  formats: string[];
  sessionLengths: string[];
  availability: string[];
  availabilityNotes: string;
  frequency: string;
  holidays: Record<string, string[]>;
  holidayNotes: string;
  otherInterests: string[];
  paymentPreference: string;
};

const newChild = (): Child => ({
  firstName: "",
  dateOfBirth: "",
  school: "",
  club: "",
  girlsOnly: "",
  level: "",
  mainRole: "",
  wants: [],
  formats: [],
  sessionLengths: [],
  availability: [],
  availabilityNotes: "",
  frequency: "",
  holidays: {},
  holidayNotes: "",
  otherInterests: [],
  paymentPreference: "",
});

const chip = (on: boolean) =>
  `cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
    on ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white text-navy-950 hover:border-navy-950/40"
  }`;

function Legend({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <legend className="label">
      {children}
      {hint && <span className="ml-1 font-normal text-ink-muted">{hint}</span>}
    </legend>
  );
}

function SingleChoice({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  stacked = false,
}: {
  name: string;
  legend: string;
  hint?: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  stacked?: boolean;
}) {
  return (
    <fieldset aria-invalid={!!error}>
      <Legend hint={hint}>{legend}</Legend>
      <div className={`mt-1 ${stacked ? "grid gap-2" : "flex flex-wrap gap-2"}`}>
        {options.map((o) => (
          <label key={o.value} className={`${chip(value === o.value)} ${stacked ? "!rounded-xl" : ""}`}>
            <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
    </fieldset>
  );
}

function MultiChoice({
  legend,
  hint = "(choose any)",
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <fieldset>
      <Legend hint={hint}>{legend}</Legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className={chip(value.includes(o))}>
            <input type="checkbox" className="sr-only" checked={value.includes(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function InterestForm() {
  const [parent, setParent] = useState({ parentName: "", email: "", mobile: "", postcode: "", heardAbout: "" });
  const [children, setChildren] = useState<Child[]>([newChild()]);
  const [contactConsent, setContactConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const setChild = (i: number, patch: Partial<Child>) => setChildren((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const removeChild = (i: number) => setChildren((cs) => cs.filter((_, j) => j !== i));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    setErrors({});
    const company = (new FormData(e.currentTarget).get("company") as string) || undefined;
    try {
      const res = await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parent,
          heardAbout: parent.heardAbout || undefined,
          children: children.map((c) => ({ ...c, school: c.school || undefined, club: c.club || undefined, availabilityNotes: c.availabilityNotes || undefined, holidayNotes: c.holidayNotes || undefined })),
          contactConsent,
          marketingConsent,
          company,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrors(json.errors ?? {});
        setMessage(json.message ?? "Something went wrong. Please try again.");
        setState("error");
        setTimeout(() => document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        return;
      }
      setState("sent");
      setTimeout(() => document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setMessage("We couldn't send that. Please check your connection and try again.");
      setState("error");
    }
  };

  if (state === "sent") {
    const names = children.map((c) => c.firstName).filter(Boolean);
    return (
      <div id="interest-form" role="status" className="scroll-mt-28 rounded-3xl bg-navy-950 p-8 text-cream md:p-10">
        <p className="eyebrow">Interest registered</p>
        <h2 className="mt-4 text-4xl">Thank you{names.length ? ` — ${names.join(" and ")} ${names.length > 1 ? "are" : "is"} on our list` : ""}.</h2>
        <p className="mt-4 max-w-xl text-lg text-slate">
          We&rsquo;ve emailed {parent.email} to confirm. We&rsquo;ll use your answers to build the timetable, and you&rsquo;ll get priority
          booking before places open to everyone.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/how-booking-works" className={buttonClass("primary")}>What happens next</Link>
          <Link href="/refer" className={buttonClass("secondary")}>Invite a friend</Link>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const field = (id: string, label: string, key: keyof typeof parent, opts: { type?: string; autoComplete?: string; hint?: string } = {}) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type={opts.type ?? "text"}
        autoComplete={opts.autoComplete}
        className="field"
        value={parent[key]}
        onChange={(e) => setParent({ ...parent, [key]: e.target.value })}
        aria-invalid={!!err(key)}
      />
      {opts.hint && !err(key) && <p className="hint">{opts.hint}</p>}
      {err(key) && <p className="error-text">{err(key)}</p>}
    </div>
  );

  return (
    <form id="interest-form" onSubmit={onSubmit} noValidate className="scroll-mt-28 space-y-8">
      {/* Parent */}
      <section className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
        <h2 className="text-3xl text-navy-950">About you</h2>
        <p className="mt-1 text-sm text-ink-muted">To be completed by a parent or guardian.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {field("ri-name", "Your name", "parentName", { autoComplete: "name" })}
          {field("ri-email", "Email", "email", { type: "email", autoComplete: "email" })}
          {field("ri-mobile", "Mobile", "mobile", { type: "tel", autoComplete: "tel" })}
          {field("ri-postcode", "Postcode", "postcode", { autoComplete: "postal-code", hint: "Helps us understand where families travel from" })}
          <div className="sm:col-span-2">
            <label htmlFor="ri-heard" className="label">How did you hear about us? <span className="font-normal text-ink-muted">(optional)</span></label>
            <select id="ri-heard" className="field sm:max-w-xs" value={parent.heardAbout} onChange={(e) => setParent({ ...parent, heardAbout: e.target.value })}>
              <option value="">Choose…</option>
              {interestOptions.heardAbout.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Children */}
      {children.map((c, i) => {
        const e = (k: string) => err(`children.${i}.${k}`);
        const label = c.firstName.trim() || (children.length > 1 ? `Child ${i + 1}` : "your child");
        return (
          <section key={i} className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9" aria-label={`Child ${i + 1}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Child {i + 1}</p>
                <h2 className="mt-2 text-3xl text-navy-950">About {label}</h2>
              </div>
              {children.length > 1 && (
                <button type="button" onClick={() => removeChild(i)} className="text-sm font-semibold text-[#8c1d18] underline underline-offset-4">
                  Remove
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`ri-c${i}-name`} className="label">First name</label>
                <input id={`ri-c${i}-name`} className="field" value={c.firstName} onChange={(ev) => setChild(i, { firstName: ev.target.value })} aria-invalid={!!e("firstName")} />
                {e("firstName") && <p className="error-text">{e("firstName")}</p>}
              </div>
              <div>
                <label htmlFor={`ri-c${i}-dob`} className="label">Date of birth</label>
                <input id={`ri-c${i}-dob`} type="date" className="field" value={c.dateOfBirth} onChange={(ev) => setChild(i, { dateOfBirth: ev.target.value })} aria-invalid={!!e("dateOfBirth")} />
                {e("dateOfBirth") && <p className="error-text">{e("dateOfBirth")}</p>}
              </div>
              <div>
                <label htmlFor={`ri-c${i}-school`} className="label">School <span className="font-normal text-ink-muted">(optional)</span></label>
                <input id={`ri-c${i}-school`} className="field" value={c.school} onChange={(ev) => setChild(i, { school: ev.target.value })} />
              </div>
              <div>
                <label htmlFor={`ri-c${i}-club`} className="label">Club, if any <span className="font-normal text-ink-muted">(optional)</span></label>
                <input id={`ri-c${i}-club`} className="field" value={c.club} onChange={(ev) => setChild(i, { club: ev.target.value })} />
              </div>
            </div>

            <div className="mt-8 space-y-7">
              <SingleChoice name={`c${i}-girls`} legend="Interested in girls-only sessions?" options={interestOptions.girlsOnly} value={c.girlsOnly} onChange={(v) => setChild(i, { girlsOnly: v })} error={e("girlsOnly")} />
              <SingleChoice name={`c${i}-level`} legend="Cricket level" options={interestOptions.level} value={c.level} onChange={(v) => setChild(i, { level: v })} error={e("level")} stacked />
              <SingleChoice name={`c${i}-role`} legend="Main role" options={interestOptions.mainRole} value={c.mainRole} onChange={(v) => setChild(i, { mainRole: v })} error={e("mainRole")} />
              <MultiChoice legend="What do they want from sessions?" options={interestOptions.wants} value={c.wants} onChange={(v) => setChild(i, { wants: v })} />

              <div className="grid gap-7 border-t border-navy-950/10 pt-7 sm:grid-cols-2">
                <MultiChoice legend="Preferred format" options={interestOptions.formats} value={c.formats} onChange={(v) => setChild(i, { formats: v })} />
                <MultiChoice legend="Preferred session length" options={interestOptions.sessionLengths} value={c.sessionLengths} onChange={(v) => setChild(i, { sessionLengths: v })} />
              </div>

              <div className="rounded-2xl bg-cream p-5">
                <MultiChoice legend="When could they attend?" options={interestOptions.availability} value={c.availability} onChange={(v) => setChild(i, { availability: v })} />
                <label htmlFor={`ri-c${i}-avail`} className="label mt-5">Anything specific? <span className="font-normal text-ink-muted">(optional)</span></label>
                <textarea
                  id={`ri-c${i}-avail`}
                  rows={2}
                  className="field"
                  placeholder="e.g. alternate Sundays only; can’t do Thursdays before Christmas"
                  value={c.availabilityNotes}
                  onChange={(ev) => setChild(i, { availabilityNotes: ev.target.value })}
                />
                <div className="mt-5">
                  <SingleChoice name={`c${i}-freq`} legend="How often?" options={interestOptions.frequency} value={c.frequency} onChange={(v) => setChild(i, { frequency: v })} error={e("frequency")} />
                </div>
              </div>

              <div className="rounded-2xl border border-navy-950/10 p-5">
                <p className="label">School holidays</p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Would they like weekly sessions to carry on in their normal slot, or a part-day or full-day camp? Tick any that suit, or
                  leave a holiday blank. We&rsquo;re closed over Christmas, {shutdown.dates}.{" "}
                  <Link href="/calendar" className="font-semibold text-navy-950 underline underline-offset-4">See the 2026/27 calendar</Link>.
                </p>
                <div className="mt-5 space-y-5">
                  {holidayPeriods.map((p) => (
                    <MultiChoice
                      key={p.id}
                      legend={p.label}
                      hint={`· ${p.dates}`}
                      options={holidayOptions}
                      value={c.holidays[p.id] ?? []}
                      onChange={(v) => setChild(i, { holidays: { ...c.holidays, [p.id]: v } })}
                    />
                  ))}
                </div>
                <label htmlFor={`ri-c${i}-hols`} className="label mt-5">Anything else about the holidays? <span className="font-normal text-ink-muted">(optional)</span></label>
                <textarea
                  id={`ri-c${i}-hols`}
                  rows={2}
                  className="field"
                  placeholder="e.g. away the first week of August; mornings only for camps"
                  value={c.holidayNotes}
                  onChange={(ev) => setChild(i, { holidayNotes: ev.target.value })}
                />
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <MultiChoice legend="Other interests" options={interestOptions.otherInterests} value={c.otherInterests} onChange={(v) => setChild(i, { otherInterests: v })} />
                <SingleChoice name={`c${i}-pay`} legend="Preferred payment" options={interestOptions.paymentPreference} value={c.paymentPreference} onChange={(v) => setChild(i, { paymentPreference: v })} error={e("paymentPreference")} />
              </div>
            </div>
          </section>
        );
      })}

      {children.length < 8 && (
        <button
          type="button"
          onClick={() => setChildren((cs) => [...cs, newChild()])}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-navy-950/20 bg-white/50 p-5 font-semibold text-navy-950 transition hover:border-navy-950/50"
        >
          <span aria-hidden="true" className="text-xl leading-none">+</span> Add another child
        </button>
      )}

      {/* Consent */}
      <section className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
        <div className="space-y-4">
          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-relaxed text-navy-950">
              <input type="checkbox" checked={contactConsent} onChange={(ev) => setContactConsent(ev.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0b2345]" aria-invalid={!!err("contactConsent")} />
              <span>HillRisers may contact me about sessions for my child(ren).</span>
            </label>
            {err("contactConsent") && <p className="error-text ml-8">{err("contactConsent")}</p>}
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-relaxed text-navy-950">
            <input type="checkbox" checked={marketingConsent} onChange={(ev) => setMarketingConsent(ev.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0b2345]" />
            <span>
              Send me HillRisers news and offers. <span className="text-ink-muted">(Optional)</span>
            </span>
          </label>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-ink-muted">
          We use these details only to plan sessions and contact you about HillRisers. We don&rsquo;t ask for medical information at this
          stage. See our <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.
        </p>

        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        {state === "error" && (
          <p className="mt-5 rounded-xl bg-[#fbeae8] p-4 text-sm text-[#8c1d18]" role="alert">
            {message}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>
            {state === "sending" ? "Sending…" : "Register interest"}
          </button>
          <p className="text-sm text-ink-muted">No payment, no commitment.</p>
        </div>
      </section>
    </form>
  );
}
