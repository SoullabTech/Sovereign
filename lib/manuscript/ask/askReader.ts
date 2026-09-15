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
import { runStructured } from '../../ai/structured/router';
import type { StructuredBlock, StructuredMessage } from '../../ai/structured/types';
import type { StructureInterpretation } from '../structure/interpret';
import type { ReviewedStructure } from '../structure/review';
import type { AskAnchor } from './anchor';
import type { WorkContextFacts } from './workContext';
import { formatWorkSituationForPrompt } from '@/lib/writersStudio/workSituation';
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
/**
 * ⭐⭐ ASK-WORK-ANCHOR-01 · B2 — THE CONTEXT IS A DISCRIMINATED UNION.
 *
 * ⛔ THE ALTERNATIVE WAS SEMANTIC LAUNDERING, and it is worth naming because it
 * is the cheap path: a Work conversation could have been forced through
 * `interpretation` / `evidence` / `coverage` / `reviewed` by putting a chapter
 * body where a frozen structure reading belongs. The prompt would then tell MAIA
 * *"your reading came out as…"* about a reading nobody made. ⭐ A relationship
 * must not lie about what kind of context it has in order to reuse an interface.
 *
 * ⛔ AND THE DISCRIMINANT IS EXPLICIT, never structural. Sniffing
 * `'interpretation' in ctx` would be inferring a context's kind from its
 * furniture — the same family of guess this programme refuses everywhere else.
 *
 * ⭐ `ProposalContext` is otherwise UNCHANGED: every field it carried, it still
 * carries, and it still means exactly what it meant.
 */
