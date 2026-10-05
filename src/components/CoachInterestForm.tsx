"use client";

import { useState } from "react";
import { coachRoles } from "@/lib/interest-options";
import { buttonClass } from "./Button";

export function CoachInterestForm() {
  const [roles, setRoles] = useState<string[]>([]);
  const [firstAid, setFirstAid] = useState(false);
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
        body: JSON.stringify({ ...fd, roles, firstAid, company: fd.company || undefined }),
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
        {text("availability", "Availability (days and times)", { area: true, placeholder: "e.g. weekday evenings after 6pm, Sunday mornings" })}
        {text("summerAvailability", "Summer availability", { optional: true })}
        {text("dbsStatus", "DBS status", { placeholder: "e.g. enhanced cricket DBS, issued 2025" })}
        {text("safeguardingStatus", "Safeguarding training", { placeholder: "e.g. ECB Safeguarding Young People, 2025" })}
        <label className="flex cursor-pointer items-center gap-3 self-end pb-3 text-[0.95rem] text-navy-950">
          <input type="checkbox" checked={firstAid} onChange={(e) => setFirstAid(e.target.checked)} className="h-5 w-5 accent-[#0b2345]" />
          I hold a current first aid certificate
        </label>
        {text("message", "Anything else you'd like to tell us?", { optional: true, area: true })}
      </div>

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
