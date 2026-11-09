/**
 * WS-CRAFT-CONVENTIONS-01 · before/after witness for CONVENTION_STANCE_DIRECTIVE (2026-11-09).
 *
 *   npx tsx tests/witness/craft-conventions/conventionWitness.ts <before|seven|nolevels|after> <out.json> [--all-depths] [--only=<case-id-prefix>]
 *
 * ⛔ EVIDENCE CLASS: INSTRUCTION-LEVEL, not a runtime witness. It sends MAIA's real composed
 * editorial rules (editorialDirective + responsive length + the free-Ask conversation shape, or
 * the teaching turn for a Teach me) with a FICTIONAL passage to the editorial model and records
 * the reply. It does not go through the Studio route, the canonical turn, the structured tool,
 * the quote gate, or a member's Work. A Studio walk remains owed.
 * Arms: "before" removes both convention rules (the seven and ruling 8); "seven" removes only
 * ruling 8 (WRITER_ATTENTION_DIRECTIVE); "after" is the composition as shipped. Nothing else changes.
 * No member's writing is used. One sample per case: not a rate.
 * Goes through the same structured seam as the editorial runtime (lib/ai/structured/router),
 * with no tool, so the reply is plain text. maxTokens matches production (4096).
 * Runs 1 and 2 were made by an earlier, uncommitted version that called the SDK directly
 * (run 1 also capped output at 1200 tokens); they are kept as evidence.
 */
import fs from 'node:fs';
import { runStructured } from '@/lib/ai/structured/router';
import {
  CONVENTION_STANCE_DIRECTIVE, EDITORIAL_LEVELS_DIRECTIVE, WRITER_ATTENTION_DIRECTIVE, editorialDirective, responsiveLengthDirective, type EditorialDepth,
} from '@/lib/writersStudio/editorialDepth';
import { conversationTurnInstruction } from '@/lib/writersStudio/conversationTurn';
import { teachingTurnInstruction } from '@/lib/writersStudio/teachingTurn';
import { passageActInstruction, passageActQuestion } from '@/lib/writersStudio/passageActs';
import { PASSAGES, CASES } from './conventionCases';

const MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';

type Arm = 'before' | 'seven' | 'nolevels' | 'oldwhere' | 'after';
/** before: no convention rules and no levels. seven: the seven rules only. nolevels: as shipped minus the levels directive. oldwhere: as shipped but the where-next act's pre-G-5 first line. after: as shipped. */
const OLD_WHERE_NEXT = 'Which one or two exact passages should I consider next?';
function system(depth: EditorialDepth, teaching: boolean, arm: Arm, act?: 'where-next'): string {
  let directive = editorialDirective(depth);
  if (arm !== 'after' && arm !== 'oldwhere') directive = directive.replace(` ${EDITORIAL_LEVELS_DIRECTIVE}`, '');
  if (arm === 'before' || arm === 'seven') directive = directive.replace(` ${WRITER_ATTENTION_DIRECTIVE}`, '');
  if (arm === 'before') directive = directive.replace(` ${CONVENTION_STANCE_DIRECTIVE}`, '');
  return [
    'You are MAIA, an editorial companion in a writer\'s studio. Reply to the writer in plain prose.',
    directive,
    responsiveLengthDirective(depth),
    act ? whereNext(arm) : teaching ? teachingTurnInstruction('passage') : conversationTurnInstruction(),
  ].filter(Boolean).join('\n\n');
}

function whereNext(arm: Arm): string {
  const text = passageActInstruction('where-next');
  if (arm !== 'oldwhere') return text;
  const first = text.split('\n\n')[1]!;
  return text.replace(first, OLD_WHERE_NEXT);
}

async function main() {
  const arm = process.argv[2] as Arm;
  const out = process.argv[3];
  if (!['before', 'seven', 'nolevels', 'oldwhere', 'after'].includes(arm) || !out) throw new Error('usage: <before|seven|nolevels|after> <out.json> [--all-depths] [--only=<case-id-prefix>]');
  const results = [];
  /* --all-depths: every case at guided, learning and direct (founder acceptance 4). */
  const flags = process.argv.slice(4);
  const allDepths = flags.includes('--all-depths');
  const only = flags.find((f) => f.startsWith('--only='))?.slice('--only='.length);
  const cases = only ? CASES.filter((c) => c.id.startsWith(only)) : CASES;
  const plan = allDepths
    ? cases.flatMap((c) => (['guided', 'learning', 'direct'] as const).map((depth) => ({ ...c, depth })))
    : cases;
  for (const c of plan) {
    const passage = PASSAGES[c.passage];
    const sys = system(c.depth, c.teaching, arm, c.act);
    if ((arm !== 'before') !== sys.includes(CONVENTION_STANCE_DIRECTIVE)) throw new Error(`${arm} arm has the wrong seven-rule state`);
    if ((arm === 'after' || arm === 'nolevels' || arm === 'oldwhere') !== sys.includes(WRITER_ATTENTION_DIRECTIVE)) throw new Error(`${arm} arm has the wrong ruling-8 state`);
    if ((arm === 'after' || arm === 'oldwhere') !== sys.includes(EDITORIAL_LEVELS_DIRECTIVE)) throw new Error(`${arm} arm has the wrong levels state`);
    const ask = c.act ? passageActQuestion(c.act) : c.ask;
    const first = `The passage in view:\n"""\n${passage.text}\n"""\n\n${(c.history ?? [])[0]?.content ?? ask}`;
    const messages = c.history?.length
      ? [{ role: 'user' as const, content: first }, ...c.history.slice(1), { role: 'user' as const, content: ask }]
      : [{ role: 'user' as const, content: first }];
    const out1 = await runStructured({ model: MODEL, system: sys, messages, maxTokens: 4096 });
    if (!out1.ok) throw new Error(`${c.id}: ${out1.refusal} ${out1.detail ?? ''}`);
    const reply = out1.result.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n');
    results.push({ stopReason: out1.result.stopReason, provider: out1.result.provenance.provider, id: c.id, family: c.family, depth: c.depth, teaching: c.teaching, passage: c.passage, ask: c.ask, watch: c.watch, reply });
    process.stdout.write(`${c.id}/${c.depth[0]} `);
  }
  fs.writeFileSync(out, JSON.stringify({ arm, model: MODEL, ranAt: new Date().toISOString(), results }, null, 2));
  console.log(`\nwrote ${out}`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
