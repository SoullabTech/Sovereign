/**
 * WS-CRAFT-CONVENTIONS-01 · repeated accuracy measurement (2026-11-09).
 *
 *   npx tsx tests/witness/craft-conventions/accuracyMeasure.ts <out.json> [repeats=3]
 *
 * Counting and position slips recurred in every witness (e.g. "five words" for six). Before any
 * further wording change, this measures how often, on both MAIA paths:
 *  - focus:   the Passage Focus composition (editorialDirective at Guided + responsive length +
 *             the free-Ask conversation shape), sent through the structured seam;
 *  - develop: the REAL Work-conversation prompt, built by askMaia() itself (Develop / Living Work).
 * Truth is computed from the passage (passageFacts / checkQuotes), never judged by a reader.
 * ⛔ Fictional passages only. ⛔ Scoring is heuristic (first number / first ordinal in the reply);
 * every miss is printed so a reader can confirm it.
 */
import fs from 'node:fs';
import { runStructured } from '@/lib/ai/structured/router';
import { editorialDirective, responsiveLengthDirective } from '@/lib/writersStudio/editorialDepth';
import { conversationTurnInstruction } from '@/lib/writersStudio/conversationTurn';
import { askMaia, type AskContext } from '@/lib/manuscript/ask/askReader';
import { UNMEASURED } from '@/lib/manuscript/ask/staleness';
import { passageFacts, checkQuotes } from '../writers-academy/teachingAccuracy';
import { PASSAGE_A, PASSAGE_B } from '../writers-academy/accuracyPassages';
import { PASSAGES } from './conventionCases';

const MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';
const TEXTS = [
  { id: 'A', text: PASSAGE_A.text },
  { id: 'B', text: PASSAGE_B.text },
  { id: 'F', text: PASSAGES.fiction.text },
];
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23, 'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27,
  'twenty-eight': 28, 'twenty-nine': 29, thirty: 30 };

function firstNumber(reply: string): number | null {
  const m = reply.toLowerCase().match(/\b(\d{1,3}|twenty-(?:one|two|three|four|five|six|seven|eight|nine)|thirty|twenty|nineteen|eighteen|seventeen|sixteen|fifteen|fourteen|thirteen|twelve|eleven|ten|nine|eight|seven|six|five|four|three|two|one)\b/);
  if (!m) return null;
  return /^\d+$/.test(m[1]!) ? Number(m[1]) : NUM[m[1]!] ?? null;
}
function firstOrdinal(reply: string): number | null {
  const m = reply.toLowerCase().match(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b|\bsentence (\d+)\b/);
  if (!m) return null;
  return m[1] ? ORD.indexOf(m[1]) + 1 : Number(m[2]);
}
const norm = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();

interface Q { id: string; ask: string; score: (reply: string, text: string) => { ok: boolean; truth: string; got: string } }
const QUESTIONS: Q[] = [
  { id: 'count3', ask: 'How many words are in the third sentence?', score: (r, t) => {
    const truth = passageFacts(t).sentences[2]!.words; const got = firstNumber(r);
    return { ok: got === truth, truth: String(truth), got: String(got) }; } },
  { id: 'longest', ask: 'Which sentence is the longest?', score: (r, t) => {
    // A tie is a real answer: when several sentences share the maximum, the reply must say so.
    const f = passageFacts(t); const max = Math.max(...f.sentences.map((x) => x.words));
    const tied = f.sentences.filter((x) => x.words === max).map((x) => x.index);
    if (tied.length > 1) {
      const ok = /\b(tie|tied|both|equal|same length)\b/i.test(r);
      return { ok, truth: `tie ${tied.join('+')} at ${max}`, got: ok ? 'tie named' : r.slice(0, 120) };
    }
    const got = firstOrdinal(r);
    return { ok: got === f.longest, truth: String(f.longest), got: String(got) }; } },
  { id: 'quote2', ask: 'Quote the second sentence exactly.', score: (r, t) => {
    const s2 = passageFacts(t).sentences[1]!.text; const faithful = checkQuotes(r, t).every((c) => c.faithful);
    const ok = norm(r).includes(norm(s2)) && faithful;
    return { ok, truth: s2, got: ok ? 'exact' : r.slice(0, 160) }; } },
];

async function focusReply(text: string, ask: string): Promise<string> {
  const system = [
    "You are MAIA, an editorial companion in a writer's studio. Reply to the writer in plain prose.",
    editorialDirective('guided'), responsiveLengthDirective('guided'), conversationTurnInstruction(),
  ].filter(Boolean).join('\n\n');
  const out = await runStructured({ model: MODEL, system, maxTokens: 4096,
    messages: [{ role: 'user', content: `The passage in view:\n"""\n${text}\n"""\n\n${ask}` }] });
  if (!out.ok) throw new Error(`focus: ${out.refusal}`);
  return out.result.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n');
}

async function developReply(text: string, ask: string): Promise<string> {
  const ctx = {
    kind: 'work', anchor: { on: 'work' }, staleness: UNMEASURED,
    facts: {
      work: null, manuscript: { id: 'ms-fictional', draftId: 'd-fictional', version: 1 },
      sections: [{ id: 'sec-1', position: 1, heading: 'One' }],
      locus: { sectionId: 'sec-1', label: 'One', body: text },
      writerUnderstanding: '', writerCorrections: '', continuity: { structure: 'unmeasured', prose: 'unmeasured' },
    },
  } as unknown as AskContext;
  const out = await askMaia(ctx, [], ask, { model: MODEL });
  if (!out.ok) throw new Error(`develop: ${JSON.stringify(out).slice(0, 200)}`);
  return (out as { answer?: string; text?: string }).answer ?? (out as { text?: string }).text ?? JSON.stringify(out).slice(0, 400);
}

async function main() {
  const outPath = process.argv[2];
  const repeats = Number(process.argv[3] ?? 3);
  if (!outPath) throw new Error('usage: <out.json> [repeats]');
  const rows = [];
  for (const path of ['focus', 'develop'] as const) {
    for (const p of TEXTS) for (const q of QUESTIONS) for (let i = 0; i < repeats; i++) {
      const reply = path === 'focus' ? await focusReply(p.text, q.ask) : await developReply(p.text, q.ask);
      const s = q.score(reply, p.text);
      rows.push({ path, passage: p.id, q: q.id, rep: i + 1, ...s, reply });
      process.stdout.write(`${path[0]}${p.id}${q.id}${s.ok ? '✓' : '✗'} `);
    }
  }
  fs.writeFileSync(outPath, JSON.stringify({ model: MODEL, ranAt: new Date().toISOString(), rows }, null, 2));
  console.log(`\nwrote ${outPath}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
