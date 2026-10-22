"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { partnerTypes } from "@/data/partners";
import { buttonClass } from "../Button";

export function RegisterPartner() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { confirmPassword, ...fd } = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (fd.password !== confirmPassword) {
      setErrors({ confirmPassword: "The passwords don't match" });
      setMessage("Please check the highlighted fields");
      setState("error");
      return;
    }
    setState("sending");
    setErrors({});
    const res = await fetch("/api/partners/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fd, website: fd.website || undefined, about: fd.about || undefined, company: fd.company || undefined, agreeTerms: agree }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setErrors(json.errors ?? {});
      setMessage(json.message ?? "Something went wrong. Please try again.");
      setState("error");
      return;
    }
    router.push("/partners/portal?welcome=1");
  };

  const field = (name: string, label: string, opts: { type?: string; optional?: boolean; autoComplete?: string; placeholder?: string } = {}) => (
    <div>
      <label htmlFor={`pr-${name}`} className="label">
        {label} {opts.optional && <span className="font-normal text-ink-muted">(optional)</span>}
      </label>
      <input id={`pr-${name}`} name={name} type={opts.type ?? "text"} autoComplete={opts.autoComplete} placeholder={opts.placeholder} className="field" aria-invalid={!!errors[name]} />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("orgName", "Organisation or trading name", { autoComplete: "organization" })}
        {field("contactName", "Contact name", { autoComplete: "name" })}
        {field("email", "Email", { type: "email", autoComplete: "email" })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
        {field("password", "Choose a password", { type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" })}
        {field("confirmPassword", "Confirm password", { type: "password", autoComplete: "new-password" })}
        <div>
          <label htmlFor="pr-type" className="label">You are a…</label>
          <select id="pr-type" name="type" className="field" defaultValue="" aria-invalid={!!errors.type}>
            <option value="" disabled>Choose one</option>
            {partnerTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.type && <p className="error-text">{errors.type}</p>}
        </div>
        {field("website", "Website", { optional: true, placeholder: "https://" })}
      </div>
      <div>
        <label htmlFor="pr-about" className="label">About your sessions <span className="font-normal text-ink-muted">(optional)</span></label>
        <textarea id="pr-about" name="about" rows={3} className="field" placeholder="Who you coach, ages, group sizes" />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0b2345]" />
          <span>
            I agree to the <Link href="/partners/terms" target="_blank" className="underline">partner terms</Link>, including that no filming or video recording is
            permitted.
          </span>
        </label>
        {errors.agreeTerms && <p className="error-text ml-8">{errors.agreeTerms}</p>}
      </div>
      <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>
        {state === "sending" ? "Creating your account…" : "Create partner account"}
      </button>
      {state === "error" && <p className="error-text" role="alert">{message}</p>}
    </form>
  );
}

export function SignIn() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/partners/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fd) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      router.push("/partners/portal");
      router.refresh();
      return;
    }
    setMessage(json.message ?? json.errors?.email ?? json.errors?.password ?? "Something went wrong.");
    setState("error");
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="si-email" className="label">Email</label>
        <input id="si-email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label htmlFor="si-password" className="label">Password</label>
        <input id="si-password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {state === "error" && <p className="error-text" role="alert">{message}</p>}
      <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>
        {state === "sending" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function ResendLink() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/partners/resend-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) setState("sent");
    else {
      setMessage(json.message ?? json.errors?.email ?? "Something went wrong.");
      setState("error");
    }
  };
  if (state === "sent") return <p className="text-sm">If that email is registered, we&rsquo;ve sent you a sign-in link.</p>;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="rl-email" className="sr-only">Email</label>
      <input id="rl-email" name="email" type="email" required placeholder="Your email" className="field sm:max-w-xs" />
      <button type="submit" disabled={state === "sending"} className={buttonClass("dark")}>Email me a sign-in link</button>
      {state === "error" && <p className="error-text" role="alert">{message}</p>}
    </form>
  );
}
