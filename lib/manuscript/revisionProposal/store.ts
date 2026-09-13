/**
 * EDITORIAL-WRITE-01 — the proposal store and its acceptance.
 *
 * ⭐⭐ THE ARCHITECTURE, in one line:
 *
 *   The proposal supplies AUTHORITY. The existing section writer supplies
 *   MUTATION. One transaction binds them, and neither impersonates the other.
 *
 * ── ⛔ WHAT THIS MODULE OWNS, AND WHAT IT MUST NOT ────────────────────────
 *
 *   HERE          the proposal lock · the exact-text guard · single-use
 *                 authority
 *   saveSection…  the manuscript lock · version discipline · the section
 *                 mutation · content derivation · the one version increment
 *
 * ⛔ `saveSectionInTransaction` is NOT taught about proposals, expected text or
 * acceptance. Those are authorization. A duplicated read inside one transaction
 * is acceptable; a duplicated UPDATE is not.
 *
 * ── ⛔ AND THERE IS NO `claim` STEP ───────────────────────────────────────
 *
 * An earlier sketch marked the proposal accepted FIRST and wrote the version
 * afterwards. It was unimplementable twice over: `mrp_acceptance_whole` is a
 * plain CHECK and PostgreSQL does not defer it, so the first statement would
 * have failed outright — and had it succeeded, a later write failure would have
 * left a proposal saying the member's change was made when the Work never moved.
 *
 * So step one LOCKS the proposal; it does not claim it. The durable claim is
 * the final atomic record: `accepted_at` and `resulting_version`, together, at
 * the end, after the mutation.
 */

