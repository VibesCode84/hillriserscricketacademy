"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { sessions, formatTimeRange, durationMinutes, type AcademySession } from "@/data/sessions";
import { formatPrice, site } from "@/data/site";
import type { DisciplineKey } from "@/data/academies";
import type { SessionAvailability } from "@/lib/booking";
import type { Experience, Gender, Interest } from "@/lib/booking/types";
import { ageFromDob, recommend } from "@/lib/recommend";
import { AvailabilityBadge } from "../SessionCard";
import { buttonClass } from "../Button";

type Step = 1 | 2 | 3 | 4;

export type BookingPrefill = {
  sessionId?: string;
  discipline?: DisciplineKey;
  age?: number;
  gender?: Gender;
  experience?: Experience;
  interest?: Interest;
  referredBy?: string;
};

const experienceOptions: { value: Experience; label: string; hint: string }[] = [
  { value: "new", label: "New to cricket", hint: "Hasn't played much, or at all" },
  { value: "some", label: "Some experience", hint: "Plays at school or in the garden" },
  { value: "regular", label: "Regular club/school player", hint: "Plays matches most weeks in season" },
  { value: "performance", label: "Performance player", hint: "Higher-level club, district or county squads" },
];

const interestOptions: { value: Interest; label: string }[] = [
  { value: "batting", label: "Batting" },
  { value: "seam", label: "Seam bowling" },
  { value: "spin", label: "Spin" },
  { value: "all-round", label: "All-round cricket" },
  { value: "not-sure", label: "Not sure yet" },
];

const disciplineToInterest: Partial<Record<DisciplineKey, Interest>> = {
  batting: "batting",
  power: "batting",
  "seam-bowling": "seam",
  "spin-bowling": "spin",
  performance: "all-round",
};

const steps = ["Your player", "Recommended session", "Your details", "Secure place"];

