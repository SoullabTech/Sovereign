/**
 * BUILD-07C — DEVELOPMENTAL READING · phenomenon classification, bounded.
 *
 * FOUNDER RULING (2026-09-04). The 07B reader deliberately returns no
 * phenomenon, so 07C may make ONE classification-only model call per reading:
 *
 *   INPUT    claim text · commissioned lens · doesNotEstablish — NO manuscript prose
 *   OUTPUT   one phenomenon tag per claim, from the closed v1 family — nothing else
 *   MODEL    the same resolved model the reader used; no fallback
 *   PROV     classifier version + prompt hash, recorded beside reader provenance
 *   REFUSE   a claim that does not fit the v1 family refuses the FREEZE; the
 *            classifier never invents a category and never rewrites the claim
 *
 * NO PROSE BY CONSTRUCTION. This module's request builder takes claims and a
 * lens. It has no parameter through which recovered text, a request, or an
 * evidence object could arrive, and the module-graph gate keeps it that way.
 *
 * ONE TOOL, FORCED. Every claim index must be classified exactly once; a
 * missing, duplicated or foreign index is a refusal, not a partial result.
 */

import { createHash } from 'crypto';
import { runStructured } from '../../ai/structured/router';
import type { StructuredBlock } from '../../ai/structured/types';
import type { DevelopmentalLens, DevelopmentalNonConclusion } from '../developmentalReader/contract';
import {
  DEVELOPMENTAL_PHENOMENA,
  PHENOMENON_DEFINITION,
  PHENOMENON_LABEL,
  isPhenomenon,
  type ClassifierIdentity,
  type DevelopmentalPhenomenon,
} from './contract';

export const CLASSIFIER_VERSION = 'DEVELOPMENTAL-PHENOMENON-03';
export const CLASSIFIER_TOOL = 'classify_phenomena';
const UNCLASSIFIABLE = 'unclassifiable';

/** What the classifier is allowed to see of a claim. Nothing of the Work. */
export interface ClaimToClassify {
  text: string;
  doesNotEstablish: readonly DevelopmentalNonConclusion[];
}

/**
 * WS2-07-F1 — the family reaches the classifier WITH ITS MEANING. Before this
 * it was eight bare labels and the classifier supplied the semantics from the
 * words themselves, which is how a claim about uniformity twice acquired a
 * label that means asymmetry.
 */
const FAMILY = DEVELOPMENTAL_PHENOMENA
  .map((p) => `  ${PHENOMENON_LABEL[p]}  ("${p}")\n      IS      ${PHENOMENON_DEFINITION[p].is}\n      IS NOT  ${PHENOMENON_DEFINITION[p].isNot}`)
  .join('\n\n');

export const CLASSIFIER_SYSTEM = `You classify developmental reader claims about a manuscript by the PHENOMENON each one notices.

You are given the claims only - their text, the editorial lens they were made under, and what each claim states it does not establish. You are NOT given the manuscript, and you do not need it. You do not judge, rank, interpret, or rewrite the claims.

The phenomenon family is closed. Exactly these, and no others:

${FAMILY}

For each claim, choose the ONE phenomenon the claim most directly notices. The lens is context, not the answer: the same phenomenon can be seen under any lens, and the lens never determines the phenomenon.

WHAT YOU ARE CLASSIFYING. Classify the claim's DEVELOPMENTAL PREDICATE - what the claim says is happening developmentally - NOT the subject it happens to concern. Two claims about the same element of the Work may notice different phenomena, and that is not a contradiction. "This is still withheld here" and "this advances by withholding toward its disclosure" are different predicates about one subject, and they classify differently. Read what the claim asserts, not what it is about.

WHEN TWO COULD APPLY, the more specific one wins:
  register shift / movement          Choose "register-shift" if the claim's content is FULLY EXPRESSED by the change in the manner of telling. Choose "movement" only where the claim describes a broader tracked trajectory that the change in telling participates in.
  movement / positional asymmetry    Movement is change THROUGH a sequence. Positional asymmetry is uneven DISTRIBUTION ACROSS positions. If nothing is tracked as changing, it is not movement.
  unresolved thread / movement       If the claim tracks a withheld state INTO a later disclosure or change, that is "movement". Choose "unresolved-thread" where the predicate the claim evidences is still untaken-up or still withheld at the end-state the claim itself reaches.
  movement / term drift              "term-drift" requires THE TERM ITSELF to carry a different sense at the points read. If the referent or the narrative role changes while the term's sense stays the same, it is NOT term drift; a role tracked as changing through the sequence is "movement".
  recurrence / term drift            If the sense of the term changes, it is term drift. If it recurs unchanged, it is recurrence.
  recurrence / anything more specific  "recurrence" applies only where the REPETITION ITSELF is what the claim says is happening. A repeated textual gesture - withholding, declining to explain, pre-empting - can be a recurrence. But if any other phenomenon in this family captures the claim's predicate, that phenomenon wins.

If a claim does not notice any phenomenon in this family, answer "${UNCLASSIFIABLE}" for that claim. Do not stretch a category to fit. Do not invent one. A claim whose whole content is a MEASUREMENT of the container - heading format, section lengths, counts, positions, how many sections a division holds, or the evenness of any of those - notices no phenomenon in this family, however true it is.

Answer ONLY through the tool, classifying every claim index exactly once.`;

