/**
 * WS2-ENCOUNTER-01 · E2-C — model output → UNBOUND proposals.
 *
 * ── WHY THE MODEL NO LONGER SUPPLIES COORDINATES (founder ruling 2026-09-08) ─
 *
 * The first live witness settled it. The model quoted the Work accurately and
 * located it falsely: drifts of +422, +499 and +1808 code points, growing with
 * distance into the window. Not a constant shift and not our indexing — a model
 * ESTIMATING positions rather than counting them.
 *
 *   It can copy what it saw. It cannot count where it saw it.
 *
 * So the claim changed. The model now reproduces the evidence VERBATIM, and the
 * server establishes where that evidence is:
 *
 *   The cognition identifies the evidence by reproducing it.
 *   The server establishes where that evidence actually is.
 *
 * This is not the forbidden quote-lookup repair. That prohibition's subject was
 * *repairing a location claim after the model got it wrong*, which remains
 * forbidden. Here there is no model-authored location claim to repair. The server
 * never asks where the model probably meant; it asks whether the exact evidence
 * claimed occurs in the exact text this call was shown.
 *
 * ── AND WHY `assertion` AND `evidence` ARE NOW SEPARATE FIELDS ────────────
 *
 * The same run showed the vocabulary screen reading MAIA's words and the Work's
 * quoted words as one undifferentiated utterance. A Work may contain language
 * MAIA is forbidden to assert; quoting it does not make MAIA its author. The
 * boundary lives in the SHAPE — quotation marks are presentation syntax, not
 * provenance — and it only earns its exemption once the server has proved the
 * evidence is literally Work material.
 */
import { isEncounterFamily } from './contract';
import { RESULT_TOOL_NAME } from './render';
import type { StructuredBlock } from '@/lib/ai/structured/types';

/** Verbatim Work material, as the model reproduced it. Unverified until bound. */
export interface ProposedEvidence {
  readonly excerpt: string;
}

/** Unbound: words only. No coordinates, no digest — nothing to certify with. */
export interface ModelNoticeProposal {
  readonly family: string;
  /** MAIA's own words. This — and only this — is screened. */
  readonly assertion: string;
  readonly evidence: readonly ProposedEvidence[];
}

export type ParseOutcome =
  | { readonly ok: true; readonly proposals: readonly ModelNoticeProposal[] }
  /** A contract the model did not honour is a FAILURE, never an empty result.
   *  Collapsing it into silence would make a malformed response — or a prose
   *  observation that never passed the screen — look like MAIA having quietly
   *  found nothing worth saying (C7). */
  | { readonly ok: false; readonly reason: 'malformed_tool_input' };

const NOTICE_KEYS = new Set(['family', 'assertion', 'evidence']);
const EVIDENCE_KEYS = new Set(['excerpt']);
const ENVELOPE_KEYS = new Set(['outcome', 'notices']);

const bad = { ok: false, reason: 'malformed_tool_input' } as const;

/**
 * Exactly one closed `encounter_result` envelope, or a refusal.
 *
 * Text blocks are IGNORED as content but cannot substitute for the envelope: a
 * prose-only answer produces no envelope and therefore refuses (B3). An
 * undeclared field anywhere refuses too — a `startCodePoint`, `spanDigest`,
 * `confidence` or `unitId` the model invented must not acquire meaning merely
 * because the provider tolerated it. Location is not the model's to assert.
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

    const { family, assertion, evidence } = notice;
    if (typeof family !== 'string' || !isEncounterFamily(family)) return bad;
    if (typeof assertion !== 'string' || assertion.trim() === '') return bad;
    if (!Array.isArray(evidence) || evidence.length === 0) return bad;

    const parsed: ProposedEvidence[] = [];
    for (const e of evidence) {
      if (!e || typeof e !== 'object' || Array.isArray(e)) return bad;
      const item = e as Record<string, unknown>;
      for (const k of Object.keys(item)) if (!EVIDENCE_KEYS.has(k)) return bad;
      if (typeof item.excerpt !== 'string' || item.excerpt.length === 0) return bad;
      parsed.push({ excerpt: item.excerpt });
    }

    proposals.push({ family, assertion, evidence: parsed });
  }

  return { ok: true, proposals };
}
