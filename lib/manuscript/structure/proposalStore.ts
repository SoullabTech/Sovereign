/**
 * WS2-05B step 3 - holding a reading for review.
 *
 * A PROPOSAL IS NOT STRUCTURE. Nothing in this module writes to
 * `manuscript_structure_units` or `manuscript_structure_members`. A manuscript
 * with fifty proposals has exactly the same structure as one with none.
 *
 * THE FROZEN HALF AND THE MEMBER'S HALF. `interpretation`, `evidence`,
 * `coverage` and both hashes are written once and refused thereafter by a
 * database trigger. `reviewed` is the member's copy and advances under
 * compare-and-advance. The difference between the two is their authorship, and
 * the first time someone says "that is not what MAIA suggested" the answer has
 * to be a row rather than a recollection.
 *
 * NO SECOND COPY OF THE WORK. `assertNoProse` refuses to persist a payload
 * carrying body-shaped fields, so a future caller cannot casually attach the
 * excerpts a reading was made from. Its limits are stated where it is defined:
 * it is a guard against structure, not against quotation.
 */

import { query, transaction } from '@/lib/db/postgres';
import type { StructureEvidence, EvidenceCoverage } from './evidence';
import type { StructureInterpretation } from './interpret';
import { toReviewed, type ReviewedStructure } from './review';

export interface StoredProposal {
  id: string;
  manuscriptId: string;
  createdAt: Date;
  evidence: StructureEvidence;
  interpretation: StructureInterpretation;
  coverage: EvidenceCoverage;
  sectionTopologyHash: string;
  interpretationInputHash: string;
  reviewed: ReviewedStructure;
  reviewRevision: number;
  adoptedAt: Date | null;
  adoptedReviewRevision: number | null;
}

/**
 * What the member is shaping is defined in `./review`, deliberately.
 *
 * It is NOT a `StructureInterpretation`: the six forms describe what a reading
 * FOUND, and once a member is editing, the only question is which divisions
 * they intend. And it carries none of MAIA's rationale, evidence or
 * uncertainty - those stay frozen in the interpretation, or a moved boundary
 * would arrive carrying her reasoning for a boundary she never proposed.
 */
export type { ReviewedStructure } from './review';

export type ProposalRefusal =
  | 'not_found'
  | 'stale_revision'
  | 'already_adopted'
  | 'prose_in_payload';

export type ProposalResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'refused'; refusal: ProposalRefusal; detail?: string };

const ok = <T>(value: T): ProposalResult<T> => ({ status: 'ok', value });
const refuse = <T>(refusal: ProposalRefusal, detail?: string): ProposalResult<T> =>
  ({ status: 'refused', refusal, detail });

/**
 * Refuse a payload carrying the Work rather than a description of it.
 *
 * WHAT IT CATCHES: a manuscript-content field holding actual text - the shape a
 * future caller produces by attaching the excerpts a reading was made from, or
 * by persisting a prompt payload wholesale.
 *
 * IT IS THE VALUE, NOT THE NAME. The first version refused on the key alone and
 * immediately rejected every legitimate proposal, because `coverage.bodies` is
 * the field that records WHICH bodies were read, by id. A name-only guard
 * cannot tell a list of uuids from a copy of a chapter, and a guard that
 * refuses the correct payload is not strict, it is broken. So: a
 * manuscript-content key holding a string, or an array containing strings, is
 * refused; one holding an object is recursed into.
 *
 * WHAT IT DOES NOT CATCH, said plainly rather than implied: MAIA quoting a
 * member's sentence inside a `rationale`. No key-based guard can see that, and
 * pretending otherwise would be worse than the gap. The guarantee here is only
 * that this table never becomes a SYSTEMATIC second copy of the Work.
 */
export function assertNoProse(payload: unknown, path = '$'): string | null {
  const FORBIDDEN = /^(body|bodies|text|content|prose|excerpt|excerpts|passage|prompt|messages?)$/i;
  if (Array.isArray(payload)) {
    for (let i = 0; i < payload.length; i++) {
      const found = assertNoProse(payload[i], `${path}[${i}]`);
      if (found) return found;
    }
    return null;
  }
  if (payload && typeof payload === 'object') {
    for (const [k, v] of Object.entries(payload)) {
      if (FORBIDDEN.test(k)) {
        if (typeof v === 'string') return `${path}.${k}`;
        if (Array.isArray(v) && v.some((x) => typeof x === 'string')) return `${path}.${k}`;
      }
      const found = assertNoProse(v, `${path}.${k}`);
      if (found) return found;
    }
  }
  return null;
}

