import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/http";
import { fallbackAnswer, knowledgeText } from "@/lib/ask/knowledge";
import { ASK_CONTACT } from "@/lib/ask/contact";
import { site } from "@/data/site";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(600) }))
    .min(1)
    .max(12),
});

const SYSTEM = `You are "Ask HillRisers", the website assistant for HillRisers Cricket Academy (junior cricket coaching, ages 4–15, Harrow on the Hill).
Answer parents' and partners' questions using ONLY the facts below. Use UK English. Be concise and polite: two or three short sentences, plain text, no headings or markdown.
Never invent prices, times, dates or policies. HillRisers is taking registrations of interest, so point families to /register. Only quote the fees in the facts.
If you don't know, or the question needs a person, say so and offer ${site.email} or a call with ${ASK_CONTACT.name} on ${ASK_CONTACT.phone}.
Stay on topic: politely decline anything unrelated to HillRisers or junior cricket.

<facts>
${knowledgeText()}
</facts>`;

export async function POST(req: Request) {
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;
  const { messages } = parsed.data;
  if (messages[messages.length - 1].role !== "user") return NextResponse.json({ ok: false }, { status: 400 });
  const question = messages[messages.length - 1].content;

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ok: true, answer: fallbackAnswer(question) });

  try {
    const client = new Anthropic({ timeout: 30_000, maxRetries: 1 });
    // History must start with a user turn
    const firstUser = messages.findIndex((m) => m.role === "user");
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: messages.slice(firstUser),
    });
    const answer = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    if (response.stop_reason === "refusal" || !answer) return NextResponse.json({ ok: true, answer: fallbackAnswer(question) });
    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error(`[hillrisers] ask failed ${err.status}`, err.message);
    else console.error("[hillrisers] ask failed", err);
    return NextResponse.json({ ok: true, answer: fallbackAnswer(question) });
  }
}
