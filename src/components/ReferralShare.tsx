"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { buttonClass } from "./Button";

export function ReferralShare() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const [origin, setOrigin] = useState<string>(site.url);
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/book${name.trim() ? `?ref=${encodeURIComponent(name.trim())}` : ""}`;
  const message = `We've been going to Hillrisers Cricket Academy at John Lyon School and thought you'd love it too. Cricket's better with a mate! You can book a trial here: ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 md:p-9">
      <label htmlFor="ref-name" className="label">Your child&rsquo;s name (so your friend knows who invited them)</label>
      <input id="ref-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun K" maxLength={60} />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={buttonClass("dark")}>
          Share on WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent("Come and try Hillrisers Cricket Academy")}&body=${encodeURIComponent(message)}`}
          className={buttonClass("dark")}
        >
          Send by email
        </a>
        <button type="button" onClick={copy} className="rounded-full border border-navy-950/20 px-6 py-3.5 text-[0.95rem] font-semibold text-navy-950 hover:border-navy-950">
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      </div>
    </div>
  );
}
