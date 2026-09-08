/**
 * SEL-0 · the Writer's Studio developmental selector.
 *
 * THE QUESTION IT ANSWERS: of the observations MAIA is permitted to raise,
 * which one is most useful to raise NOW — and is any of them worth raising at
 * all? That second half is not a formality. `DECLINE_TO_SELECT` is a first-class
 * developmental outcome, and the gates below exist so that a decline is never
 * confused with an inability to look.
 *
 * WHAT THIS IS NOT. It is not an evaluator, a scorer, a ranker for display, or
 * a benchmark harness. It is invoked from the ask route on an explicit writer
 * commission and its chosen observation is handed to the ordinary developmental
 * turn, so what the writer receives is one observation in conversation — the
 * same surface they would get by naming it themselves.
 *
 * WRITER PRECEDENCE IS STRUCTURAL, NOT POLITE. This module is unreachable when
 * the writer named an observation: the route branches on the anchor first and
 * never constructs a commission alongside one. Nothing here can override an
 * address, because nothing here runs when there is one.
 *
 * ORDER IS LOAD-BEARING. The boundary gate runs before the candidate set is
 * computed, because computing a candidate set from an unestablished boundary
 * and then answering confidently from it is precisely the error Q12 forbids.
 */

import { createHash } from 'crypto';
import { runStructured } from '../../ai/structured/router';
import type { StructuredBlock, StructuredMessage } from '../../ai/structured/types';
import type { DevelopmentalObservation } from '../developmentalReading/contract';
import type { ReadingAssessment } from '../developmentalReading/assess';
import type { Standing } from '../standing/contract';
import type { F7EligibilitySource } from './f7Eligibility';

export const DEVELOPMENTAL_SELECTOR_VERSION = 'ws2-sel0-selector-01';

const DEFAULT_MODEL = process.env.MAIA_SELECT_MODEL || process.env.MAIA_ASK_MODEL || 'claude-opus-5';

/**
 * Below this, an ordering is not offered and the outcome is a decline.
 *
 * FROZEN WITH THE IMPLEMENTATION, and recorded in the lock: a floor moved after
 * measurement would let the implementation be tuned to its own result.
 */
export const SELECTOR_CONFIDENCE_FLOOR = 0.5;

/* ── gates ──────────────────────────────────────────────────────────────── */

export type SelectionGate =
  | 'SELECTION_BOUNDARY_UNMEASURED'
  | 'NO_LAWFUL_CANDIDATE'
  | 'NO_REMAINING_CANDIDATE_THIS_COMMISSION';

export interface BoundaryInput {
  readonly observations: readonly DevelopmentalObservation[];
  /** Supersession, three-state, from `assessReading(frozenReading, liveWork)`. */
  readonly assessment: ReadingAssessment;
  readonly standings: ReadonlyMap<string, Standing>;
  readonly f7: F7EligibilitySource;
  /** Keys already offered in THIS commission. Never from another one. */
  readonly offered: ReadonlySet<string>;
}

export type BoundaryOutcome =
  | { readonly gate: SelectionGate }
  | { readonly gate: null; readonly candidates: readonly DevelopmentalObservation[] };

/**
 * The lawful candidate set, or the gate that stopped it being one.
 *
 * PURE. No I/O, no model, no clock — so the gates are testable as arithmetic
 * and cannot silently depend on anything the contract prohibits.
 *
 * ⛔ `unmeasured` ANYWHERE stops everything. Not "skip that one": if the live
 * Work could not establish supersession for an observation, the boundary of the
 * lawful set is unknown, and a set computed from an unknown boundary is not a
 * set. Excluding only the unmeasured ones would answer confidently from a
 * candidate space nobody measured.
 */
export function lawfulCandidateBoundary(input: BoundaryInput): BoundaryOutcome {
  const { observations, assessment, standings, f7, offered } = input;

  for (const o of observations) {
    const loc = assessment.observations[o.key];
    if (!loc || loc.state === 'unmeasured') {
      return { gate: 'SELECTION_BOUNDARY_UNMEASURED' };
    }
  }

  const lawful = observations.filter((o) => {
    if (f7.verdict(o.key) !== 'eligible') return false;
    if (standings.get(o.key) === 'dismiss') return false;
    return assessment.observations[o.key]!.state === 'current';
  });
  if (lawful.length === 0) return { gate: 'NO_LAWFUL_CANDIDATE' };

  const remaining = lawful.filter((o) => !offered.has(o.key));
  if (remaining.length === 0) return { gate: 'NO_REMAINING_CANDIDATE_THIS_COMMISSION' };

  return { gate: null, candidates: remaining };
}

