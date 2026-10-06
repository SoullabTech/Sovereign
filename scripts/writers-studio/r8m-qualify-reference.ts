/**
 * R8M strong-reference calibration.
 *
 * Explicit R&D comparison only. Uses the exact same fixture packet and prompts
 * as the local blind round. It does not change production routing.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { anthropicStructuredProvider } from '@/lib/ai/structured/anthropicStructuredAdapter';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import type { ChapterConversationContext } from '@/lib/writersStudio/qualification/chapterConversationContext';
import {
  R8M_FIRST_TURN,
  R8M_WRITER_CLARIFICATION,
  r8mMechanicalSignals,
  r8mSystemFor,
} from '@/lib/writersStudio/qualification/r8mEditorialFixture';

const contextPath = process.argv[2] ?? '/tmp/r8m-chapter10-context.json';
const outPath = process.argv[3] ?? '/tmp/r8m-model-qualification/reference-R.json';
const model = process.argv[4] ?? 'claude-opus-5';

const textOf = (blocks: readonly StructuredBlock[]) =>
  blocks.filter((b): b is Extract<StructuredBlock, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

async function main() {
  const raw = JSON.parse(readFileSync(contextPath, 'utf8')) as { packet: ChapterConversationContext };
  const packet = raw.packet;
  if (packet.contractVersion !== 'r8m-chapter-context-v1') throw new Error('wrong_context_contract');

  const system = r8mSystemFor(packet);
  const provider = anthropicStructuredProvider();

  const first = await provider.execute({
    model,
    maxTokens: 700,
    system,
    messages: [{ role: 'user', content: R8M_FIRST_TURN }],
  });
  const turn1 = textOf(first.content);

  const second = await provider.execute({
    model,
    maxTokens: 700,
    system,
    messages: [
      { role: 'user', content: R8M_FIRST_TURN },
      { role: 'assistant', content: turn1 },
      { role: 'user', content: R8M_WRITER_CLARIFICATION },
    ],
  });
  const turn2 = textOf(second.content);

  const record = {
    alias: 'R',
    role: 'strong_reference_calibration',
    contextContract: packet.contractVersion,
    requestedModel: model,
    turn1: {
      response: turn1,
      mechanical: r8mMechanicalSignals(turn1),
      provenance: first.provenance,
      usage: first.usage,
    },
    turn2: {
      writerClarification: R8M_WRITER_CLARIFICATION,
      response: turn2,
      mechanical: r8mMechanicalSignals(turn2),
      provenance: second.provenance,
      usage: second.usage,
    },
  };
  writeFileSync(outPath, JSON.stringify(record, null, 2));
  writeFileSync(outPath.replace(/\.json$/, '.txt'), [
    'REFERENCE R',
    '',
    'TURN 1',
    turn1,
    '',
    'WRITER CLARIFICATION',
    R8M_WRITER_CLARIFICATION,
    '',
    'TURN 2',
    turn2,
    '',
  ].join('\n'));
  process.stdout.write(JSON.stringify({
    outPath,
    turn1: record.turn1.mechanical,
    turn2: record.turn2.mechanical,
    provenance: [first.provenance, second.provenance],
  }, null, 2) + '\n');
}

void main();
