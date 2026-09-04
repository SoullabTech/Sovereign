/**
 * BUILD-07B — DEVELOPMENTAL READER · the output parser.
 *
 * FAIL CLOSED. A missing tool call, a text-only answer, a second tool, a field
 * the contract does not have, an empty claim, an empty or foreign
 * non-conclusion — each is a typed refusal. Nothing here is tidied into a
 * clean `none` (contract F10–F13). The structure reader's parser learned this
 * the hard way (maiaReader.ts header); this one starts there.
 *
 * WHAT THIS DOES NOT DO. It does not prove references. A ref that is
 * well-shaped but names an unread section is `bindEvidence`'s refusal, made in
 * the host against the request's evidence (read.ts). The parser hands refs
 * through as `unknown[]` on purpose: the proof happens exactly once, in the
 * module that owns it.
 */

import type { StructuredBlock } from '../../ai/structured/types';
import type { NonEmptyArray } from '../development/evidenceRef';
import {
  isNonConclusion,
  type DevelopmentalNonConclusion,
  type DevelopmentalReaderRefusal,
} from './contract';
import { TOOL_NAME } from './render';

/** A claim as the model returned it, before its refs are proven. */
export interface RawClaim {
  text: string;
  refs: readonly unknown[];
  doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>;
}

export type ParsedOutput =
  | { ok: true; outcome: 'none' }
  | { ok: true; outcome: 'claims'; claims: NonEmptyArray<RawClaim> }
  | { ok: false; refusal: DevelopmentalReaderRefusal; detail: string; index: number | null };

const refuse = (
  refusal: DevelopmentalReaderRefusal, detail: string, index: number | null = null,
): ParsedOutput => ({ ok: false, refusal, detail, index });

const TOP_FIELDS = new Set(['outcome', 'claims']);
const CLAIM_FIELDS = new Set(['text', 'refs', 'doesNotEstablish']);

/** A tool the reader does not have. Naming one is asking for something the contract refuses. */
function looksLikeReadRequest(name: string): boolean {
  return /request|section|read|more|fetch|expand|context/i.test(name);
}

export function parseReaderBlocks(blocks: readonly StructuredBlock[]): ParsedOutput {
  const calls = blocks.filter(
    (b): b is Extract<StructuredBlock, { type: 'tool_use' }> => b.type === 'tool_use');

  for (const c of calls) {
    if (c.name !== TOOL_NAME) {
      return looksLikeReadRequest(c.name)
        ? refuse('read_request_attempted', `the model called "${c.name}"; the commissioned scope is final`)
        : refuse('malformed_output', `unknown tool "${c.name}"`);
    }
  }
  if (calls.length === 0) {
    return refuse('malformed_output', 'no tool call; prose is not a reading');
  }
  if (calls.length > 1) {
    return refuse('malformed_output', `${calls.length} tool calls; exactly one is the contract`);
  }

  const input = calls[0].input;
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return refuse('malformed_output', 'tool input is not an object');
  }
  const o = input as Record<string, unknown>;
  const foreign = Object.keys(o).filter((k) => !TOP_FIELDS.has(k));
  if (foreign.length > 0) {
    return refuse('foreign_field', `tool input carries ${foreign.join(', ')}`);
  }

  if (o.outcome === 'none') {
    if (o.claims !== undefined) {
      /* A shape that cannot hold claims must not be filled with them. */
      return refuse('foreign_field', 'outcome "none" carries a claims field');
    }
    return { ok: true, outcome: 'none' };
  }
  if (o.outcome !== 'claims') {
    return refuse('malformed_output',
      `outcome must be "claims" or "none"; got ${JSON.stringify(o.outcome)}`);
  }
  if (!Array.isArray(o.claims) || o.claims.length === 0) {
    return refuse('malformed_output', 'outcome "claims" with no claims');
  }

  const claims: RawClaim[] = [];
  for (const [i, raw] of o.claims.entries()) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return refuse('malformed_output', `claims[${i}] is not an object`, i);
    }
    const c = raw as Record<string, unknown>;
    const extra = Object.keys(c).filter((k) => !CLAIM_FIELDS.has(k));
    if (extra.length > 0) {
      return refuse('foreign_field', `claims[${i}] carries ${extra.join(', ')}`, i);
    }
    if (typeof c.text !== 'string' || c.text.trim() === '') {
      return refuse('empty_claim_text', `claims[${i}] has no text`, i);
    }
    if (!Array.isArray(c.refs)) {
      return refuse('malformed_output', `claims[${i}].refs is not an array`, i);
    }
    if (!Array.isArray(c.doesNotEstablish) || c.doesNotEstablish.length === 0) {
      return refuse('non_conclusion_missing', `claims[${i}] states nothing it does not establish`, i);
    }
    for (const v of c.doesNotEstablish) {
      if (!isNonConclusion(v)) {
        return refuse('non_conclusion_unknown',
          `claims[${i}] carries ${JSON.stringify(v)}, which is not in the vocabulary`, i);
      }
    }
    claims.push({
      text: c.text,
      refs: c.refs as readonly unknown[],
      doesNotEstablish: c.doesNotEstablish as unknown as NonEmptyArray<DevelopmentalNonConclusion>,
    });
  }
  return { ok: true, outcome: 'claims', claims: claims as unknown as NonEmptyArray<RawClaim> };
}