/* ── the selector ───────────────────────────────────────────────────────── */

export interface SelectorProvenance {
  readonly provider: 'anthropic';
  readonly model: string;
  readonly promptHash: string;
  readonly selectorVersion: string;
  readonly confidenceFloor: number;
  readonly tieBreak: string;
  readonly selectedAt: string;
}

export type SelectorResult =
  | {
      readonly kind: 'ordering';
      /** TOTAL over the candidates handed in. Deterministic; see `canonicalise`. */
      readonly ordering: readonly string[];
      /** INTERNAL. Never rendered, never sent to the writer, never a percentage. */
      readonly confidence: number;
      readonly provenance: SelectorProvenance;
    }
  | { readonly kind: 'decline'; readonly confidence: number; readonly provenance: SelectorProvenance }
  | { readonly kind: 'unreachable' };

export interface SelectorInput {
  readonly candidates: readonly DevelopmentalObservation[];
  /** The writer's present turn, in their words. */
  readonly writerTurn: string;
  readonly commissionedLens: string;
  readonly withStructure: boolean;
  readonly sectionsRead: number;
  readonly revisionNumber: number;
  /** Member-authored standings for the candidates. Permitted input (§2.4). */
  readonly standings: ReadonlyMap<string, Standing>;
  /** Keys carrying an open ask thread. Permitted input (§2.4). */
  readonly openThreads: ReadonlySet<string>;
}

const STANDING_PROMPT = `You are MAIA, in a writer's Studio. The author has just asked you what is worth looking at in a developmental reading you made of their Work.

WHAT YOU ARE DECIDING
Which ONE of the observations below would be most useful to raise with them first, given what they just said. You are ordering them privately so the room can offer them one at a time; the author will never see a ranked list, a score, or a number.

WHAT YOU MAY USE
The observations themselves and what each says it does not establish; how much verified evidence each rests on; the lens the reading was commissioned under and how much of the Work it covered; the author's own present turn and stated intention; the standing the author has taken on an observation; whether an observation already has a conversation open.

WHAT YOU MAY NOT USE
Anything about how often or how long they use this product. Any inference about their psychology, mood, ability, or stage of development. Anything about other writers. You do not have those and must not invent them.

WHAT "MOST USEFUL" MEANS HERE
Useful to the author's own thinking about their Work, now, given what they just said. Not the most severe, not the most impressive, not the one that best demonstrates that you read carefully. An observation that opens a real question they can do something with beats one that is merely true.

RESTRAINT IS A REAL ANSWER
If nothing here is worth raising right now — because the author's turn points elsewhere, or because what you noticed is too thin to be worth their attention — decline. Declining is a legitimate developmental act and is not a failure. Do not manufacture a preference to seem useful.

HOW TO ANSWER
Return ONLY a JSON object, no prose around it:
{"decision":"order","order":["<key>","<key>",...],"confidence":<0..1>}
or
{"decision":"decline","confidence":<0..1>}
For "order", list EVERY key given to you, exactly once, best first.`;

export function developmentalSelectorPromptHash(): string {
  return createHash('sha256').update(STANDING_PROMPT).digest('hex');
}

/**
 * What the selector is shown about one candidate.
 *
 * ⛔ NOTHING PROHIBITED CAN ENTER HERE, because nothing prohibited is a
 * parameter of this function. Evidentiary strength is a count of the
 * observation's own verified references — the observation carrying it, not a
 * usage signal about the person reading it.
 */
function candidateSays(
  o: DevelopmentalObservation,
  standings: ReadonlyMap<string, Standing>,
  openThreads: ReadonlySet<string>,
): string {
  const standing = standings.get(o.key);
  return [
    `KEY ${o.key}`,
    `  what you noticed: ${o.observation}`,
    o.phenomenon ? `  shape: ${o.phenomenon} (descriptive, not a verdict)` : '  shape: none named',
    `  rests on: ${o.evidenceRefs.length} recorded reference(s)`,
    `  does not establish: ${o.doesNotEstablish.join('; ')}`,
    o.structureDependency.kind === 'authored-structure'
      ? '  depends on the structure the author made'
      : '  does not depend on the author\'s structure',
    standing ? `  the author's standing on this: ${standing}` : '  the author has taken no standing on this',
    openThreads.has(o.key) ? '  a conversation about this is already open' : '  no conversation open on this',
  ].join('\n');
}

/** Exported for the falsifiers: EXACTLY the string that is sent, without a model call. */
export function __systemForTest(input: SelectorInput): string {
  return systemFor(input);
}

