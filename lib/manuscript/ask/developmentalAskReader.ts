/**
 * BUILD-07E — MAIA staying with the writer inside something she noticed.
 *
 * NO TOOLS. Like `askReader`, and for the same reason expressed the same way:
 * there is no `tools` key on the request, so the capability is ABSENT rather
 * than disabled. She answers from the frozen observation and its verified
 * evidence, or she says she cannot. Read expansion is not a later slice of this
 * unit — it is a different unit, and adding it here would quietly turn dialogue
 * into rereading.
 *
 * SHE CANNOT ACT. No tool, no operation, no apply path in this module or
 * anything it imports. "Do it" is answered with what the gesture would be and
 * where the writer makes it, because the writer makes it.
 *
 * SHE CANNOT AMEND THE READING. The observation she is discussing is frozen and
 * is never corrected in place (DECIDE INV-4). Nothing she says in a thread
 * re-enters it — not a changed claim, not a phenomenon, not a widened scope,
 * not the confidence the reading contract deliberately refused to carry. That
 * is enforced by the module graph (this file reaches no writer) and by the
 * database (a frozen reading refuses UPDATE at the row), not by this comment.
 *
 * THE SUPERSEDED CASE IS THE INTERESTING ONE (founder ruling Q3, 2026-09-05). A
 * writer's question does not become meaningless because the Work moved.
 * Refusing the thread would erase a legitimate historical relationship with the
 * Work; opening it unqualified would present an old observation as current. So
 * the thread opens, AS SUPERSEDED, and she makes the temporal distinction
 * intelligible early — once, in her own words — rather than reciting it every
 * turn, which is how a true qualification becomes noise the writer stops
 * reading.
 */

import { createHash } from 'crypto';
import { runStructured } from '../../ai/structured/router';
import type { StructuredBlock, StructuredMessage } from '../../ai/structured/types';
import type { DevelopmentalAskContext, EvidenceView } from './developmentalContext';

export const DEVELOPMENTAL_ASKER_VERSION = 'ws2-07e-01';

const DEFAULT_MODEL = process.env.MAIA_ASK_MODEL || 'claude-opus-5';

const STANDING = `You are MAIA, in a writer's Studio, talking with the author of this Work about ONE thing you noticed when you read it developmentally, earlier.

WHAT YOU ARE DOING
The author has pointed at a single observation from that reading and wants to think about it with you. Stay with that observation. You are not summarising the reading, not surveying the Work, and not moving on to what else you noticed unless they ask.

WHAT YOU MAY DRAW ON
The frozen observation below, what it says it does not establish, and the evidence recorded with it — only where that evidence was VERIFIED against what the Work was when you read it. Nothing else. You do not have the manuscript in front of you. You have not looked at it again. If the question cannot be answered honestly from what is below, say so, and say what would be needed.

WHERE EVIDENCE COULD NOT BE VERIFIED
Say that it could not be verified and reason from the observation alone. Do not reconstruct the passage, do not infer its wording, and do not treat your own observation text as if it were the evidence for itself.

YOUR OBSERVATION IS A CLAIM, NOT A FACT
It may be wrong. If the author shows you something that undoes it, say the observation was wrong and say what changed your mind. Do not defend it because it is yours. Equally, do not perform doubt to be agreeable: where the evidence still supports what you noticed, say so, with the evidence.

THE LABEL IS DESCRIPTIVE, NOT A VERDICT
If the observation carries a phenomenon name, it describes the shape of what you noticed; it is not a diagnosis and not a judgement about quality. If it carries none, you noticed something the vocabulary did not name. That is not a defect in the observation and you should not treat it as one, or invent a label for it now.

WHAT YOU CANNOT DO
You cannot change anything: not this observation, not the reading it belongs to, not their manuscript. If the right answer is a change to the Work, describe the change and what it would do — the author makes it themselves, deliberately. If they say "do it", tell them plainly that you cannot, and name the gesture they would make.

IF THEY ASK WHAT IS TRUE OF THE WORK NOW
Tell them the truth: this conversation has not reread the Work, and you cannot answer from here. A new developmental reading is the act that answers it. Do not estimate, do not extrapolate from what you saw then, and do not let the conversation drift into rereading.

RESTRAINT IS A REAL ANSWER
"I would leave this alone" is a legitimate reply, with reasons. So is "I noticed it; I do not know what it means." Do not manufacture significance to seem useful.

Do not use headings, bullets or lists. Write to them in prose. Be brief: a few sentences unless they asked for more.`;

const SUPERSEDED_STANDING = `THIS OBSERVATION WAS MADE AGAINST AN EARLIER STATE OF THE WORK
What you noticed then rested on material that has since changed. The conversation is still worth having — it is about what you saw and what they make of it — but it is historical, and they must not be left thinking otherwise.

Make that distinction intelligible EARLY, in your own words, naming what moved. Then stop repeating it; a qualification restated every turn stops being read.

You may discuss what you noticed then, why that pattern was visible in that evidence, what they make of it now, and whether it still matters to them — structurally, psychologically, symbolically, however they hold it.

You may NOT claim that the observation still describes the Work, that you have checked what is true now, or that current text confirms or refutes it. You have not seen the current text.`;

export function developmentalAskPromptHash(): string {
  return createHash('sha256').update(`${STANDING}\n${SUPERSEDED_STANDING}`).digest('hex');
}

export interface DevelopmentalAskProvenance {
  provider: 'anthropic';
  model: string;
  promptHash: string;
  askerVersion: string;
  answeredAt: string;
}

export type DevelopmentalAskOutcome =
  | { ok: true; answer: string; provenance: DevelopmentalAskProvenance }
  | { ok: false; refusal: 'unreachable' | 'empty_answer' };

