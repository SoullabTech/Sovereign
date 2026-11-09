/**
 * WS-CRAFT-CONVENTIONS-01 · before/after witness for CONVENTION_STANCE_DIRECTIVE (2026-11-09).
 *
 *   npx tsx tests/witness/craft-conventions/conventionWitness.ts <before|after> <out.json>
 *
 * ⛔ EVIDENCE CLASS: INSTRUCTION-LEVEL, not a runtime witness. It sends MAIA's real composed
 * editorial rules (editorialDirective + responsive length + the free-Ask conversation shape, or
 * the teaching turn for a Teach me) with a FICTIONAL passage to the editorial model and records
 * the reply. It does not go through the Studio route, the canonical turn, the structured tool,
 * the quote gate, or a member's Work. A Studio walk remains owed.
 * "before" removes exactly CONVENTION_STANCE_DIRECTIVE from the composition and nothing else.
 * No member's writing is used. One sample per case: not a rate.
 * Goes through the same structured seam as the editorial runtime (lib/ai/structured/router),
 * with no tool, so the reply is plain text. maxTokens matches production (4096).
 * Runs 1 and 2 were made by an earlier, uncommitted version that called the SDK directly
 * (run 1 also capped output at 1200 tokens); they are kept as evidence.
 */
import fs from 'node:fs';
import { runStructured } from '@/lib/ai/structured/router';
import {
  CONVENTION_STANCE_DIRECTIVE, editorialDirective, responsiveLengthDirective, type EditorialDepth,
} from '@/lib/writersStudio/editorialDepth';
import { conversationTurnInstruction } from '@/lib/writersStudio/conversationTurn';
import { teachingTurnInstruction } from '@/lib/writersStudio/teachingTurn';
import { PASSAGES, CASES } from './conventionCases';

const MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';

function system(depth: EditorialDepth, teaching: boolean, arm: 'before' | 'after'): string {
  let directive = editorialDirective(depth);
  if (arm === 'before') directive = directive.replace(` ${CONVENTION_STANCE_DIRECTIVE}`, '');
  return [
    'You are MAIA, an editorial companion in a writer\'s studio. Reply to the writer in plain prose.',
    directive,
    responsiveLengthDirective(depth),
    teaching ? teachingTurnInstruction('passage') : conversationTurnInstruction(),
  ].filter(Boolean).join('\n\n');
}

async function main() {
  const arm = process.argv[2];
  const out = process.argv[3];
  if ((arm !== 'before' && arm !== 'after') || !out) throw new Error('usage: <before|after> <out.json>');
  const results = [];
  for (const c of CASES) {
    const passage = PASSAGES[c.passage];
    const sys = system(c.depth, c.teaching, arm);
    if (arm === 'after' && !sys.includes(CONVENTION_STANCE_DIRECTIVE)) throw new Error('after arm lacks the directive');
    if (arm === 'before' && sys.includes(CONVENTION_STANCE_DIRECTIVE)) throw new Error('before arm carries the directive');
    const user = `The passage in view:\n"""\n${passage.text}\n"""\n\n${c.ask}`;
    const out1 = await runStructured({ model: MODEL, system: sys, messages: [{ role: 'user', content: user }], maxTokens: 4096 });
    if (!out1.ok) throw new Error(`${c.id}: ${out1.refusal} ${out1.detail ?? ''}`);
    const reply = out1.result.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n');
    results.push({ stopReason: out1.result.stopReason, provider: out1.result.provenance.provider, id: c.id, family: c.family, depth: c.depth, teaching: c.teaching, passage: c.passage, ask: c.ask, watch: c.watch, reply });
    process.stdout.write(`${c.id} `);
  }
  fs.writeFileSync(out, JSON.stringify({ arm, model: MODEL, ranAt: new Date().toISOString(), results }, null, 2));
  console.log(`\nwrote ${out}`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