function systemFor(input: SelectorInput): string {
  return [
    STANDING_PROMPT, '',
    '--- THE READING ---',
    `  commissioned lens: ${input.commissionedLens}`,
    `  sections read: ${input.sectionsRead}`,
    `  the author's own structure was ${input.withStructure ? 'given to you' : 'not given to you'}`,
    `  frozen against revision ${input.revisionNumber}`, '',
    '--- THE OBSERVATIONS YOU MAY OFFER ---',
    input.candidates.map((o) => candidateSays(o, input.standings, input.openThreads)).join('\n\n'),
  ].join('\n');
}

/**
 * Numeric-aware key order — `o2` before `o10`, which a plain string sort gets
 * wrong. This is the DETERMINISTIC TIE-BREAK, and it is frozen with the
 * implementation: two runs over the same candidates produce the same completion
 * of the ordering, whatever the model returned.
 */
export const TIE_BREAK_RULE =
  'candidates absent from or duplicated in the model ordering are appended in ascending numeric-aware observation-key order';

function keyLess(a: string, b: string): number {
  const na = /^o(\d+)$/.exec(a);
  const nb = /^o(\d+)$/.exec(b);
  if (na && nb) return Number(na[1]) - Number(nb[1]);
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * A TOTAL ordering over exactly the candidates, from whatever the model said.
 *
 * Unknown keys are dropped and duplicates ignored rather than trusted: an
 * ordering that named something that was never a candidate would be an ordering
 * over a different set than the one the boundary established.
 */
export function canonicalise(
  candidates: readonly string[],
  modelOrder: readonly string[],
): string[] {
  const allowed = new Set(candidates);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of modelOrder) {
    if (allowed.has(k) && !seen.has(k)) { seen.add(k); out.push(k); }
  }
  const rest = candidates.filter((k) => !seen.has(k)).sort(keyLess);
  return [...out, ...rest];
}

function parseDecision(text: string): { decision: string; order?: unknown; confidence?: unknown } | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1));
    if (typeof v !== 'object' || v === null) return null;
    const o = v as Record<string, unknown>;
    return typeof o.decision === 'string' ? { decision: o.decision, order: o.order, confidence: o.confidence } : null;
  } catch { return null; }
}

/**
 * One selection. Called only on a lawful, non-empty, not-yet-offered candidate
 * set — the gates ran first, above, and are not re-checked here.
 *
 * A MALFORMED ANSWER IS NOT A DECLINE. `unreachable` is returned instead, so a
 * transport or format failure can never be shown to the writer as MAIA's
 * developmental restraint.
 */
export async function selectDevelopmental(
  input: SelectorInput,
  opts: { model?: string; maxTokens?: number } = {},
): Promise<SelectorResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const system = systemFor(input);
  const keys = input.candidates.map((o) => o.key);

  const messages: StructuredMessage[] = [
    { role: 'user', content: input.writerTurn },
  ];

  const provenance: SelectorProvenance = {
    provider: 'anthropic',
    model,
    promptHash: developmentalSelectorPromptHash(),
    selectorVersion: DEVELOPMENTAL_SELECTOR_VERSION,
    confidenceFloor: SELECTOR_CONFIDENCE_FLOOR,
    tieBreak: TIE_BREAK_RULE,
    selectedAt: new Date().toISOString(),
  };

  try {
    /* NO `tools` KEY and no `execution` — the capability is ABSENT, not
       disabled, exactly as the developmental asker states it. */
    const outcome = await runStructured({ model, maxTokens: opts.maxTokens ?? 600, system, messages });
    if (!outcome.ok) return { kind: 'unreachable' };
    const text = outcome.result.content
      .filter((b): b is Extract<StructuredBlock, { type: 'text' }> => b.type === 'text')
      .map((b) => b.text).join('').trim();
    const parsed = parseDecision(text);
    if (!parsed) return { kind: 'unreachable' };

    const confidence = typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0;

    if (parsed.decision === 'decline' || confidence < SELECTOR_CONFIDENCE_FLOOR) {
      return { kind: 'decline', confidence, provenance };
    }
    if (parsed.decision !== 'order' || !Array.isArray(parsed.order)) return { kind: 'unreachable' };

    const modelOrder = (parsed.order as unknown[]).filter((k): k is string => typeof k === 'string');
    return { kind: 'ordering', ordering: canonicalise(keys, modelOrder), confidence, provenance };
  } catch {
    return { kind: 'unreachable' };
  }
}
