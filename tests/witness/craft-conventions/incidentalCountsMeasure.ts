/**
 * WS-CRAFT-CONVENTIONS-01 · incidental counts and positions (2026-11-09).
 *
 *   npx tsx tests/witness/craft-conventions/incidentalCountsMeasure.ts <out.json> [repeats=2]
 *
 * Direct checkable questions are 54/54 (accuracyMeasure). The slips seen in walks were counts and
 * positions said IN PASSING inside an editorial answer. This asks editorial questions that tend to
 * produce such remarks, extracts every checkable claim it can recognise, and verifies each against
 * the passage:
 *  - "<quoted words> … N words"  → the quote's word count (quote must be a passage sentence or part of one);
 *  - "the Nth sentence … N words" → that sentence's word count;
 *  - "<quote> … the Nth sentence" / "the Nth sentence, <quote>" → the quote is in that sentence.
 * ⛔ Recognition is partial: a claim the patterns miss is not counted either way. Every claim is
 * printed with its verdict so a reader can audit it. Fictional passages only.
 */
import fs from 'node:fs';
import { runStructured } from '@/lib/ai/structured/router';
import { editorialDirective, responsiveLengthDirective } from '@/lib/writersStudio/editorialDepth';
import { conversationTurnInstruction } from '@/lib/writersStudio/conversationTurn';
import { askMaia, type AskContext } from '@/lib/manuscript/ask/askReader';
import { UNMEASURED } from '@/lib/manuscript/ask/staleness';
import { passageFacts } from '../writers-academy/teachingAccuracy';
import { PASSAGE_A, PASSAGE_B } from '../writers-academy/accuracyPassages';
import { PASSAGES } from './conventionCases';

const MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';
const TEXTS = [{ id: 'A', text: PASSAGE_A.text }, { id: 'B', text: PASSAGE_B.text }, { id: 'F', text: PASSAGES.fiction.text }];
/* EDIT_SET=1: an edit-focused set that tends to produce "N words shorter/leaner" remarks (§12.3). */
const EDIT_ASKS = [
  'Tighten the first sentence for me.',
  'Tighten the second sentence for me.',
  'How much shorter could the longest sentence get without losing what it does?',
];
const ASKS_DEFAULT = [
  'Tighten the last sentence for me.',
  'Is the rhythm of this paragraph too even?',
  'Which sentences feel short to you, and does that work?',
  'Could the third sentence be shorter?',
];
const ASKS = process.env.EDIT_SET === '1' ? EDIT_ASKS : ASKS_DEFAULT;
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23, 'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27,
  'twenty-eight': 28, 'twenty-nine': 29, thirty: 30 };
const toNum = (w: string) => (/^\d+$/.test(w) ? Number(w) : NUM[w.toLowerCase()] ?? null);
const words = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
const norm = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[*_]/g, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.,;:!?]+$/, '');
const NUMW = '(\\d{1,2}|(?:twenty-)?(?:one|two|three|four|five|six|seven|eight|nine)|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty)';

export interface Claim { kind: 'quote-count' | 'ordinal-count' | 'quote-position'; text: string; ok: boolean; detail: string }

