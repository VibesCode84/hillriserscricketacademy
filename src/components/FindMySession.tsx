"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionAvailability } from "@/lib/booking";
import type { Experience, Gender, Interest } from "@/lib/booking/types";
import { recommend, type RecommendResult } from "@/lib/recommend";
import { durationMinutes, formatTimeRange } from "@/data/sessions";
import { formatPrice } from "@/data/site";
import { AvailabilityBadge } from "./SessionCard";
import { buttonClass } from "./Button";
import { EnquiryForm } from "./EnquiryForm";

const experienceOptions: { value: Experience; label: string }[] = [
  { value: "new", label: "New to cricket" },
  { value: "some", label: "Some experience" },
  { value: "regular", label: "Regular club/school player" },
  { value: "performance", label: "Performance player" },
];

const interestOptions: { value: Interest; label: string }[] = [
  { value: "batting", label: "Batting" },
  { value: "seam", label: "Seam bowling" },
  { value: "spin", label: "Spin" },
  { value: "all-round", label: "All-round cricket" },
  { value: "not-sure", label: "Not sure" },
];

const genderOptions: { value: Gender; label: string }[] = [
  { value: "boy", label: "Boy" },
  { value: "girl", label: "Girl" },
  { value: "unspecified", label: "Prefer not to say" },
];

function Choice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
              value === o.value ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 bg-white text-navy-950 hover:border-navy-950/40"
            }`}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FindMySession({ availability }: { availability: Record<string, SessionAvailability> | null }) {
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<Gender | undefined>();
  const [experience, setExperience] = useState<Experience | undefined>();
  const [interest, setInterest] = useState<Interest | undefined>();
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [speak, setSpeak] = useState(false);

  const complete = age !== undefined && gender && experience && interest;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    setResult(recommend({ age, gender, experience, interest }));
    setTimeout(() => document.getElementById("fms-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const query = complete
    ? `&age=${age}&gender=${gender}&experience=${experience}&interest=${interest}`
    : "";

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-9">
      <form onSubmit={submit} className="space-y-7">
        <div>
          <label htmlFor="fms-age" className="label">Child&rsquo;s age</label>
          <select
            id="fms-age"
            className="field max-w-xs"
            value={age ?? ""}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Select age</option>
            {Array.from({ length: 11 }, (_, i) => i + 4).map((n) => (
              <option key={n} value={n}>{n} years old</option>
            ))}
          </select>
        </div>
        <Choice name="fms-gender" legend="Your child is a…" options={genderOptions} value={gender} onChange={setGender} />
        <Choice name="fms-exp" legend="Cricket experience" options={experienceOptions} value={experience} onChange={setExperience} />
        <Choice name="fms-int" legend="Main interest" options={interestOptions} value={interest} onChange={setInterest} />
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
          <button type="submit" disabled={!complete} className={buttonClass("dark")}>
            Show recommended sessions
          </button>
          <button type="button" onClick={() => setSpeak((s) => !s)} className="text-sm font-semibold text-navy-950 underline underline-offset-4 hover:text-gold-deep">
            I&rsquo;d rather speak to someone
          </button>
        </div>
      </form>

      {speak && (
        <div className="mt-8 border-t border-navy-950/10 pt-8">
          <h3 className="text-2xl text-navy-950">Talk to a coach</h3>
          <p className="mt-2 text-ink-muted">Leave your details and a coach will call or email you — usually within one working day.</p>
          <div className="mt-6">
            <EnquiryForm source="find-my-session" defaultAge={age} />
          </div>
        </div>
      )}

      {result && (
        <div id="fms-results" className="mt-10 scroll-mt-28 rounded-2xl bg-navy-950 p-6 text-cream md:p-8" aria-live="polite">
          <p className="eyebrow">Recommended pathway · {result.pathway}</p>
          <p className="mt-4 text-lg leading-relaxed text-slate">{result.summary}</p>
          {result.recommendations.length === 0 ? (
            <p className="mt-6 text-cream">
              We&rsquo;d love to find the right fit personally.{" "}
              <button type="button" onClick={() => setSpeak(true)} className="text-gold-soft underline underline-offset-4">Speak to a coach</button>.
            </p>
          ) : (
            <ul className="mt-7 space-y-4">
              {result.recommendations.map((r) => {
                const s = r.session;
                const a = availability?.[s.id];
                const full = s.confirmed && a?.status === "full";
                const label = !s.confirmed ? "Register interest" : full ? "Join Waiting List" : "Book a Trial";
                return (
                  <li key={s.id} className="rounded-xl border border-cream/10 bg-navy-900 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gold">
                        {r.primary ? "Best starting point · " : ""}
                        {s.day} {formatTimeRange(s)}
                        {!s.confirmed && <span className="font-normal text-slate"> (provisional)</span>}
                      </p>
                      <AvailabilityBadge session={s} availability={a} />
                    </div>
                    <h4 className="mt-2 font-serif text-2xl">{s.title} <span className="text-base text-slate">· {s.group}</span></h4>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/80">{r.reason}</p>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-sm text-slate">{durationMinutes(s)} minutes · {formatPrice(s.pricePence)}</span>
                      <Link href={`/book?session=${s.id}${query}`} className={buttonClass(label === "Book a Trial" ? "primary" : "secondary", "!px-5 !py-2.5 text-sm")}>
                        {label}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-6 text-sm text-slate">
            Still unsure?{" "}
            <button type="button" onClick={() => setSpeak(true)} className="text-gold-soft underline underline-offset-4 hover:text-gold">
              I&rsquo;d rather speak to someone
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