export interface ProposalContext {
  readonly kind: 'proposal';
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

/**
 * ⭐ THE WORK IN VIEW — ⛔ never a snapshot of the whole book.
 *
 * Every fact inside `facts` was re-read server-side from the member's own rows
 * by `buildWorkContext`. ⛔ There is no transcript field: a Work-anchored
 * conversation's history is `ask_turns`, and a context that could carry a
 * client-supplied one would be the browser-authority channel rebuilt.
 */
export interface WorkContext {
  readonly kind: 'work';
  anchor: AskAnchor;
  facts: WorkContextFacts;
  staleness: StalenessState;
}

export type AskContext = ProposalContext | WorkContext;

/**
 * ⭐ What the member is pointing at, when the subject is the Work.
 *
 * ⛔ THE LOCUS IS NOT THE SUBJECT. It says where they are; the conversation is
 * about the Work either way, and the prompt says so in those words so MAIA does
 * not treat a scroll position as a change of topic.
 */
function workAnchorSays(ctx: WorkContext): string {
  const { locus } = ctx.facts;
  const lines = ['The subject of this conversation is the WORK ITSELF, not a passage.'];
  if (locus) {
    lines.push(
      `They are presently at: ${locus.label ?? '(a passage with no heading)'}`,
      'That is where they are, NOT what the conversation is about. If they move',
      'to another passage it is the same conversation about the same Work.',
      '',
      'The passage they are at, as they are editing it now:',
      locus.body);
  } else {
    lines.push('They are not at any particular passage right now.');
  }
  return lines.join('\n');
}

/**
 * ⭐⭐ WHAT SHE HAS, AND — LOAD-BEARING — WHAT SHE DOES NOT.
 *
 * ⛔ The exclusions are `workSituation.ts`'s, inherited rather than restated:
 * she is adjacent to the Work and is not its reader; declared materials were
 * brought into the WORK and not into this conversation; nothing measured about
 * the member appears at all.
 */
function workSays(ctx: WorkContext): string {
  const { work, sections, locus, continuity } = ctx.facts;
  const parts = [
    /* ⭐ The ratified formatter, verbatim — the member's own words and no others. */
    formatWorkSituationForPrompt(work) ?? 'They have not said anything about this Work yet.',
    `The Work's sections, by heading only (you do NOT have their text):\n${
      sections.map((s) => `  ${s.position}. ${s.heading ?? '(no heading)'} [${s.id}]`).join('\n')
        || '  (no addressable sections)'}`,
  ];
  if (!locus) {
    parts.push('You have not been given the text of ANY section.');
  } else {
    parts.push(
      'You have been given the text of exactly ONE section — the one they are at.'
      + ' You do not have any other section\'s text, and you may not ask for it'
      + ' by assuming you have it.');
  }
  /* ⚠️⚠️ TWO FACTS, AND THE SECOND IS AN ABSENCE. ⛔ Structural continuity may
     never stand in for textual continuity: the writer can add two thousand words
     while the structure fingerprint is identical. */
  parts.push(
    'CONTINUITY — what has actually been measured since this conversation opened:'
    + `\n  structure: ${continuity.structure}`
    + `\n  prose: ${continuity.prose}`
    + '\n  The structure measurement covers chapters, sections and their order.'
    + '\n  NOTHING here measures whether they have written or rewritten text.'
    + '\n  "structure: unchanged" does NOT mean the Work has not changed, and you'
    + '\n  must not say or imply that it does.');
  return parts.join('\n\n');
}

function anchorSays(ctx: ProposalContext): string {
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

function readingSays(ctx: ProposalContext): string {
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
  /* No `client`. The provider is the platform's to authorize, not the asker's
     to name. */
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
  const model = opts.model ?? DEFAULT_MODEL;

  /* ⭐⭐ THE HEADINGS FOLLOW THE KIND, and that is not cosmetic. Rendering a
     Work context under "THE READING YOU MADE" would tell MAIA she had made a
     reading she never made — the prompt asserting the very thing the union
     exists to keep apart. */
  /* ⚠️⚠️ THE TEST FOR THE **NEW** KIND, NOT THE OLD ONE — AND THAT DIRECTION IS
     THE WHOLE CORRECTION. A first cut asked `ctx.kind === 'proposal'` and made
     the WORK branch the default, so any context without a discriminant — a
     fixture, an older caller, anything TypeScript did not see — was silently
     rendered as a Work conversation and crashed on facts it never had. The
     existing provider-seam suite caught it immediately.

     ⭐ Asked this way round, a context must OPT IN to being a Work context.
     Anything else is exactly what it was before this union existed, which is
     what *"ProposalContext unchanged"* has to mean at runtime and not only in
     the type. ⛔ A new shape earns the new branch; it is never inherited by
     absence. */
  const system = ctx.kind === 'work'
    ? [STANDING, '', '--- THE WORK YOU ARE SPEAKING WITH ---', workSays(ctx), '',
       '--- WHERE THEY ARE IN IT ---', workAnchorSays(ctx), '',
       '--- HOW MUCH OF THIS IS STILL TRUE ---', stalenessSays(ctx.staleness)].join('\n')
    : [STANDING, '', '--- THE READING YOU MADE ---', readingSays(ctx), '',
       '--- WHAT THEY ARE POINTING AT ---', anchorSays(ctx), '',
       '--- HOW MUCH OF THIS IS STILL TRUE ---', stalenessSays(ctx.staleness)].join('\n');

  const messages: StructuredMessage[] = [
    ...history.map((t) => ({
      role: (t.speaker === 'author' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: t.body,
    })),
    { role: 'user' as const, content: question },
  ];

  try {
    /* NO `tools` KEY. See the header: the capability is absent, not disabled.
       The field is OMITTED rather than set to undefined, so no `tools` key
       reaches the wire at all — there is nothing for a provider to enable.
       No `execution` either: an ordinary completion, as this has always been. */
    const outcome = await runStructured({
      model,
      maxTokens: opts.maxTokens ?? 1200,
      system,
      messages,
    });
    /* A refused inference is not an answer, and must not be shown as one — the
       same ruling the transport catch below makes, for the same reason. */
    if (!outcome.ok) return { ok: false, refusal: 'unreachable' };
    const text = outcome.result.content
      .filter((b): b is Extract<StructuredBlock, { type: 'text' }> => b.type === 'text')
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
