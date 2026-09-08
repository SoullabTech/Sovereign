/**
 * WS2-ENCOUNTER-01 · E2-C — model output → UNBOUND proposals.
 *
 * Founder amendment E2-C/A. Model output must NOT parse into `CandidateNotice`,
 * because a `CandidateNotice` already carries `Anchor.spanDigest` — and either
 * the model would supply that digest, appearing to certify its own evidence, or
 * this parser would need the manuscript bytes it has no business holding.
 *
 *   Evidence provenance is established by the boundary holding the evidence,
 *   never by the cognition proposing the observation.
 *
 * So this file produces `ModelNoticeProposal`: family, words, and coordinates.
 * It never reads the Work, and it computes no hash. Binding happens in `bind.ts`,
 * with the captured snapshot in hand.
 */
import { isEncounterFamily } from './contract';
import { RESULT_TOOL_NAME } from './render';
import type { StructuredBlock } from '@/lib/ai/structured/types';

export interface ProposedSpan {
  readonly startCodePoint: number;
  readonly endCodePoint: number;
}

/** Unbound: coordinates only. No digest — there is nothing here to certify with. */
export interface ModelNoticeProposal {
  readonly family: string;
  readonly text: string;
  readonly spans: readonly ProposedSpan[];
}

export type ParseOutcome =
  | { readonly ok: true; readonly proposals: readonly ModelNoticeProposal[] }
  /** A contract the model did not honour is a FAILURE, never an empty result.
   *  Collapsing it into silence would make a malformed response — or a prose
   *  observation that never passed the screen — look like MAIA having quietly
   *  found nothing worth saying (C7). */
  | { readonly ok: false; readonly reason: 'malformed_tool_input' };

const NOTICE_KEYS = new Set(['family', 'text', 'spans']);
const SPAN_KEYS = new Set(['startCodePoint', 'endCodePoint']);
const ENVELOPE_KEYS = new Set(['outcome', 'notices']);

const bad = { ok: false, reason: 'malformed_tool_input' } as const;

/**
 * Exactly one closed `encounter_result` envelope, or a refusal.
 *
 * Text blocks are IGNORED as content but cannot substitute for the envelope: a
 * prose-only answer produces no envelope and therefore refuses (B3). An
 * undeclared field anywhere refuses too — a `digest`, `confidence`, `severity`
 * or `priority` the model invented must not acquire meaning merely because the
 * provider tolerated it.
 */
export function parseNoticeBlocks(blocks: readonly StructuredBlock[]): ParseOutcome {
  const envelopes = blocks.filter((b) => b.type === 'tool_use') as Extract<StructuredBlock, { type: 'tool_use' }>[];
  /* Zero envelopes = contract failure, NOT silence. Silence is `outcome: none`. */
  if (envelopes.length !== 1) return bad;

  const env = envelopes[0];
  if (env.name !== RESULT_TOOL_NAME) return bad;

  const input = env.input as Record<string, unknown> | null;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return bad;
  for (const k of Object.keys(input)) if (!ENVELOPE_KEYS.has(k)) return bad;

  const outcome = input.outcome;
  if (outcome === 'none') {
    /* Consistency: nothing may ride along with a declared silence. */
    if (input.notices !== undefined) return bad;
    return { ok: true, proposals: [] };
  }
  if (outcome !== 'notices') return bad;

  const raw = input.notices;
  if (!Array.isArray(raw) || raw.length === 0) return bad;

  const proposals: ModelNoticeProposal[] = [];
  for (const n of raw) {
    if (!n || typeof n !== 'object' || Array.isArray(n)) return bad;
    const notice = n as Record<string, unknown>;
    for (const k of Object.keys(notice)) if (!NOTICE_KEYS.has(k)) return bad;

    const { family, text, spans } = notice;
    if (typeof family !== 'string' || !isEncounterFamily(family)) return bad;
    if (typeof text !== 'string' || text.trim() === '') return bad;
    if (!Array.isArray(spans) || spans.length === 0) return bad;

    const parsedSpans: ProposedSpan[] = [];
    for (const s of spans) {
      if (!s || typeof s !== 'object' || Array.isArray(s)) return bad;
      const span = s as Record<string, unknown>;
      for (const k of Object.keys(span)) if (!SPAN_KEYS.has(k)) return bad;
      if (!Number.isInteger(span.startCodePoint) || !Number.isInteger(span.endCodePoint)) return bad;
      parsedSpans.push({
        startCodePoint: span.startCodePoint as number,
        endCodePoint: span.endCodePoint as number,
      });
    }
    proposals.push({ family, text, spans: parsedSpans });
  }

  return { ok: true, proposals };
}
