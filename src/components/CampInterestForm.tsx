"use client";

import { useState } from "react";
import { camps, FUTURE_CAMPS } from "@/data/camps";
import { buttonClass } from "./Button";

const interests = [
  { value: "batting", label: "Batting" },
  { value: "seam", label: "Seam bowling" },
  { value: "spin", label: "Spin" },
  { value: "all-round", label: "All-round cricket" },
  { value: "not-sure", label: "Not sure yet" },
];

export function CampInterestForm() {
  const [selected, setSelected] = useState<string[]>([camps[0]?.id ?? FUTURE_CAMPS]);
  const [interest, setInterest] = useState("not-sure");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState("sending");
    setErrors({});
    try {
      const res = await fetch("/api/camps/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camps: selected,
          parentName: fd.parentName,
          email: fd.email,
          mobile: fd.mobile || undefined,
          childName: fd.childName,
          childAge: fd.childAge,
          interest,
          notes: fd.notes || undefined,
          contactConsent: fd.contactConsent === "on",
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
        <p className="eyebrow">Interest registered</p>
        <p className="mt-4 font-serif text-3xl">Thank you — you&rsquo;re on the list.</p>
        <p className="mt-3 text-slate">
          We&rsquo;ll email you as soon as camp details are confirmed, before booking opens to everyone. There&rsquo;s nothing to pay.
        </p>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p className="error-text" role="alert">{errors[k]}</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <fieldset>
        <legend className="label">Which camps are you interested in?</legend>
        <div className="mt-1 space-y-2">
          {[...camps.map((c) => ({ id: c.id, title: c.name, detail: "Details TBC" })), { id: FUTURE_CAMPS, title: "Future holiday camps", detail: "Easter, summer and beyond" }].map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                selected.includes(o.id) ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white hover:border-navy-950/40"
              }`}
            >
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#d5a93f]" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
              <span>
                <span className="block font-semibold">{o.title}</span>
                <span className={`block text-sm ${selected.includes(o.id) ? "text-slate" : "text-ink-muted"}`}>{o.detail}</span>
              </span>
            </label>
          ))}
        </div>
        {err("camps")}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ci-child">Child&rsquo;s name</label>
          <input id="ci-child" name="childName" className="field" aria-invalid={!!errors.childName} />
          {err("childName")}
        </div>
        <div>
          <label className="label" htmlFor="ci-age">Child&rsquo;s age</label>
          <input id="ci-age" name="childAge" type="number" min={4} max={14} inputMode="numeric" className="field" aria-invalid={!!errors.childAge} />
          {err("childAge")}
        </div>
      </div>

      <fieldset>
        <legend className="label">What would they most like to work on?</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {interests.map((o) => (
            <label
              key={o.value}
              className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                interest === o.value ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white hover:border-navy-950/40"
              }`}
            >
              <input type="radio" name="interestChoice" className="sr-only" checked={interest === o.value} onChange={() => setInterest(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ci-parent">Your name</label>
          <input id="ci-parent" name="parentName" autoComplete="name" className="field" aria-invalid={!!errors.parentName} />
          {err("parentName")}
        </div>
        <div>
          <label className="label" htmlFor="ci-email">Email</label>
          <input id="ci-email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} />
          {err("email")}
        </div>
        <div>
          <label className="label" htmlFor="ci-mobile">Mobile <span className="font-normal text-ink-muted">(optional)</span></label>
          <input id="ci-mobile" name="mobile" type="tel" autoComplete="tel" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="ci-notes">Anything else? <span className="font-normal text-ink-muted">(optional)</span></label>
          <input id="ci-notes" name="notes" className="field" placeholder="e.g. siblings, days that suit you" />
        </div>
      </div>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-relaxed">
          <input type="checkbox" name="contactConsent" className="mt-1 h-5 w-5 shrink-0 accent-[#0b2345]" />
          <span>Please email me about Hillrisers holiday camps. I can unsubscribe at any time.</span>
        </label>
        {errors.contactConsent && <p className="error-text ml-8">{errors.contactConsent}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>
          {state === "sending" ? "Sending…" : "Register interest"}
        </button>
        <p className="text-sm text-ink-muted">No payment, no commitment.</p>
      </div>
      {state === "error" && <p className="error-text" role="alert">{message}</p>}
    </form>
  );
}
