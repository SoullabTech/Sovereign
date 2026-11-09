/**
 * WS-CRAFT-CONVENTIONS-01 · before/after witness for CONVENTION_STANCE_DIRECTIVE (2026-11-09).
 *
 *   npx tsx tests/witness/craft-conventions/conventionWitness.ts <before|seven|after> <out.json> [--all-depths]
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
  CONVENTION_STANCE_DIRECTIVE, WRITER_ATTENTION_DIRECTIVE, editorialDirective, responsiveLengthDirective, type EditorialDepth,
} from '@/lib/writersStudio/editorialDepth';
import { conversationTurnInstruction } from '@/lib/writersStudio/conversationTurn';
import { teachingTurnInstruction } from '@/lib/writersStudio/teachingTurn';
import { PASSAGES, CASES } from './conventionCases';

const MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';

type Arm = 'before' | 'seven' | 'after';
/** before: neither convention rule. seven: the seven rules without ruling 8. after: both. */
function system(depth: EditorialDepth, teaching: boolean, arm: Arm): string {
  let directive = editorialDirective(depth);
  if (arm !== 'after') directive = directive.replace(` ${WRITER_ATTENTION_DIRECTIVE}`, '');
  if (arm === 'before') directive = directive.replace(` ${CONVENTION_STANCE_DIRECTIVE}`, '');
  return [
    'You are MAIA, an editorial companion in a writer\'s studio. Reply to the writer in plain prose.',
    directive,
    responsiveLengthDirective(depth),
    teaching ? teachingTurnInstruction('passage') : conversationTurnInstruction(),
  ].filter(Boolean).join('\n\n');
}

async function main() {
  const arm = process.argv[2] as Arm;
  const out = process.argv[3];
  if ((arm !== 'before' && arm !== 'seven' && arm !== 'after') || !out) throw new Error('usage: <before|seven|after> <out.json>');
  const results = [];
  /* --all-depths: every case at guided, learning and direct (founder acceptance 4). */
  const allDepths = process.argv[4] === '--all-depths';
  const plan = allDepths
    ? CASES.flatMap((c) => (['guided', 'learning', 'direct'] as const).map((depth) => ({ ...c, depth })))
    : CASES;
  for (const c of plan) {
    const passage = PASSAGES[c.passage];
    const sys = system(c.depth, c.teaching, arm);
    if ((arm !== 'before') !== sys.includes(CONVENTION_STANCE_DIRECTIVE)) throw new Error(`${arm} arm has the wrong seven-rule state`);
    if ((arm === 'after') !== sys.includes(WRITER_ATTENTION_DIRECTIVE)) throw new Error(`${arm} arm has the wrong ruling-8 state`);
    const user = `The passage in view:\n"""\n${passage.text}\n"""\n\n${c.ask}`;
    const out1 = await runStructured({ model: MODEL, system: sys, messages: [{ role: 'user', content: user }], maxTokens: 4096 });
    if (!out1.ok) throw new Error(`${c.id}: ${out1.refusal} ${out1.detail ?? ''}`);
    const reply = out1.result.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n');
    results.push({ stopReason: out1.result.stopReason, provider: out1.result.provenance.provider, id: c.id, family: c.family, depth: c.depth, teaching: c.teaching, passage: c.passage, ask: c.ask, watch: c.watch, reply });
    process.stdout.write(`${c.id}/${c.depth[0]} `);
  }
  fs.writeFileSync(out, JSON.stringify({ arm, model: MODEL, ranAt: new Date().toISOString(), results }, null, 2));
  console.log(`\nwrote ${out}`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