export interface ClassifierTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export function classifierTool(): ClassifierTool {
  return {
    name: CLASSIFIER_TOOL,
    description: 'Classify each claim by the one phenomenon it notices, from the closed family, or "unclassifiable".',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      required: ['classifications'],
      properties: {
        classifications: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['index', 'phenomenon'],
            properties: {
              index: { type: 'integer', minimum: 0 },
              phenomenon: { type: 'string', enum: [...DEVELOPMENTAL_PHENOMENA, UNCLASSIFIABLE] },
            },
          },
        },
      },
    },
  };
}

/** SHA-256 over the classifier's system prompt and tool contract, together. */
export function classifierPromptHash(): string {
  return createHash('sha256')
    .update(CLASSIFIER_SYSTEM, 'utf8')
    .update('\u0000')
    .update(JSON.stringify(classifierTool()), 'utf8')
    .digest('hex');
}

/** Deterministic. Claims by index, with their non-conclusions. No prose of the Work. */
export function renderClassificationRequest(claims: readonly ClaimToClassify[], lens: DevelopmentalLens): string {
  const lines = claims.map((c, i) =>
    `[${i}] ${c.text}\n    does not establish: ${c.doesNotEstablish.join(', ')}`);
  return `COMMISSIONED LENS: ${lens}\n\nCLAIMS (${claims.length}):\n\n${lines.join('\n\n')}\n\nClassify every claim index exactly once, through the tool.`;
}

export type ClassifyRefusal =
  | 'classifier_malformed'
  | 'classifier_foreign_field'
  | 'classifier_index_mismatch'
  | 'classifier_unclassifiable'
  | 'structured_inference_unavailable'
  | 'provider_unavailable'
  | 'invalid_inference_mode'
  | 'not_configured';

export type ParsedClassification =
  | { ok: true; phenomena: readonly DevelopmentalPhenomenon[] }
  | { ok: false; refusal: ClassifyRefusal; detail: string; index: number | null };

const refuse = (refusal: ClassifyRefusal, detail: string, index: number | null = null): ParsedClassification =>
  ({ ok: false, refusal, detail, index });