import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
import { saveSectionInTransaction, splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import {
  applyExactlyOnce, type AcceptOutcome, type ProposalOperation, type ProposalRefusal,
  type RevisionProposal,
} from './contract';

interface Row {
  id: string; work_id: string; draft_id: string; base_version: number;
  operation: ProposalOperation; target_section_id: string;
  expected_text: string; replacement_text: string;
  decision_chain_id: string | null; created_at: Date;
  accepted_at: Date | null; resulting_version: number | null;
}

const hydrate = (r: Row): RevisionProposal => ({
  id: r.id, workId: r.work_id, draftId: r.draft_id, baseVersion: Number(r.base_version),
  operation: r.operation, targetSectionId: r.target_section_id,
  expectedText: r.expected_text, replacementText: r.replacement_text,
  decisionChainId: r.decision_chain_id, createdAt: r.created_at.toISOString(),
  acceptedAt: r.accepted_at ? r.accepted_at.toISOString() : null,
  resultingVersion: r.resulting_version === null ? null : Number(r.resulting_version),
});

const COLUMNS = `id, work_id, draft_id, base_version, operation, target_section_id,
                 expected_text, replacement_text, decision_chain_id, created_at,
                 accepted_at, resulting_version`;

export interface ProposeInput {
  readonly workId: string;
  readonly draftId: string;
  readonly baseVersion: number;
  readonly targetSectionId: string;
  readonly expectedText: string;
  readonly replacementText: string;
  readonly decisionChainId?: string | null;
}

/**
 * Prepare a proposal.
 *
 * ⛔ THIS CHANGES NOTHING IN THE WORK. It records what would change, against
 * what state. `EW-2` asserts that preparing and reading one is inert.
 */
export async function proposeRevision(
  memberId: string, input: ProposeInput,
): Promise<RevisionProposal> {
  const r = await query<Row>(
    `INSERT INTO manuscript_revision_proposals
       (member_id, work_id, draft_id, base_version, operation, target_section_id,
        expected_text, replacement_text, decision_chain_id)
     VALUES ($1, $2, $3, $4, 'delete_exact_text', $5, $6, $7, $8)
     RETURNING ${COLUMNS}`,
    [memberId, input.workId, input.draftId, input.baseVersion, input.targetSectionId,
      input.expectedText, input.replacementText, input.decisionChainId ?? null]);
  return hydrate(r.rows[0]);
}

/** ⛔ Scoped to the member. Another's proposal reads as absent. */
export async function readProposal(
  memberId: string, proposalId: string,
): Promise<RevisionProposal | null> {
  const r = await query<Row>(
    `SELECT ${COLUMNS} FROM manuscript_revision_proposals
      WHERE id = $1 AND member_id = $2`, [proposalId, memberId]);
  return r.rows[0] ? hydrate(r.rows[0]) : null;
}

/**
 * ACCEPT — the member authorizes this exact change, and it happens.
 *
 * ⭐ ONE TRANSACTION, ONE CLIENT, and the order is the law:
 *
 *   1  lock the proposal            FOR UPDATE · still unaccepted
 *   2  lock the draft               FOR UPDATE · still at base_version
 *   3  read the target section      inside that lock
 *   4  project it through the existing section semantics
 *   5  the expected text occurs EXACTLY ONCE
 *   6  the EXISTING mutation, on this same client
 *   7  accepted_at + resulting_version, together
 *
 * ⛔ If anything fails, the proposal stays unaccepted and the Work is unchanged.
 */
export async function acceptRevision(
  memberId: string, proposalId: string,
): Promise<AcceptOutcome> {
  try {
    return await transaction(async (tx: TransactionClient) => {
      /* 1 · LOCK, not claim. Nothing durable is written here. */
      const p = await tx.query<Row>(
        `SELECT ${COLUMNS} FROM manuscript_revision_proposals
          WHERE id = $1 AND member_id = $2 FOR UPDATE`, [proposalId, memberId]);
      if (p.rows.length === 0) return refuse('proposal_unknown');
      const proposal = hydrate(p.rows[0]);
      /* ⭐ A proposal authorizes one change, once. */
      if (proposal.acceptedAt !== null) return refuse('already_accepted');

      /* 2 · The draft, locked, still at the state this was built against. */
      const d = await tx.query<{ id: string; version: string }>(
        `SELECT id, version FROM manuscript_working_drafts
          WHERE id = $1 AND manuscript_id = $2 AND member_id = $3 FOR UPDATE`,
        [proposal.draftId, proposal.workId, memberId]);
      if (d.rows.length === 0) return refuse('draft_not_found');
      /* ⛔ DEFENCE IN DEPTH, not the law. The expected-text guard below is what
         actually authorizes the write. */
      if (Number(d.rows[0].version) !== proposal.baseVersion) return refuse('stale_base');

      /* 3 · The target, read inside the lock. */
      const s = await tx.query<{ id: string; text: string; heading: string | null }>(
        `SELECT s.id, s.text, ms.heading
           FROM manuscript_draft_sections s
           LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
          WHERE s.id = $1 AND s.draft_id = $2`,
        [proposal.targetSectionId, proposal.draftId]);
      if (s.rows.length === 0) return refuse('section_not_found');

      /* 4 · The SAME projection the writer sees. ⛔ Not re-derived. */
      const split = splitStoredSection(s.rows[0].text, s.rows[0].heading);
      if (!split) return refuse('section_not_projectable');

      /* 5 · ⭐⭐ THE LAW. */
      const applied = applyExactlyOnce(
        split.body, proposal.expectedText, proposal.replacementText);
      if (!applied.ok) return refuse(applied.reason);

      /* 6 · THE EXISTING MUTATION, on THIS client. ⛔ Never the public
         `saveSection`, which would take a second pool connection and land the
         write outside this transaction — where a rollback could not undo it. */
      const saved = await saveSectionInTransaction(
        tx, proposal.workId, memberId, proposal.targetSectionId,
        applied.applied, proposal.baseVersion);
      if (saved.status !== 'saved') return refuse('write_failed');

      /* 7 · ⭐ THE DURABLE CLAIM — both columns, one statement, at the end.
         `mrp_acceptance_whole` makes any other order fail immediately, which is
         the constraint doing exactly the work it was written for. */
      const done = await tx.query<Row>(
        `UPDATE manuscript_revision_proposals
            SET accepted_at = now(), resulting_version = $3
          WHERE id = $1 AND member_id = $2 AND accepted_at IS NULL
        RETURNING ${COLUMNS}`,
        [proposalId, memberId, saved.version]);
      /* ⛔ Throw rather than return: a failure here must roll the mutation back,
         never leave a written manuscript with no record of who authorized it. */
      if (done.rows.length === 0) throw new Error('proposal acceptance could not be recorded');

      return { outcome: 'accepted' as const, proposal: hydrate(done.rows[0]) };
    });
  } catch {
    return refuse('write_failed');
  }
}

/* ⛔ `AcceptOutcome extends { outcome: 'refused'; reason: infer R } ? R : never`
   collapsed to `never`: the UNION does not extend that pattern as a whole, and
   a non-generic conditional does not distribute. The type was clever and wrong,
   and every refusal in this file failed to typecheck because of it. */
const refuse = (reason: ProposalRefusal) => ({ outcome: 'refused' as const, reason });
