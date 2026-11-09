/**
 * WS-CRAFT-CONVENTIONS-01 · witness for ruling 3 (professional names) and G-3 (working style and
 * Teach me in the Develop conversation), 2026-11-09.
 *
 *   npx tsx tests/witness/craft-conventions/namesAndDevelopDepthWitness.ts <out.json>
 *
 * Ruling 3 runs through the Passage Focus composition (editorialDirective at each depth).
 * G-3 runs through the REAL Develop/Work prompt, built by askMaia() with the new context fields.
 * ⛔ Instruction-level, fictional passage only, one sample per case; a reader judges the replies.
 */
import fs from 'node:fs';
import { runStructured } from '@/lib/ai/structured/router';
import { editorialDirective, responsiveLengthDirective, type EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import { conversationTurnInstruction } from '@/lib/writersStudio/conversationTurn';
import { askMaia, type AskContext } from '@/lib/manuscript/ask/askReader';
import { UNMEASURED } from '@/lib/manuscript/ask/staleness';
import type { ExplanationDepth } from '@/lib/writersStudio/workingStyle';
import type { TeachingAnchor } from '@/lib/writersStudio/teachingTurn';
import { PASSAGES } from './conventionCases';

const MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';
const TEXT = PASSAGES.fiction.text;

async function focus(depth: EditorialDepth, ask: string): Promise<string> {
  const system = ["You are MAIA, an editorial companion in a writer's studio. Reply to the writer in plain prose.",
    editorialDirective(depth), responsiveLengthDirective(depth), conversationTurnInstruction()].filter(Boolean).join('\n\n');
  const out = await runStructured({ model: MODEL, system, maxTokens: 4096,
    messages: [{ role: 'user', content: `The passage in view:\n"""\n${TEXT}\n"""\n\n${ask}` }] });
  if (!out.ok) throw new Error(out.refusal);
  return out.result.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n');
}

async function develop(ask: string, extra: { responseStyle?: ExplanationDepth; teachingAnchor?: TeachingAnchor }): Promise<string> {
  const ctx = { kind: 'work', anchor: { on: 'work' }, staleness: UNMEASURED, ...extra,
    facts: { work: null, manuscript: { id: 'ms-fictional', draftId: 'd', version: 1 },
      sections: [{ id: 's1', position: 1, heading: 'The Ferry' }],
      locus: { sectionId: 's1', label: 'The Ferry', body: TEXT },
      writerUnderstanding: '', writerCorrections: '', continuity: { structure: 'unmeasured', prose: 'unmeasured' } },
  } as unknown as AskContext;
  const out = await askMaia(ctx, [], ask, { model: MODEL });
  if (!out.ok) throw new Error(JSON.stringify(out));
  return out.answer;
}

async function main() {
  const outPath = process.argv[2];
  if (!outPath) throw new Error('usage: <out.json>');
  const rows: Record<string, unknown>[] = [];
  const push = (id: string, meta: Record<string, unknown>, reply: string) => { rows.push({ id, ...meta, reply }); process.stdout.write(`${id} `); };
  // Ruling 3
  for (const depth of ['guided', 'learning', 'direct'] as const) {
    push('N1', { depth, path: 'focus', ask: 'What does "Line" mean in this Studio, and what would an editor call it?' },
      await focus(depth, 'What does "Line" mean in this Studio, and what would an editor call it?'));
    push('N2', { depth, path: 'focus', ask: 'What kind of edit would help this paragraph most right now?' },
      await focus(depth, 'What kind of edit would help this paragraph most right now?'));
  }
  // G-3
  push('D0', { path: 'develop', style: null, anchor: null }, await develop('What is this scene doing?', {}));
  push('D1', { path: 'develop', style: 'plain', anchor: null }, await develop('What is this scene doing?', { responseStyle: 'plain' }));
  push('D2', { path: 'develop', style: 'expert', anchor: null }, await develop('What is this scene doing?', { responseStyle: 'expert' }));
  push('D3', { path: 'develop', style: null, anchor: 'passage' }, await develop('Teach me about what is happening here as writing.', { teachingAnchor: 'passage' }));
  push('D4', { path: 'develop', style: null, anchor: null }, await develop('Teach me about what is happening here as writing.', {}));
  fs.writeFileSync(outPath, JSON.stringify({ model: MODEL, ranAt: new Date().toISOString(), rows }, null, 2));
  console.log(`\nwrote ${outPath}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