export function claims(reply: string, passage: string): Claim[] {
  const f = passageFacts(passage);
  const sentenceOf = (q: string) => f.sentences.find((s) => norm(s.text).includes(norm(q)));
  const out: Claim[] = [];
  const quoteCount = new RegExp(`["“*]([^"”*\\n]{3,120})["”*][^.?!\\n]{0,40}?\\b${NUMW}\\s+words`, 'gi');
  for (const m of reply.matchAll(quoteCount)) {
    const q = m[1]!; const n = toNum(m[2]!); const s = sentenceOf(q);
    if (!s || n === null) continue;
    const truth = words(q);
    out.push({ kind: 'quote-count', text: m[0], ok: n === truth, detail: `said ${n}, "${q}" has ${truth}` });
  }
  const ordCount = new RegExp(`\\b(${ORD.join('|')}|last) sentence[^.?!\\n]{0,40}?\\b${NUMW}\\s+words`, 'gi');
  for (const m of reply.matchAll(ordCount)) {
    const idx = m[1]!.toLowerCase() === 'last' ? f.sentences.length : ORD.indexOf(m[1]!.toLowerCase()) + 1;
    const s = f.sentences[idx - 1]; const n = toNum(m[2]!);
    if (!s || n === null) continue;
    out.push({ kind: 'ordinal-count', text: m[0], ok: n === s.words, detail: `said ${n}, sentence ${idx} has ${s.words}` });
  }
  const quotePos = new RegExp(`["“*]([^"”*\\n]{3,120})["”*][^.?!\\n]{0,30}?\\b(?:is|in|as|—)\\s+the\\s+(${ORD.join('|')}|last) sentence|\\b(${ORD.join('|')}|last) sentence[,:]?\\s+["“*]([^"”*\\n]{3,120})["”*]`, 'gi');
  for (const m of reply.matchAll(quotePos)) {
    const q = m[1] ?? m[4]!; const ordWord = (m[2] ?? m[3]!).toLowerCase();
    const idx = ordWord === 'last' ? f.sentences.length : ORD.indexOf(ordWord) + 1;
    const s = sentenceOf(q);
    if (!s) continue;
    out.push({ kind: 'quote-position', text: m[0], ok: s.index === idx, detail: `said sentence ${idx}, "${q}" is in sentence ${s.index}` });
  }
  return out;
}

async function focusReply(text: string, ask: string): Promise<string> {
  const system = ["You are MAIA, an editorial companion in a writer's studio. Reply to the writer in plain prose.",
    editorialDirective('guided'), responsiveLengthDirective('guided'), conversationTurnInstruction()].filter(Boolean).join('\n\n')
    /* WITHOUT_EDIT_LINE=1: baseline arm for §12.3, Passage Focus only (the Develop prompt is built inside askMaia). */
    .replace(process.env.WITHOUT_EDIT_LINE === '1' ? ' When you say how many words a change adds or removes, count the exact words you are changing.' : '\u0000', '');
  const out = await runStructured({ model: MODEL, system, maxTokens: 4096,
    messages: [{ role: 'user', content: `The passage in view:\n"""\n${text}\n"""\n\n${ask}` }] });
  if (!out.ok) throw new Error(out.refusal);
  return out.result.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n');
}
async function developReply(text: string, ask: string): Promise<string> {
  const ctx = { kind: 'work', anchor: { on: 'work' }, staleness: UNMEASURED,
    facts: { work: null, manuscript: { id: 'ms-fictional', draftId: 'd', version: 1 }, sections: [{ id: 's1', position: 1, heading: 'One' }],
      locus: { sectionId: 's1', label: 'One', body: text }, writerUnderstanding: '', writerCorrections: '',
      continuity: { structure: 'unmeasured', prose: 'unmeasured' } } } as unknown as AskContext;
  const out = await askMaia(ctx, [], ask, { model: MODEL });
  if (!out.ok) throw new Error(JSON.stringify(out));
  return out.answer;
}

async function main() {
  const outPath = process.argv[2]; const repeats = Number(process.argv[3] ?? 2);
  if (!outPath) throw new Error('usage: <out.json> [repeats]');
  const rows = [];
  const paths = process.env.FOCUS_ONLY === '1' ? (['focus'] as const) : (['focus', 'develop'] as const);
  for (const path of paths)
    for (const p of TEXTS) for (const ask of ASKS) for (let i = 0; i < repeats; i++) {
      const reply = path === 'focus' ? await focusReply(p.text, ask) : await developReply(p.text, ask);
      const c = claims(reply, p.text);
      rows.push({ path, passage: p.id, ask, rep: i + 1, claims: c, reply });
      process.stdout.write(`${path[0]}${p.id}:${c.filter((x) => x.ok).length}/${c.length} `);
    }
  fs.writeFileSync(outPath, JSON.stringify({ model: MODEL, ranAt: new Date().toISOString(), rows }, null, 2));
  console.log(`\nwrote ${outPath}`);
}
if (require.main === module) main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