export function BookingFlow({
  availability,
  prefill,
}: {
  availability: Record<string, SessionAvailability> | null;
  prefill: BookingPrefill;
}) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { kind: "waitlist" | "interest"; session: AcademySession }>(null);

  // Player
  const [playerName, setPlayerName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">(prefill.gender ?? (prefill.discipline === "girls" ? "girl" : ""));
  const [experience, setExperience] = useState<Experience | "">(prefill.experience ?? "");
  const [interest, setInterest] = useState<Interest | "">(
    prefill.interest ?? (prefill.discipline ? disciplineToInterest[prefill.discipline] ?? "" : ""),
  );
  const [clubOrSchool, setClubOrSchool] = useState("");
  const [playingProfile, setPlayingProfile] = useState("");

  // Session
  const [sessionId, setSessionId] = useState<string | undefined>(prefill.sessionId);
  const [showAll, setShowAll] = useState(false);

  // Parent & welfare
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medical, setMedical] = useState("");
  const [heardAbout, setHeardAbout] = useState(prefill.referredBy ? `Referred by ${prefill.referredBy}` : "");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [safeguarding, setSafeguarding] = useState(false);
  const [terms, setTerms] = useState(false);

  const age = dob ? ageFromDob(dob) : prefill.age;
  const selected = sessions.find((s) => s.id === sessionId);
  const selectedAvailability = selected ? availability?.[selected.id] : undefined;
  const mode: "book" | "waitlist" | "interest" = !selected
    ? "book"
    : !selected.confirmed
      ? "interest"
      : selectedAvailability?.status === "full"
        ? "waitlist"
        : "book";

  const rec = useMemo(() => {
    if (age === undefined || !gender || !experience || !interest) return null;
    return recommend({ age, gender, experience, interest });
  }, [age, gender, experience, interest]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const go = (s: Step) => {
    setErrors({});
    setFormError("");
    setStep(s);
    setTimeout(scrollTop, 30);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (playerName.trim().length < 2) e.playerName = "Please enter your child's name";
    if (!dob) e.dateOfBirth = "Please enter a date of birth";
    else if (age === undefined || age < 3 || age > 18) e.dateOfBirth = "Please check the date of birth";
    if (!gender) e.gender = "Please choose an option";
    if (!experience) e.experience = "Please choose an option";
    if (!interest) e.interest = "Please choose an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toStep2 = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep1()) return;
    // Keep a preselected session if it suits; otherwise default to the top recommendation.
    if (!sessionId && rec?.recommendations[0]) setSessionId(rec.recommendations[0].session.id);
    go(2);
  };

  const toStep3 = () => {
    if (!selected) {
      setFormError("Please choose a session.");
      return;
    }
    go(3);
  };

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  };

  const submitDetails = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selected) return;
    setBusy(true);
    setErrors({});
    setFormError("");
    try {
      if (mode !== "book") {
        const { res, json } = await post("/api/waitlist/join", {
          sessionId: selected.id,
          parentName,
          playerName,
          dateOfBirth: dob,
          email,
          mobile,
        });
        if (!res.ok || !json.ok) {
          setErrors(json.errors ?? {});
          setFormError(json.message ?? "Something went wrong. Please try again.");
          return;
        }
        setDone({ kind: mode, session: selected });
        setTimeout(scrollTop, 30);
        return;
      }

      const profile = await post("/api/player/create", {
        parentName,
        email,
        mobile,
        playerName,
        dateOfBirth: dob,
        gender,
        experience,
        interest,
        clubOrSchool: clubOrSchool || undefined,
        playingProfile: playingProfile || undefined,
        heardAbout: heardAbout || undefined,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        medicalNotes: medical || undefined,
        photoConsent,
        safeguardingConsent: safeguarding,
        termsConsent: terms,
      });
      if (!profile.res.ok || !profile.json.ok) {
        setErrors(profile.json.errors ?? {});
        setFormError(profile.json.message ?? "Please check the highlighted fields.");
        return;
      }

      const booking = await post("/api/booking/create", {
        playerId: profile.json.playerId,
        parentId: profile.json.parentId,
        sessionId: selected.id,
        isTrial: true,
      });
      if (!booking.res.ok || !booking.json.ok) {
        if (booking.json.reason === "full") {
          setFormError(booking.json.message);
          go(2);
          router.refresh();
          return;
        }
        setFormError(booking.json.message ?? "We couldn't reserve that place. Please try again.");
        return;
      }
      router.push(`/book/checkout?booking=${booking.json.bookingId}`);
    } catch {
      setFormError("We couldn't connect. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) => errors[k] && <p className="error-text" role="alert">{errors[k]}</p>;
  const first = playerName.trim().split(" ")[0] || "your child";

  if (done) {
    return (
      <div ref={topRef} className="scroll-mt-28 rounded-3xl bg-white p-8 text-navy-950 md:p-12">
        <p className="eyebrow">{done.kind === "waitlist" ? "Waiting list" : "Interest registered"}</p>
        <h2 className="mt-4 text-4xl">Thank you — {first} is on our list.</h2>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">
          {done.kind === "waitlist"
            ? `We'll email ${email} as soon as a place opens in ${done.session.title}, ${done.session.day} ${formatTimeRange(done.session)}. There's nothing to pay until then.`
            : `We'll email ${email} as soon as the times for ${done.session.title} are confirmed, so you can book before anyone else.`}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/sessions" className={buttonClass("dark")}>See other sessions</Link>
          <Link href="/" className="rounded-full px-6 py-3.5 font-semibold text-navy-950 underline underline-offset-4">Back to home</Link>
        </div>
      </div>
    );
  }

  const sessionList = (() => {
    const recommendedIds = rec?.recommendations.map((r) => r.session.id) ?? [];
    const base = sessions.filter((s) => s.active && (!s.girlsOnly || gender === "girl"));
    const recommended = recommendedIds.map((id) => base.find((s) => s.id === id)).filter(Boolean) as AcademySession[];
    if (sessionId && !recommended.some((s) => s.id === sessionId)) {
      const pre = base.find((s) => s.id === sessionId);
      if (pre) recommended.unshift(pre);
    }
    const others = base.filter((s) => !recommended.includes(s));
    return { recommended, others };
  })();

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Progress */}
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Booking progress">
        {steps.map((label, i) => {
          const n = (i + 1) as Step;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined}>
              <span className={`block h-1 rounded-full transition-colors duration-500 ${state === "todo" ? "bg-navy-950/10" : "bg-gold"}`} />
              <span className={`mt-2 hidden text-xs font-semibold sm:block ${state === "current" ? "text-navy-950" : "text-ink-muted"}`}>
                {i + 1}. {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="rounded-3xl bg-white p-6 text-navy-950 shadow-[0_30px_70px_-45px_rgba(7,24,47,0.45)] md:p-10">
        {step === 1 && (
          <form onSubmit={toStep2} noValidate className="space-y-7">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2 className="mt-3 text-[2.25rem] leading-tight">Tell us about your player.</h2>
              <p className="mt-2 text-ink-muted">This helps us place them in the right group from the very first session.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="b-player" className="label">Player&rsquo;s name</label>
                <input id="b-player" className="field" value={playerName} onChange={(e) => setPlayerName(e.target.value)} autoComplete="off" aria-invalid={!!errors.playerName} />
                {err("playerName")}
              </div>
              <div>
                <label htmlFor="b-dob" className="label">Date of birth</label>
                <input id="b-dob" type="date" className="field" value={dob} onChange={(e) => setDob(e.target.value)} aria-invalid={!!errors.dateOfBirth} />
                {age !== undefined && dob && !errors.dateOfBirth && <p className="hint">Age {age}</p>}
                {err("dateOfBirth")}
              </div>
            </div>

            <fieldset>
              <legend className="label">Your child is a…</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {([["boy", "Boy"], ["girl", "Girl"], ["unspecified", "Prefer not to say"]] as const).map(([v, l]) => (
                  <Pill key={v} name="gender" checked={gender === v} onChange={() => setGender(v)}>{l}</Pill>
                ))}
              </div>
              {err("gender")}
            </fieldset>

            <fieldset>
              <legend className="label">Cricket experience</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {experienceOptions.map((o) => (
                  <label
                    key={o.value}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                      experience === o.value ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 hover:border-navy-950/40"
                    }`}
                  >
                    <input type="radio" name="experience" className="sr-only" checked={experience === o.value} onChange={() => setExperience(o.value)} />
                    <span className="block font-semibold">{o.label}</span>
                    <span className={`mt-0.5 block text-sm ${experience === o.value ? "text-slate" : "text-ink-muted"}`}>{o.hint}</span>
                  </label>
                ))}
              </div>
              {err("experience")}
            </fieldset>

            <fieldset>
              <legend className="label">What would they most like to work on?</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {interestOptions.map((o) => (
                  <Pill key={o.value} name="interest" checked={interest === o.value} onChange={() => setInterest(o.value)}>{o.label}</Pill>
                ))}
              </div>
              {err("interest")}
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="b-club" className="label">Club or school <span className="font-normal text-ink-muted">(optional)</span></label>
                <input id="b-club" className="field" value={clubOrSchool} onChange={(e) => setClubOrSchool(e.target.value)} />
              </div>
              <div>
                <label htmlFor="b-profile" className="label">Anything we should know about their game? <span className="font-normal text-ink-muted">(optional)</span></label>
                <input id="b-profile" className="field" value={playingProfile} onChange={(e) => setPlayingProfile(e.target.value)} placeholder="e.g. left-handed batter, bowls leg-spin" />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-4 border-t border-navy-950/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/find-my-session" className="text-sm font-semibold underline underline-offset-4">I&rsquo;d rather speak to someone</Link>
              <button type="submit" className={buttonClass("dark")}>See recommended sessions</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <div>
              <p className="eyebrow">Step 2 {rec && `· ${rec.pathway} pathway`}</p>
              <h2 className="mt-3 text-[2.25rem] leading-tight">Here&rsquo;s where we&rsquo;d start {first}.</h2>
              {rec && <p className="mt-2 text-ink-muted">{rec.summary}</p>}
            </div>

            {formError && <p className="rounded-xl bg-[#fbeae8] p-4 text-sm text-[#8c1d18]" role="alert">{formError}</p>}

            <fieldset>
              <legend className="sr-only">Choose a session</legend>
              <div className="space-y-3">
                {sessionList.recommended.map((s) => (
                  <SessionOption
                    key={s.id}
                    session={s}
                    availability={availability?.[s.id]}
                    checked={sessionId === s.id}
                    onChange={() => setSessionId(s.id)}
                    reason={rec?.recommendations.find((r) => r.session.id === s.id)?.reason}
                    recommended={rec?.recommendations[0]?.session.id === s.id}
                  />
                ))}
              </div>
              {sessionList.others.length > 0 && (
                <div className="mt-5">
                  <button type="button" onClick={() => setShowAll((v) => !v)} className="text-sm font-semibold underline underline-offset-4" aria-expanded={showAll}>
                    {showAll ? "Hide other sessions" : `Show all ${sessionList.others.length} other sessions`}
                  </button>
                  {showAll && (
                    <div className="mt-4 space-y-3">
                      {sessionList.others.map((s) => (
                        <SessionOption key={s.id} session={s} availability={availability?.[s.id]} checked={sessionId === s.id} onChange={() => setSessionId(s.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </fieldset>

            <p className="text-sm text-ink-muted">
              Not quite right after the first session? We&rsquo;ll happily move {first} to a better-suited group.
            </p>

            <div className="flex flex-col-reverse gap-4 border-t border-navy-950/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => go(1)} className="text-sm font-semibold underline underline-offset-4">Back</button>
              <button type="button" onClick={toStep3} className={buttonClass("dark")} disabled={!selected}>
                {mode === "book" ? "Continue" : mode === "waitlist" ? "Continue to waiting list" : "Continue to register interest"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && selected && (
          <form onSubmit={submitDetails} noValidate className="space-y-7">
            <div>
              <p className="eyebrow">Step 3</p>
              <h2 className="mt-3 text-[2.25rem] leading-tight">
                {mode === "book" ? "Your details." : mode === "waitlist" ? "Join the waiting list." : "Register your interest."}
              </h2>
              <p className="mt-2 text-ink-muted">
                {mode === "book"
                  ? "So we can welcome you properly and keep everyone safe."
                  : "No payment needed — we'll contact you as soon as a place is available."}
              </p>
            </div>

            <SelectedSummary session={selected} onChange={() => go(2)} />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="b-parent" label="Parent/guardian name" value={parentName} onChange={setParentName} autoComplete="name" error={errors.parentName} />
              <Field id="b-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
              <Field id="b-mobile" label="Mobile" type="tel" value={mobile} onChange={setMobile} autoComplete="tel" error={errors.mobile} />
            </div>

            {mode === "book" && (
              <>
                <div className="grid gap-5 border-t border-navy-950/10 pt-7 sm:grid-cols-2">
                  <Field id="b-em-name" label="Emergency contact name" value={emergencyName} onChange={setEmergencyName} error={errors.emergencyContactName} hint="Someone we can reach during the session if we can't reach you" />
                  <Field id="b-em-phone" label="Emergency contact phone" type="tel" value={emergencyPhone} onChange={setEmergencyPhone} error={errors.emergencyContactPhone} />
                  <div className="sm:col-span-2">
                    <label htmlFor="b-medical" className="label">Medical or additional needs <span className="font-normal text-ink-muted">(optional)</span></label>
                    <textarea id="b-medical" rows={3} className="field" value={medical} onChange={(e) => setMedical(e.target.value)} placeholder="e.g. asthma (inhaler in bag), allergies, anything that helps us support them" />
                    <p className="hint">Shared only with the coaching team for {first}&rsquo;s session.</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="b-heard" className="label">How did you hear about us? <span className="font-normal text-ink-muted">(optional)</span></label>
                    <input id="b-heard" className="field" value={heardAbout} onChange={(e) => setHeardAbout(e.target.value)} placeholder="School, club, a friend, Instagram…" />
                  </div>
                </div>

                <div className="space-y-3 border-t border-navy-950/10 pt-7">
                  <Check checked={safeguarding} onChange={setSafeguarding} error={errors.safeguardingConsent}>
                    I have read the <Link href="/safeguarding" target="_blank" className="underline underline-offset-2">safeguarding and welfare information</Link> and
                    the details above are correct.
                  </Check>
                  <Check checked={terms} onChange={setTerms} error={errors.termsConsent}>
                    I accept the <Link href="/terms" target="_blank" className="underline underline-offset-2">booking terms</Link> and{" "}
                    <Link href="/refunds" target="_blank" className="underline underline-offset-2">refund policy</Link>.
                  </Check>
                  <Check checked={photoConsent} onChange={setPhotoConsent}>
                    Hillrisers may use photographs of {first} on the academy website and social media. <span className="text-ink-muted">(Optional)</span>
                  </Check>
                </div>
              </>
            )}

            {formError && <p className="rounded-xl bg-[#fbeae8] p-4 text-sm text-[#8c1d18]" role="alert">{formError}</p>}

            <div className="flex flex-col-reverse gap-4 border-t border-navy-950/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => go(2)} className="text-sm font-semibold underline underline-offset-4">Back</button>
              <button type="submit" disabled={busy} className={buttonClass("dark")}>
                {busy ? "Just a moment…" : mode === "book" ? "Review your academy place" : mode === "waitlist" ? "Join Waiting List" : "Register interest"}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        No account needed. Questions? Call <a href={site.phoneHref} className="underline underline-offset-4">{site.phone}</a>.
      </p>
    </div>
  );
}

function Pill({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label
      className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
        checked ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 hover:border-navy-950/40"
      }`}
    >
      <input type="radio" name={name} className="sr-only" checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type={type} className="field" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="error-text">{error}</p>}
    </div>
  );
}

function Check({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-relaxed">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0b2345]" />
        <span>{children}</span>
      </label>
      {error && <p className="error-text ml-8">{error}</p>}
    </div>
  );
}

function SessionOption({
  session: s,
  availability,
  checked,
  onChange,
  reason,
  recommended,
}: {
  session: AcademySession;
  availability?: SessionAvailability;
  checked: boolean;
  onChange: () => void;
  reason?: string;
  recommended?: boolean;
}) {
  return (
    <label
      className={`block cursor-pointer rounded-2xl border p-5 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
        checked ? "border-navy-950 bg-navy-950 text-cream" : "border-navy-950/15 hover:border-navy-950/40"
      }`}
    >
      <input type="radio" name="session" className="sr-only" checked={checked} onChange={onChange} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`text-sm font-semibold ${checked ? "text-gold" : "text-gold-deep"}`}>
          {recommended && "Best starting point · "}
          {s.day} {formatTimeRange(s)}
          {!s.confirmed && " (provisional)"}
        </span>
        <span className={checked ? "" : "[&>span]:!bg-navy-950/5 [&>span]:!text-navy-950"}>
          <AvailabilityBadge session={s} availability={availability} />
        </span>
      </div>
      <span className="mt-2 block font-serif text-2xl">
        {s.title} <span className={`text-base ${checked ? "text-slate" : "text-ink-muted"}`}>· {s.group} · Ages {s.ageMin}–{s.ageMax}</span>
      </span>
      {reason && <span className={`mt-2 block text-[0.95rem] leading-relaxed ${checked ? "text-cream/80" : "text-ink-muted"}`}>{reason}</span>}
      <span className={`mt-3 block text-sm ${checked ? "text-slate" : "text-ink-muted"}`}>
        {durationMinutes(s)} minutes · {s.confirmed ? formatPrice(s.pricePence) : "price confirmed with times"} · max {s.capacity} players
      </span>
    </label>
  );
}

function SelectedSummary({ session: s, onChange }: { session: AcademySession; onChange: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-cream p-5">
      <div>
        <p className="text-sm font-semibold text-gold-deep">{s.day} {formatTimeRange(s)}{!s.confirmed && " (provisional)"}</p>
        <p className="mt-1 font-serif text-xl">{s.title} · {s.group}</p>
      </div>
      <button type="button" onClick={onChange} className="text-sm font-semibold underline underline-offset-4">Change</button>
    </div>
  );
}
