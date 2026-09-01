/**
 * WS2-05B-8B-02c-2 — MAIA answering about a reading she already made.
 *
 * NO TOOLS. This is the whole of gate 6, expressed as an absence: the reader in
 * 05B has a `request_sections` tool and a read budget; this has neither, so
 * there is no path by which a body reaches the model. Not "the budget is zero" -
 * the capability is not in the request. Read expansion is a later slice, and
 * until then MAIA answers from the frozen reading or says she cannot.
 *
 * SHE IS NOT DEFENDING THE PROPOSAL. The standing instructions below say so
 * explicitly, because the failure mode of an editor asked "why did you put 82 in
 * Water" is to rationalise a decision rather than report the evidence for it.
 * She may conclude her reading was wrong. She may also conclude it still holds -
 * performed self-doubt is the same failure wearing better manners.
 *
 * SHE CANNOT ACT. There is no tool, no operation, and no apply path in this
 * module or anywhere it imports. "Do it" is answered with what the gesture would
 * be and where the author makes it, because the author makes it.
 */

import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import type { StructureInterpretation } from '../structure/interpret';
import type { ReviewedStructure } from '../structure/review';
import type { AskAnchor } from './anchor';
import { type StalenessState, isCurrent, mustNotAssertCurrent } from './staleness';

export const ASKER_VERSION = 'ws2-05b-8b-02c-2';

const DEFAULT_MODEL = process.env.MAIA_ASK_MODEL || 'claude-opus-5';

const STANDING = `You are MAIA, in a writer's Studio, talking with the author of this Work about a reading of its structure that you made earlier.

WHAT YOU ARE DOING
The author has pointed at something in that reading and asked about it. Answer as an editor talking to the person who wrote the book: plainly, in your own words, about their material.

WHAT YOU MAY DRAW ON
The frozen reading below, and nothing else. You do not have the manuscript prose in front of you — only its headings, your own account, and the evidence you recorded at the time. If the question cannot be answered honestly from that, SAY SO and say what you would need to read. Do not reconstruct prose you cannot see, and do not infer content from a heading.

YOUR READING IS A CLAIM, NOT A FACT
It may be wrong. If the author shows you something that undoes it, say the reading was wrong and say what changed your mind. Do not defend it because it is yours.
Equally, do not perform doubt to be agreeable: where the evidence still supports what you read, say so, with the evidence.

WHAT YOU CANNOT DO
You cannot change anything. Not the reading, not their structure, not their manuscript. If the right answer is a change to their structure, describe the change and what it would do — the author makes it themselves, deliberately. If they say "do it", tell them plainly that you cannot, and name the gesture they would make.

RESTRAINT IS A REAL ANSWER
"I would leave this alone" is a legitimate reply, with reasons. Do not manufacture a change to seem useful.

Do not use headings, bullets or lists. Write to them in prose. Be brief: a few sentences unless they asked for more.`;

export function askPromptHash(): string {
  return createHash('sha256').update(STANDING).digest('hex');
}

export interface AskAnswerProvenance {
  provider: 'anthropic';
  /** The resolved model string actually sent, never the default's name. */
  model: string;
  promptHash: string;
  askerVersion: string;
  answeredAt: string;
}

export type AskOutcome =
  | { ok: true; answer: string; provenance: AskAnswerProvenance }
  | { ok: false; refusal: 'unreachable' | 'empty_answer' };

/**
 * What she is shown of the reading.
 *
 * ASSEMBLED BY THE HOST, never by the client: a surface that could compose this
 * could tell MAIA the reading said something it did not.
 */
export interface AskContext {
  anchor: AskAnchor;
  interpretation: StructureInterpretation;
  /**
   * What she reasoned from at the time. The prompt promises her this; sending
   * only the interpretation made that promise false and turned "why did you put
   * 82 in Water?" into an invitation to rationalise.
   */
  evidence: unknown;
  coverage: unknown;
  /** The author's own tree, so advice recognises what THEY have made of it. */
  reviewed: ReviewedStructure;
  reviewRevision: number;
  /** Headings and positions, in the draft-section identity. Never bodies. */
  sections: readonly { id: string; position: number; heading: string | null }[];
  staleness: StalenessState;
}

function anchorSays(ctx: AskContext): string {
  const a = ctx.anchor;
  const i = ctx.interpretation;
  switch (a.on) {
    case 'question': {
      const q = i.editorialSynthesis?.questionsForAuthor[a.questionIndex];
      return q
        ? `The author is asking about a question YOU put to them:\n  "${q.label}"\n  ${q.explanation}`
        : 'The author is asking about one of your questions.';
    }
    case 'uncertainty': {
      const u = i.uncertainRegions[a.regionIndex];
      return u
        ? `The author is asking about something you left OPEN in your reading:\n  ${u.why}\n  (across sections ${u.fromSectionId} to ${u.toSectionId})`
        : 'The author is asking about something you left open.';
    }
    case 'division':
      return `The author is asking about the division ${a.unitId} in your reading.`;
    case 'section':
      return `The author is asking about section ${a.sectionId}.`;
    case 'concern':
      return 'The author has brought you something THEY see, not something you raised. Help them think it through; do not redirect to your own reading.';
    default:
      return 'The author is asking about your reading of this Work as a whole.';
  }
}

/**
 * How much of the reading is still true of the Work.
 *
 * UNKNOWN IS SAID AS UNKNOWN. `inputMoved` is unmeasured in this slice by
 * construction - measuring it needs the bodies, and this slice reads none - so
 * MAIA is told she cannot verify the prose is unchanged rather than being
 * allowed to assume it is.
 */