/** Pure. Every index in [0, expected) exactly once; every value in the family; any unclassifiable refuses. */
export function parseClassifierBlocks(blocks: readonly StructuredBlock[], expected: number): ParsedClassification {
  const calls = blocks.filter(
    (b): b is Extract<StructuredBlock, { type: 'tool_use' }> => b.type === 'tool_use');
  if (calls.length !== 1) return refuse('classifier_malformed', `${calls.length} tool call(s); exactly one is the contract`);
  if (calls[0].name !== CLASSIFIER_TOOL) return refuse('classifier_malformed', `unknown tool "${calls[0].name}"`);
  const input = calls[0].input;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return refuse('classifier_malformed', 'tool input is not an object');
  const o = input as Record<string, unknown>;
  const foreign = Object.keys(o).filter((k) => k !== 'classifications');
  if (foreign.length > 0) return refuse('classifier_foreign_field', `tool input carries ${foreign.join(', ')}`);
  if (!Array.isArray(o.classifications)) return refuse('classifier_malformed', 'classifications is not an array');

  const out: (DevelopmentalPhenomenon | undefined)[] = new Array(expected).fill(undefined);
  for (const [i, raw] of o.classifications.entries()) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return refuse('classifier_malformed', `classifications[${i}] is not an object`, i);
    const c = raw as Record<string, unknown>;
    const extra = Object.keys(c).filter((k) => k !== 'index' && k !== 'phenomenon');
    if (extra.length > 0) return refuse('classifier_foreign_field', `classifications[${i}] carries ${extra.join(', ')}`, i);
    if (typeof c.index !== 'number' || !Number.isInteger(c.index) || c.index < 0 || c.index >= expected) {
      return refuse('classifier_index_mismatch', `classifications[${i}] names index ${JSON.stringify(c.index)}; ${expected} claim(s)`, i);
    }
    if (out[c.index] !== undefined) return refuse('classifier_index_mismatch', `claim ${c.index} classified twice`, i);
    if (c.phenomenon === UNCLASSIFIABLE) {
      return refuse('classifier_unclassifiable', `claim ${c.index} does not fit the v1 phenomenon family; the freeze is refused rather than a category invented`, c.index);
    }
    if (!isPhenomenon(c.phenomenon)) return refuse('classifier_malformed', `classifications[${i}] phenomenon ${JSON.stringify(c.phenomenon)}`, i);
    out[c.index] = c.phenomenon;
  }
  const missing = out.map((p, i) => (p === undefined ? i : -1)).filter((i) => i >= 0);
  if (missing.length > 0) return refuse('classifier_index_mismatch', `claim(s) ${missing.join(', ')} not classified`);
  return { ok: true, phenomena: out as DevelopmentalPhenomenon[] };
}

export type ClassifyOutcome =
  | { ok: true; phenomena: readonly DevelopmentalPhenomenon[]; classifier: ClassifierIdentity }
  | { ok: false; refusal: ClassifyRefusal; detail: string; index: number | null };

/**
 * One bounded call. `model` is the reader's RESOLVED model, pinned; the seam
 * runs no selection policy and this function offers no fallback.
 */
export async function classifyClaims(
  claims: readonly ClaimToClassify[],
  lens: DevelopmentalLens,
  model: string,
): Promise<ClassifyOutcome> {
  if (claims.length === 0) return { ok: false, refusal: 'classifier_malformed', detail: 'nothing to classify', index: null };
  const tool = classifierTool();
  const outcome = await runStructured({
    model,
    maxTokens: 2_000,
    system: CLASSIFIER_SYSTEM,
    tools: [{ name: tool.name, description: tool.description, inputSchema: tool.input_schema }],
    toolChoice: { type: 'tool', name: CLASSIFIER_TOOL },
    messages: [{ role: 'user', content: renderClassificationRequest(claims, lens) }],
  });
  if (!outcome.ok) return { ok: false, refusal: outcome.refusal, detail: outcome.detail ?? outcome.refusal, index: null };
  const { provenance, content } = outcome.result;
  if (provenance.provider !== 'anthropic') {
    return { ok: false, refusal: 'not_configured', detail: `provider ${String(provenance.provider)} cannot be recorded as this classifier's identity`, index: null };
  }
  if (provenance.model !== model) {
    /* The ruling pins the reader's model. A seam that sent another is not this classifier. */
    return { ok: false, refusal: 'not_configured', detail: `pinned ${model}, seam sent ${provenance.model}`, index: null };
  }
  const parsed = parseClassifierBlocks(content, claims.length);
  if (!parsed.ok) return parsed;
  return { ok: true, phenomena: parsed.phenomena, classifier: {
    provider: 'anthropic', model: provenance.model,
    promptHash: classifierPromptHash(), classifierVersion: CLASSIFIER_VERSION,
  } };
}
