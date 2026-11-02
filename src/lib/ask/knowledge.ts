import { faqGroups, allFaqs } from "@/data/faqs";
import { programmes, specialistSkills, groupSizes } from "@/data/programmes";
import { calendarTerms, holidayPeriods, shutdown } from "@/data/calendar";
import { site } from "@/data/site";
import { ASK_CONTACT } from "./contact";

const holidays = () => holidayPeriods.map((h) => `${h.label} ${h.dates}`).join("; ");

/** Public facts Ask HillRisers may answer from. Built from the site's own data so it stays in step. */
export function knowledgeText() {
  const lines: string[] = [];
  lines.push(`# ${site.name}`, site.description, `Ages ${site.ages}. Email ${site.email}. Website ${site.url}.`);
  lines.push(`Venue: ${site.venue.name}, ${site.venue.addressLines.join(", ")}.`);
  lines.push(`Phone (only give it in this chat): ${ASK_CONTACT.name} on ${ASK_CONTACT.phone}.`);
  lines.push("", "## Programmes");
  for (const p of programmes) lines.push(`- ${p.name} (ages ${p.ages}): ${p.summary}${p.fixedTime ? ` ${p.fixedTime}.` : ""}`);
  lines.push(`Specialist skills: ${specialistSkills.join(", ")}. Up to ${groupSizes.perNet} per net; Early Risers up to ${groupSizes.earlyRisers}.`);
  lines.push("", "## Calendar 2026/27");
  for (const t of calendarTerms) {
    lines.push(`### ${t.term}`);
    for (const e of t.entries) lines.push(`- ${e.dates}: ${e.title}. ${e.detail}`);
  }
  lines.push(`Holiday camps are planned (Monday to Friday, part or full days); dates to be confirmed. Holidays: ${holidays()}. ${shutdown.label}: ${shutdown.dates}.`);
  lines.push("", "## FAQs");
  for (const g of faqGroups) for (const f of g.items) lines.push(`Q: ${f.q}\nA: ${f.a}`);
  lines.push(
    "",
    "## Key pages",
    "Register interest: /register. Programmes: /programmes. Calendar: /calendar. Girls: /girls. Early Risers: /early-risers. Venue: /venue. Camps: /camps. FAQs: /faq. Contact: /contact. Delivery partners: /partners.",
  );
  return lines.join("\n");
}

const STOP = new Set(
  "a an the is are am do does did can could will would my our your i we you it to of for in on at and or how what when where who which why there be with about any this that me us have has".split(" "),
);
const words = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/s$/, ""));

/** Used when no AI key is configured: best-matching FAQ, or a polite hand-off. */
export function fallbackAnswer(question: string) {
  const q = new Set(words(question));
  const has = (...w: string[]) => w.some((x) => q.has(x));
  if (has("phone", "call", "ring", "number", "speak", "talk")) return `You can call ${ASK_CONTACT.name} on ${ASK_CONTACT.phone}, or email ${site.email}.`;
  if (has("camp", "holiday", "half", "easter", "summer", "christma"))
    return `Holiday camps are planned (Monday to Friday, part or full days), dates to be confirmed. Holidays: ${holidays()}. Register your interest at /register to tell us what you'd like.`;
  if (has("age", "old", "programme", "group", "year"))
    return programmes.map((p) => `${p.name}: ages ${p.ages}`).join(". ") + ". Register at /register and we'll suggest the right group.";
  let best = { score: 0, a: "" };
  for (const f of allFaqs) {
    const fw = words(f.q + " " + f.a);
    const score = fw.filter((w) => q.has(w)).length / Math.sqrt(fw.length || 1);
    if (score > best.score) best = { score, a: f.a };
  }
  if (best.score > 0.25) return best.a;
  return `I'm not sure about that one. Email ${site.email} or call ${ASK_CONTACT.name} on ${ASK_CONTACT.phone}.`;
}