function stalenessSays(s: StalenessState): string {
  if (isCurrent(s)) return 'Nothing has moved under this reading since you made it.';
  const lines: string[] = [];
  if (s.inputMoved.state === 'changed') lines.push('The prose you read has CHANGED since.');
  if (s.inputMoved.state === 'unmeasured') {
    lines.push('You cannot verify whether the prose has changed since you read it — it was not measured. Do not assert what the text currently says; speak about what you saw.');
  }
  if (s.topologyMoved.state === 'changed') lines.push('The sections of the Work have been added to, removed or reordered since.');
  if (s.topologyMoved.state === 'unmeasured') lines.push('Whether the sections moved was not measured.');
  if (s.reviewMoved.state === 'changed') {
    lines.push(`The author has edited their own structure since you read (revision ${s.reviewMoved.was} → ${s.reviewMoved.now}). Your advice may be about an older tree; say so if it matters.`);
  }
  if (s.readingSuperseded.state === 'superseded') {
    lines.push('There is a NEWER reading of this Work. This conversation is about the older one; do not speak as though it were current.');
  }
  if (s.canonicalMoved.state === 'changed') lines.push('The canonical structure of the Work has changed since this conversation opened.');
  if (mustNotAssertCurrent(s)) {
    lines.push('Because of the above you may explain what you SAW, and may not assert what the text says NOW.');
  }
  return lines.join('\n');
}

function readingSays(ctx: AskContext): string {
  const i = ctx.interpretation;
  const parts = [
    `Your reading came out as: ${i.form}`,
    `Your account of it:\n${i.account}`,
  ];
  if (i.editorialSynthesis) {
    parts.push(`What you thought the Work is doing: ${i.editorialSynthesis.thesis}`);
    if (i.editorialSynthesis.strongestFindings.length) {
      parts.push(`What you would stand behind:\n${i.editorialSynthesis.strongestFindings.map((f) => `  - ${f}`).join('\n')}`);
    }
  }
  if ('units' in i && i.units.length) {
    parts.push(`The divisions you proposed:\n${i.units.map((u) =>
      `  - ${u.editorialLabel ?? u.title ?? '(unnamed)'} [${u.id}] sections ${u.fromSectionId}–${u.toSectionId}${
        u.uncertainty?.length ? ` · left open: ${u.uncertainty.join(', ')}` : ''}${
        u.rationale ? `\n      you said: ${u.rationale}` : ''}`).join('\n')}`);
  }
  if (i.unaccountedSectionIds.length) {
    parts.push(`Sections your reading did not account for: ${i.unaccountedSectionIds.join(', ')}`);
  }
  if (i.uncertainRegions.length) {
    parts.push(`What you left open:\n${i.uncertainRegions.map((u) => `  - ${u.why} (${u.fromSectionId}–${u.toSectionId})`).join('\n')}`);
  }
  if (ctx.evidence) {
    parts.push(`WHAT YOU REASONED FROM (frozen with the reading — these are the observations you actually had):\n${
      JSON.stringify(ctx.evidence, null, 1)}`);
  }
  if (ctx.coverage) {
    parts.push(`HOW MUCH OF THE WORK YOU HAD WHEN YOU READ (which sections' text you were given, and which you were not):\n${
      JSON.stringify(ctx.coverage, null, 1)}`);
  }
  /* THEIR TREE, NOT ONLY YOURS. Advice that ignores what the author has already
     changed reads as not having looked at their book. */
  parts.push(`WHAT THE AUTHOR HAS MADE OF IT SINCE (their structure, revision ${ctx.reviewRevision}):\n${
    ctx.reviewed.units.map((u) =>
      `  - ${u.title ?? '(untitled)'} [${u.id}] sections ${u.fromSectionId}–${u.toSectionId}`).join('\n')
      || '  (they have not changed it)'}`);
  parts.push(`The Work's sections, by heading only (you do NOT have their text):\n${
    ctx.sections.map((s) => `  ${s.position}. ${s.heading ?? '(no heading)'} [${s.id}]`).join('\n')}`);
  return parts.join('\n\n');
}

export interface AskOptions {
  client?: Anthropic;
  model?: string;
  maxTokens?: number;
}

/**
 * One author turn in, one MAIA answer out.
 *
 * Prior turns are carried so a thread is a conversation rather than a series of
 * first questions - the whole reason the record is persisted.
 */
export async function askMaia(
  ctx: AskContext,
  history: readonly { speaker: 'author' | 'maia'; body: string }[],
  question: string,
  opts: AskOptions = {},
): Promise<AskOutcome> {
  const client = opts.client ?? new Anthropic();
  const model = opts.model ?? DEFAULT_MODEL;

  const system = [STANDING, '', '--- THE READING YOU MADE ---', readingSays(ctx), '',
    '--- WHAT THEY ARE POINTING AT ---', anchorSays(ctx), '',
    '--- HOW MUCH OF THIS IS STILL TRUE ---', stalenessSays(ctx.staleness)].join('\n');

  const messages: Anthropic.MessageParam[] = [
    ...history.map((t) => ({
      role: (t.speaker === 'author' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: t.body,
    })),
    { role: 'user' as const, content: question },
  ];

  try {
    /* NO `tools` KEY. See the header: the capability is absent, not disabled. */
    const message = await client.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 1200,
      system,
      messages,
    });
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text).join('').trim();
    if (!text) return { ok: false, refusal: 'empty_answer' };
    return {
      ok: true,
      answer: text,
      provenance: {
        provider: 'anthropic',
        model,
        promptHash: askPromptHash(),
        askerVersion: ASKER_VERSION,
        answeredAt: new Date().toISOString(),
      },
    };
  } catch {
    /* A transport failure is not an answer, and must not be shown as one. */
    return { ok: false, refusal: 'unreachable' };
  }
}