async function owns(manuscriptId: string, memberId: string): Promise<boolean> {
  const r = await query(
    `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId]);
  return r.rows.length > 0;
}

export interface NewProposal {
  evidence: StructureEvidence;
  interpretation: StructureInterpretation;
  coverage: EvidenceCoverage;
  sectionTopologyHash: string;
  interpretationInputHash: string;
}

/**
 * Persist a reading.
 *
 * `reviewed` starts as a copy of whatever the interpretation actually holds -
 * units for the four unit-bearing forms, nothing for `none` and `ambiguous`,
 * because neither of those has a structure to copy. That is the persistence
 * expression of the same rule the types carry: an ambiguous reading has not
 * chosen, and a `none` reading found nothing.
 */
export async function createProposal(
  manuscriptId: string,
  memberId: string,
  input: NewProposal,
): Promise<ProposalResult<{ id: string }>> {
  if (!(await owns(manuscriptId, memberId))) return refuse('not_found');

  for (const [name, payload] of Object.entries({
    evidence: input.evidence,
    interpretation: input.interpretation,
    coverage: input.coverage,
  })) {
    const at = assertNoProse(payload);
    if (at) return refuse('prose_in_payload', `${name}${at.slice(1)}`);
  }

  /* Ids survive from the interpretation, which is what lets the surface pair
     "MAIA proposed" against "your structure" for the same division later.
     `none` and `ambiguous` have nothing to copy: one found no structure, the
     other has not chosen. */
  const reviewed: ReviewedStructure = {
    units: 'units' in input.interpretation
      ? toReviewed(input.interpretation.units)
      : [],
  };

  const r = await query<{ id: string }>(
    `INSERT INTO manuscript_structure_proposals
       (manuscript_id, evidence, interpretation, coverage,
        section_topology_hash, interpretation_input_hash, reviewed)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [manuscriptId, JSON.stringify(input.evidence), JSON.stringify(input.interpretation),
     JSON.stringify(input.coverage), input.sectionTopologyHash,
     input.interpretationInputHash, JSON.stringify(reviewed)]);
  return ok({ id: r.rows[0].id });
}

function hydrate(row: Record<string, unknown>): StoredProposal {
  return {
    id: row.id as string,
    manuscriptId: row.manuscript_id as string,
    createdAt: row.created_at as Date,
    evidence: row.evidence as StructureEvidence,
    interpretation: row.interpretation as StructureInterpretation,
    coverage: row.coverage as EvidenceCoverage,
    sectionTopologyHash: row.section_topology_hash as string,
    interpretationInputHash: row.interpretation_input_hash as string,
    reviewed: row.reviewed as ReviewedStructure,
    reviewRevision: Number(row.review_revision),
    adoptedAt: (row.adopted_at as Date | null) ?? null,
    adoptedReviewRevision: row.adopted_review_revision === null
      ? null : Number(row.adopted_review_revision),
  };
}

/** Ownership is part of the query, so a proposal cannot be read sideways. */
export async function loadProposal(
  proposalId: string,
  memberId: string,
): Promise<ProposalResult<StoredProposal>> {
  const r = await query(
    `SELECT p.* FROM manuscript_structure_proposals p
       JOIN member_manuscripts m ON m.id = p.manuscript_id
      WHERE p.id = $1 AND m.member_id = $2`,
    [proposalId, memberId]);
  return r.rows.length ? ok(hydrate(r.rows[0])) : refuse('not_found');
}

export async function listProposals(
  manuscriptId: string,
  memberId: string,
): Promise<ProposalResult<StoredProposal[]>> {
  if (!(await owns(manuscriptId, memberId))) return refuse('not_found');
  const r = await query(
    `SELECT * FROM manuscript_structure_proposals
      WHERE manuscript_id = $1 ORDER BY created_at DESC`, [manuscriptId]);
  return ok(r.rows.map(hydrate));
}

/**
 * Replace the member's copy, under compare-and-advance.
 *
 * The revision the caller believed is compared against the row; a mismatch
 * REFUSES rather than overwrites - the same discipline as the draft's `version`
 * in 04B, and for the same reason: two tabs reviewing one proposal must not
 * silently discard each other's corrections.
 *
 * An adopted proposal is closed. Editing the reviewed copy after adoption would
 * make `adopted_review_revision` point at something that no longer exists.
 */
export async function updateReviewed(
  proposalId: string,
  memberId: string,
  expectedRevision: number,
  reviewed: ReviewedStructure,
): Promise<ProposalResult<{ reviewRevision: number }>> {
  const at = assertNoProse(reviewed);
  if (at) return refuse('prose_in_payload', at);

  return transaction(async (tx) => {
    const cur = await tx.query<{ review_revision: string; adopted_at: Date | null }>(
      `SELECT p.review_revision, p.adopted_at
         FROM manuscript_structure_proposals p
         JOIN member_manuscripts m ON m.id = p.manuscript_id
        WHERE p.id = $1 AND m.member_id = $2
        FOR UPDATE OF p`,
      [proposalId, memberId]);
    if (cur.rows.length === 0) return refuse<{ reviewRevision: number }>('not_found');
    if (cur.rows[0].adopted_at !== null) {
      return refuse<{ reviewRevision: number }>('already_adopted');
    }
    const current = Number(cur.rows[0].review_revision);
    if (current !== expectedRevision) {
      return refuse<{ reviewRevision: number }>('stale_revision', `at ${current}`);
    }

    const next = current + 1;
    await tx.query(
      `UPDATE manuscript_structure_proposals
          SET reviewed = $3, review_revision = $4, reviewed_at = now()
        WHERE id = $1 AND review_revision = $2`,
      [proposalId, current, JSON.stringify(reviewed), next]);
    return ok({ reviewRevision: next });
  });
}
