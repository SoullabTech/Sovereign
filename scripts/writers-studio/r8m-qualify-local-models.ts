/**
 * R8M local editorial / relational qualification harness.
 *
 * R&D-only. It compares candidate local models against one identical, read-only
 * Chapter Conversation Context packet. It is NOT production routing and cannot
 * write the Work.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  RELATIONSHIP_FIRST_DIRECTIVE,
  RELATIONAL_UPDATE_DIRECTIVE,
  engagementInstruction,
  explanationInstruction,
  paceInstruction,
} from '@/lib/writersStudio/workingStyle';
import type { ChapterConversationContext } from '@/lib/writersStudio/qualification/chapterConversationContext';
import { renderChapterConversationContext } from '@/lib/writersStudio/qualification/chapterConversationContext';

type OllamaMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type OllamaReply = {
  model?: string;
  message?: { content?: string; thinking?: string };
  prompt_eval_count?: number;
  eval_count?: number;
  done_reason?: string;
};

const contextPath = process.argv[2] ?? '/tmp/r8m-chapter10-context.json';
const outDir = process.argv[3] ?? '/tmp/r8m-model-qualification';

const candidates: readonly { alias: string; model: string; think?: boolean | 'low' | 'medium' | 'high' }[] = [
  { alias: 'A', model: 'qwen3-coder:30b' },
  { alias: 'B', model: 'qwen3:32b', think: false },
  { alias: 'C', model: 'gpt-oss:20b', think: 'low' },
  { alias: 'D', model: 'maia-content:latest', think: false },
] as const;

const firstTurn = [
  'I want to think with you about what may need strengthening in Chapter 10.',
  'We are in Witness posture, Intimate pace, Plain language.',
  'Begin by reflecting what is already carrying this chapter, then ask me ONE genuine question before suggesting any change.',
  'Use the book context you actually have. Do not ask me to explain an intention that the writer-established context already states.',
  'Do not give me a checklist, scorecard, or report.',
].join('\n');

const clarification = [
  'Yes. The recurrence is intentional. I want the elements to return as living movements, almost ceremonially, because a spiral returns without returning to exactly the same place.',
  'What I care about is not eliminating repetition. I want to know where the return deepens the reader’s experience and where it merely repeats explanation.',
].join('\n');

const systemFor = (packet: ChapterConversationContext) => [
  'You are being qualified as a possible cognitive engine inside MAIA, Writer’s Studio.',
  'This is a controlled editorial/relational test. The packet below is the entire lawful context for this test.',
  'Never pretend you read prose that is not in the packet. Never discard context the packet does establish.',
  '',
  RELATIONSHIP_FIRST_DIRECTIVE,
  engagementInstruction('witness'),
  paceInstruction('intimate'),
  explanationInstruction('plain'),
  RELATIONAL_UPDATE_DIRECTIVE,
  '',
  'SPECIAL QUALIFICATION LAW:',
  'This is the final numbered chapter before the Conclusion. Whole-book position matters.',
  'The writer has already declared that intentional spiral return matters. Do not ask whether repetition was intentional as though that were unknown.',
  'A useful question should arise from a real unresolved tradeoff in the packet.',
  'Do not use headings, bullets, score language, or multiple recommendations. A few sentences is enough.',
  '',
  renderChapterConversationContext(packet),
].join('\n');

async function chat(
  model: string,
  messages: OllamaMessage[],
  think?: boolean | 'low' | 'medium' | 'high',
) {
  const t0 = Date.now();
  const response = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages,
      ...(think !== undefined ? { think } : {}),
      options: {
        num_ctx: 32768,
        num_predict: 700,
      },
    }),
    signal: AbortSignal.timeout(240_000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
  const body = JSON.parse(text) as OllamaReply;
  return {
    model: body.model ?? model,
    content: body.message?.content?.trim() ?? '',
    thinking: body.message?.thinking?.trim() ?? '',
    inputTokens: body.prompt_eval_count ?? null,
    outputTokens: body.eval_count ?? null,
    doneReason: body.done_reason ?? null,
    latencyMs: Date.now() - t0,
  };
}

const mechanical = (text: string) => ({
  chars: text.length,
  questionMarks: (text.match(/\?/g) ?? []).length,
  hasBullets: /(^|\n)\s*[-*•]\s+/m.test(text),
  mentionsFinalPosition: /final (numbered )?chapter|before the conclusion|conclusion/i.test(text),
  recognizesIntentionalReturn: /intentional|ceremon|spiral return|return.*deepen|recurrence/i.test(text),
  reportLanguage: /scorecard|minimal path|recommendations|diagnostic|finding(s)?\b/i.test(text),
});

async function main() {
  const raw = JSON.parse(readFileSync(contextPath, 'utf8')) as { packet: ChapterConversationContext };
  const packet = raw.packet;
  if (packet.contractVersion !== 'r8m-chapter-context-v1') throw new Error('wrong_context_contract');
  if (!packet.chapter.isFinalNumberedChapter) throw new Error('qualification_requires_final_chapter_fact');
  if (!packet.writerEstablished.understanding.includes('Intentional spiral return')) {
    throw new Error('qualification_requires_writer_established_spiral_return');
  }

  mkdirSync(outDir, { recursive: true });
  const system = systemFor(packet);
  const mapping: Record<string, string> = {};
  const summary: Array<Record<string, unknown>> = [];

  for (const candidate of candidates) {
    mapping[candidate.alias] = candidate.model;
    let turn1;
    let turn2;
    try {
      turn1 = await chat(candidate.model, [
        { role: 'system', content: system },
        { role: 'user', content: firstTurn },
      ], candidate.think);

      turn2 = await chat(candidate.model, [
        { role: 'system', content: system },
        { role: 'user', content: firstTurn },
        { role: 'assistant', content: turn1.content },
        { role: 'user', content: clarification },
      ], candidate.think);
    } catch (error) {
      const failure = {
        alias: candidate.alias,
        contextContract: packet.contractVersion,
        error: error instanceof Error ? error.message : String(error),
      };
      writeFileSync(join(outDir, `candidate-${candidate.alias}.json`), JSON.stringify(failure, null, 2));
      writeFileSync(join(outDir, `candidate-${candidate.alias}.txt`), [
        `CANDIDATE ${candidate.alias}`,
        '',
        'TECHNICAL FAILURE',
        failure.error,
        '',
      ].join('\n'));
      summary.push({ alias: candidate.alias, technicalFailure: true, error: failure.error });
      continue;
    }

    const record = {
      alias: candidate.alias,
      contextContract: packet.contractVersion,
      turn1: {
        prompt: firstTurn,
        response: turn1.content,
        mechanical: mechanical(turn1.content),
        latencyMs: turn1.latencyMs,
        inputTokens: turn1.inputTokens,
        outputTokens: turn1.outputTokens,
      },
      turn2: {
        writerClarification: clarification,
        response: turn2.content,
        mechanical: mechanical(turn2.content),
        latencyMs: turn2.latencyMs,
        inputTokens: turn2.inputTokens,
        outputTokens: turn2.outputTokens,
      },
    };
    writeFileSync(join(outDir, `candidate-${candidate.alias}.json`), JSON.stringify(record, null, 2));
    writeFileSync(join(outDir, `candidate-${candidate.alias}.txt`), [
      `CANDIDATE ${candidate.alias}`,
      '',
      'TURN 1',
      turn1.content || '[EMPTY RESPONSE]',
      '',
      'WRITER CLARIFICATION',
      clarification,
      '',
      'TURN 2',
      turn2.content || '[EMPTY RESPONSE]',
      '',
    ].join('\n'));
    summary.push({
      alias: candidate.alias,
      turn1: mechanical(turn1.content),
      turn2: mechanical(turn2.content),
      latencyMs: [turn1.latencyMs, turn2.latencyMs],
      tokens: [
        { input: turn1.inputTokens, output: turn1.outputTokens },
        { input: turn2.inputTokens, output: turn2.outputTokens },
      ],
      empty: !turn1.content || !turn2.content,
    });
  }

  writeFileSync(join(outDir, 'blind-summary.json'), JSON.stringify(summary, null, 2));
  writeFileSync(join(outDir, 'MODEL-MAPPING-SEALED.json'), JSON.stringify(mapping, null, 2));

  process.stdout.write(JSON.stringify({
    outDir,
    candidates: candidates.map((x) => x.alias),
    contextContract: packet.contractVersion,
    summary,
    mappingFile: join(outDir, 'MODEL-MAPPING-SEALED.json'),
  }, null, 2) + '\n');
}

void main();
