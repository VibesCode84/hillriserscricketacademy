"use client";

import { useState } from "react";
import { buttonClass } from "../Button";

/** "Want to talk first?": an enquiry short of a booking request */
export function PartnerEnquiryForm({ defaults }: { defaults?: { name?: string; orgName?: string; email?: string } }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setState("sending");
    setErrors({});
    const res = await fetch("/api/partners/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fd, phone: fd.phone || undefined, orgName: fd.orgName || undefined, company: fd.company || undefined }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setErrors(json.errors ?? {});
      setMessage(json.message ?? "Something went wrong. Please try again.");
      setState("error");
      return;
    }
    form.reset();
    setState("sent");
  };

  if (state === "sent") return <p className="text-[#1d6b3a]" role="status">Thanks — we&rsquo;ll be in touch soon.</p>;

  const field = (name: string, label: string, opts: { type?: string; optional?: boolean; autoComplete?: string; defaultValue?: string } = {}) => (
    <div>
      <label htmlFor={`pe-${name}`} className="label">
        {label} {opts.optional && <span className="font-normal text-ink-muted">(optional)</span>}
      </label>
      <input id={`pe-${name}`} name={name} type={opts.type ?? "text"} autoComplete={opts.autoComplete} defaultValue={opts.defaultValue} className="field" aria-invalid={!!errors[name]} />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Your name", { autoComplete: "name", defaultValue: defaults?.name })}
        {field("orgName", "Organisation", { optional: true, autoComplete: "organization", defaultValue: defaults?.orgName !== defaults?.name ? defaults?.orgName : undefined })}
        {field("email", "Email", { type: "email", autoComplete: "email", defaultValue: defaults?.email })}
        {field("phone", "Phone", { type: "tel", optional: true, autoComplete: "tel" })}
      </div>
      <div>
        <label htmlFor="pe-message" className="label">What would you like to talk about?</label>
        <textarea id="pe-message" name="message" rows={4} className="field" placeholder="e.g. the days and times you're after, group sizes, questions" aria-invalid={!!errors.message} />
        {errors.message && <p className="error-text">{errors.message}</p>}
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>{state === "sending" ? "Sending…" : "Send message"}</button>
      {state === "error" && <p className="error-text" role="alert">{message}</p>}
    </form>
  );
}
