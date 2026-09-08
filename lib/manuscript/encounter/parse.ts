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
import { NOTICE_TOOL_NAME } from './render';
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
  /** A contract the model did not honour is a FAILURE, never an empty result —
   *  collapsing it into silence would make a malformed response look like MAIA
   *  having quietly found nothing worth saying (C7). */
  | { readonly ok: false; readonly reason: 'malformed_tool_input' };

export function parseNoticeBlocks(blocks: readonly StructuredBlock[]): ParseOutcome {
  const proposals: ModelNoticeProposal[] = [];

  for (const b of blocks) {
    if (b.type !== 'tool_use') continue;
    if (b.name !== NOTICE_TOOL_NAME) return { ok: false, reason: 'malformed_tool_input' };

    const input = b.input as Record<string, unknown> | null;
    if (!input || typeof input !== 'object') return { ok: false, reason: 'malformed_tool_input' };

    const { family, text, spans } = input as {
      family?: unknown; text?: unknown; spans?: unknown;
    };
    if (typeof family !== 'string' || !isEncounterFamily(family)) {
      return { ok: false, reason: 'malformed_tool_input' };
    }
    if (typeof text !== 'string' || text.trim() === '') {
      return { ok: false, reason: 'malformed_tool_input' };
    }
    if (!Array.isArray(spans) || spans.length === 0) {
      return { ok: false, reason: 'malformed_tool_input' };
    }

    const parsedSpans: ProposedSpan[] = [];
    for (const s of spans) {
      const span = s as Record<string, unknown>;
      const start = span?.startCodePoint;
      const end = span?.endCodePoint;
      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return { ok: false, reason: 'malformed_tool_input' };
      }
      parsedSpans.push({ startCodePoint: start as number, endCodePoint: end as number });
    }

    proposals.push({ family, text, spans: parsedSpans });
  }

  /* No tool calls at all is LAWFUL SILENCE, not a malformed answer. */
  return { ok: true, proposals };
}