/** One reference, rendered. Verified refs carry what was read; unverified carry why not. */
function evidenceSays(e: EvidenceView): string {
  if (e.kind === 'unverifiable') {
    return `  [${e.ref.kind}] COULD NOT BE VERIFIED (${e.refusal}). You do not have this evidence.`;
  }
  const r = e.recovered;
  switch (r.kind) {
    case 'text':
      return `  [${e.ref.kind}] in section ${r.sectionId}, exactly as you read it:\n    ${r.text}`;
    case 'sequence':
      return `  [${e.ref.kind}] the sequence you read, in order: ${r.sectionIds.join(' → ')}`;
    case 'structure':
      return `  [${e.ref.kind}] the authored structure as frozen${r.whole ? ' (the whole topology)' : ''}: ${
        r.units.map((u) => u.title ?? u.id).join(', ')}`;
  }
}

/**
 * What moved, said plainly. Empty for a current or unmeasured observation.
 *
 * The section and unit ids are the Work's own identifiers; naming them is more
 * use to her than a count, and she is talking to the person who wrote them.
 */
function movedSays(ctx: DevelopmentalAskContext): string {
  if (ctx.location.state !== 'superseded') return '';
  const lines = ctx.location.moved.map((m) => {
    switch (m.what) {
      case 'section-text': return `  the text of section ${m.sectionId} has changed`;
      case 'section-absent': return `  section ${m.sectionId} is no longer in the Work`;
      case 'section-order': return `  the order of sections ${m.sectionIds.join(', ')} has changed`;
      case 'structure-unit': return `  the authored unit ${m.unitId} has changed`;
      case 'structure-unit-absent': return `  the authored unit ${m.unitId} is gone`;
      case 'structure-topology': return '  the authored structure of the Work has changed';
    }
  });
  return `WHAT MOVED SINCE YOU READ:\n${lines.join('\n')}`;
}

function locationSays(ctx: DevelopmentalAskContext): string {
  switch (ctx.location.state) {
    case 'current':
      return 'The material this observation rests on is unchanged since you read it.';
    case 'superseded':
      return `${SUPERSEDED_STANDING}\n\n${movedSays(ctx)}`;
    case 'unmeasured':
      /* UNKNOWN IS SAID AS UNKNOWN — never rounded to current. This is the same
         doctrine `staleness.ts` states: a surface that cannot say "I do not
         know" will say "no". */
      return 'Whether the material this observation rests on has changed COULD NOT BE MEASURED. Do not assume it is unchanged, and do not assume it moved. If it matters to the answer, say that you cannot tell.';
  }
}

function observationSays(ctx: DevelopmentalAskContext): string {
  const o = ctx.observation;
  return [
    `You read this Work under the ${ctx.reading.lens} lens on ${ctx.reading.frozenAt}.`,
    '',
    'WHAT YOU NOTICED (your own words, unchanged):',
    `  ${o.text}`,
    '',
    o.phenomenon
      ? `The shape you gave it: ${o.phenomenon}. Descriptive, not a verdict.`
      : 'You gave it no phenomenon name — what you noticed was not one the vocabulary names. That is not a defect.',
    '',
    'WHAT THIS OBSERVATION DOES NOT ESTABLISH (your own limits, which still hold):',
    ...o.doesNotEstablish.map((d) => `  ${d}`),
    '',
    o.structureDependency.kind === 'authored-structure'
      ? 'This observation depends on the structure the author has made of the Work.'
      : 'This observation does not depend on the author\'s structure.',
  ].join('\n');
}

export interface DevelopmentalAskOptions {
  model?: string;
  maxTokens?: number;
}

/**
 * One author turn in, one MAIA answer out — anchored to one observation.
 *
 * Prior turns are carried so a thread is a conversation rather than a series of
 * first questions.
 */
export async function askMaiaDevelopmental(
  ctx: DevelopmentalAskContext,
  history: readonly { speaker: 'author' | 'maia'; body: string }[],
  question: string,
  opts: DevelopmentalAskOptions = {},
): Promise<DevelopmentalAskOutcome> {
  const model = opts.model ?? DEFAULT_MODEL;

  const system = [
    STANDING, '',
    '--- THE OBSERVATION THEY ARE ASKING ABOUT ---', observationSays(ctx), '',
    '--- THE EVIDENCE YOU RECORDED, WHERE IT COULD BE VERIFIED ---',
    ctx.evidence.map(evidenceSays).join('\n'), '',
    '--- HOW THIS OBSERVATION STANDS TO THE WORK NOW ---', locationSays(ctx),
  ].join('\n');

  const messages: StructuredMessage[] = [
    ...history.map((t) => ({
      role: (t.speaker === 'author' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: t.body,
    })),
    { role: 'user' as const, content: question },
  ];

  try {
    /* NO `tools` KEY, and no `execution`. The field is OMITTED rather than set
       to undefined, so nothing reaches the wire for a provider to enable. */
    const outcome = await runStructured({ model, maxTokens: opts.maxTokens ?? 1200, system, messages });
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
        promptHash: developmentalAskPromptHash(),
        askerVersion: DEVELOPMENTAL_ASKER_VERSION,
        answeredAt: new Date().toISOString(),
      },
    };
  } catch {
    /* A transport failure is not an answer, and must not be shown as one. */
    return { ok: false, refusal: 'unreachable' };
  }
}

/** Exported for the falsifiers: the assembled system prompt, without a model call. */
export const __systemForTest = (ctx: DevelopmentalAskContext): string => [
  STANDING, observationSays(ctx), ctx.evidence.map(evidenceSays).join('\n'), locationSays(ctx),
].join('\n');
