"use client";

import { useState } from "react";
import { buttonClass } from "./Button";

export function EnquiryForm({
  source,
  defaultAge,
  defaultMessage = "",
  tone = "light",
}: {
  source: string;
  defaultAge?: number;
  defaultMessage?: string;
  tone?: "light" | "dark";
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, childAge: body.childAge || undefined, mobile: body.mobile || undefined, source }),
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
      <div role="status" className={`rounded-2xl p-6 ${tone === "dark" ? "bg-navy-900 text-cream" : "bg-cream text-navy-950"}`}>
        <p className="font-serif text-2xl">Thank you — we&rsquo;ll be in touch soon.</p>
        <p className={`mt-2 ${tone === "dark" ? "text-slate" : "text-ink-muted"}`}>
          A coach will get back to you, usually within one working day, with a recommendation for your child.
        </p>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p className="error-text">{errors[k]}</p>;
  const labelCls = tone === "dark" ? "label !text-cream" : "label";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className={labelCls} htmlFor={`${source}-name`}>Your name</label>
        <input id={`${source}-name`} name="parentName" className="field" autoComplete="name" required aria-invalid={!!errors.parentName} />
        {err("parentName")}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${source}-email`}>Email</label>
        <input id={`${source}-email`} name="email" type="email" className="field" autoComplete="email" required aria-invalid={!!errors.email} />
        {err("email")}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${source}-mobile`}>Mobile <span className="font-normal opacity-60">(optional)</span></label>
        <input id={`${source}-mobile`} name="mobile" type="tel" className="field" autoComplete="tel" />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${source}-age`}>Child&rsquo;s age <span className="font-normal opacity-60">(optional)</span></label>
        <input id={`${source}-age`} name="childAge" type="number" min={3} max={18} defaultValue={defaultAge} className="field" />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor={`${source}-msg`}>Tell us a little about your child</label>
        <textarea
          id={`${source}-msg`}
          name="message"
          rows={4}
          className="field"
          defaultValue={defaultMessage}
          placeholder="e.g. Loves batting, plays a little at school, a bit shy in new groups…"
          aria-invalid={!!errors.message}
        />
        {err("message")}
      </div>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "sending"} className={buttonClass(tone === "dark" ? "primary" : "dark")}>
          {state === "sending" ? "Sending…" : "Ask a coach"}
        </button>
        {state === "error" && <p className="error-text !mt-0" role="alert">{message}</p>}
      </div>
    </form>
  );
}
