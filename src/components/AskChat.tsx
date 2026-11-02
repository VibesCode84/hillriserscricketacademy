"use client";

import { useEffect, useRef, useState } from "react";
import { Crest } from "@/components/Logo";
import { ASK_CONTACT } from "@/lib/ask/contact";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = { role: "assistant", content: "Hello! Ask me about our programmes, ages, dates, camps or the venue." };
const SUGGESTIONS = ["What ages do you coach?", "When are the holiday camps?", "Where are sessions held?", "Are girls welcome?"];

const PAGES = ["register", "programmes", "calendar", "girls", "early-risers", "venue", "camps", "faq", "contact", "partners"];
const PAGE_RE = new RegExp(`((?:^|(?<=\\s|\\())\\/(?:${PAGES.join("|")}))\\b`, "g");

/** Turns site paths like /register into links */
function withLinks(text: string) {
  return text.split(PAGE_RE).map((part, i) =>
    PAGES.includes(part.slice(1)) && part.startsWith("/") ? (
      <a key={i} href={part} className="font-semibold text-gold-deep underline underline-offset-2">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function AskChat() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim().slice(0, 600);
    if (!q || busy) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    let answer = `Sorry, something went wrong. Please call ${ASK_CONTACT.name} on ${ASK_CONTACT.phone}.`;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1).slice(-12) }),
      });
      const data = await res.json();
      if (data?.answer) answer = data.answer;
    } catch {
      /* keep the fallback message */
    }
    setMessages((m) => [...m, { role: "assistant", content: answer }]);
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
        <div className="flex items-center gap-3 bg-navy-950 px-5 py-4 text-cream">
          <Crest className="h-9 w-auto" />
          <div>
            <p className="font-serif text-xl leading-tight">Ask HillRisers</p>
            <a href={ASK_CONTACT.tel} className="text-sm text-gold hover:underline">
              Prefer to talk? Call {ASK_CONTACT.name} on {ASK_CONTACT.phone}
            </a>
          </div>
        </div>

        <div className="max-h-[28rem] min-h-[18rem] space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  m.role === "user" ? "bg-navy-950 text-cream" : "bg-cream text-navy-950"
                }`}
              >
                {m.role === "assistant" ? withLinks(m.content) : m.content}
              </p>
            </div>
          ))}
          {busy && <p className="px-2 text-sm text-ink-muted">Typing…</p>}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-cream-300 px-3 py-1.5 text-sm text-navy-950 hover:border-gold-deep"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 border-t border-cream-300 p-3"
        >
          <label htmlFor="ask-input" className="sr-only">
            Your question
          </label>
          <input
            id="ask-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={600}
            placeholder="Type your question…"
            className="min-w-0 flex-1 rounded-full border border-cream-300 px-4 py-2.5 text-[15px] text-navy-950 outline-none focus:border-gold-deep"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
