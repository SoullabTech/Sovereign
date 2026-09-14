/**
 * STEP 2 · AUTHORIZATION PERSISTENCE — the member's authorizing act.
 *
 * ⭐⭐ THE GOVERNING SENTENCE OF THIS LANE:
 *
 *     The member chooses the formulation.
 *     The server establishes the Work state.
 *     Execution consumes both and invents neither.
 *
 * ── ⛔⛔ WHY THE CALLER MAY NOT SUPPLY THE WORK READING ────────────────────
 *
 * The pure `ResolvedGuardProof` is unforgeable AFTER issuance. But
 * `resolveGuard()` takes a `WorkStateReading`, so this would still be
 * architecturally false:
 *
 *     request body ──▶ { version, expectedText, sectionText } ──▶ resolveGuard
 *                                                                     │
 *                                              a "proof" that faithfully proves
 *                                              our own function received a
 *                                              FABRICATED reading
 *
 * ⭐ So the authorizing seam reads the Work ITSELF. Its entire external input is:
 *
 *     member identity · proposal chain id · exact proposal version id
 *
 * ⛔ NOT baseVersion · expectedText · replacementText · ExecutionBinding ·
 * ResolvedGuardProof · WorkStateReading. Those are derived or authoritative
 * facts, never caller assertions.
 *
 * ── ⛔ THIS IS NOT `proposeRevision()` UNDER A NEW NAME ────────────────────
 *
 * That function combined exact replacement wording WITH an executable binding,
 * and set an authority flag. Those are acts performed by different parties at
 * different times: MAIA or the writer AUTHORS wording (`appendAuthoredVersion`);
 * only the member AUTHORIZES. ⛔ No compatibility name is preserved.
 *
 * ⛔ AND THERE IS NO `execution_authority` QUESTION ANYWHERE IN THIS FILE. The
 * existence of the row IS the permission.
 */

import { query, transaction } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import {
  authorize, resolveGuard,
  type RevisionAuthorization, type WorkStateReading,
} from './contract';
import type { ProposalChain, ProposalVersion } from '@/lib/manuscript/proposalChain/contract';

/* ══════════════════════════════════════════════════════════════════════════
   ROWS — the only place a column becomes a field.
   ══════════════════════════════════════════════════════════════════════════ */

interface AuthRow {
  id: string; member_id: string;
  proposal_chain_id: string; proposal_version_id: string;
  work_id: string; draft_id: string; base_version: number | string;
  target_section_id: string; expected_text: string; operation: 'replace_exact_text';
  authorized_at: Date; accepted_at: Date | null; resulting_version: number | string | null;
}

export const AUTH_COLUMNS = `id, member_id, proposal_chain_id, proposal_version_id,
  work_id, draft_id, base_version, target_section_id, expected_text, operation,
  authorized_at, accepted_at, resulting_version`;

export const hydrateAuthorizationRow = (r: AuthRow): RevisionAuthorization => {
  const identity = {
    id: r.id, memberId: r.member_id,
    proposalChainId: r.proposal_chain_id, proposalVersionId: r.proposal_version_id,
    guard: Object.freeze({
      workId: r.work_id, draftId: r.draft_id, baseVersion: Number(r.base_version),
      targetSectionId: r.target_section_id, expectedText: r.expected_text,
      operation: r.operation,
    }),
    authorizedAt: r.authorized_at.toISOString(),
  };
  /* ⭐ The receipt is rebuilt as ONE OF THE TWO LAWFUL SHAPES, never as two
     independent fields. `mra_receipt_whole` makes the half state unwritable;
     this makes it unrepresentable on the way back out. */
  return r.accepted_at === null
    ? { ...identity, acceptedAt: null, resultingVersion: null }
    : { ...identity, acceptedAt: r.accepted_at.toISOString(),
        resultingVersion: Number(r.resulting_version) };
};

/* ══════════════════════════════════════════════════════════════════════════
   REFUSALS
   ══════════════════════════════════════════════════════════════════════════ */

export type AuthorizeRefusal =
  /** ⛔ No such chain, or not this member's. Deliberately indistinguishable. */
  | 'chain_unknown'
  /** The named version is not in that chain, or does not exist. */
  | 'version_unknown'
  /** The Work has no working draft, or none this member owns. */
  | 'work_unreadable'
  /** The target section is gone, or this cut cannot project its body. */
  | 'section_unreadable'
  /** ⭐ The characters this chain was opened against are gone. */
  | 'expected_text_absent'
  /** ⭐⭐ They occur more than once — the change names nothing exact. */
  | 'expected_text_ambiguous'
  | 'malformed';

export type AuthorizeVersionResult =
  | { readonly ok: true; readonly authorization: RevisionAuthorization }
  | { readonly ok: false; readonly reason: AuthorizeRefusal };

const no = (reason: AuthorizeRefusal): AuthorizeVersionResult => ({ ok: false, reason });

/* ══════════════════════════════════════════════════════════════════════════
   THE ACT
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐⭐ THE MEMBER AUTHORIZES ONE EXACT AUTHORED FORMULATION.
 *
 *     member-owned chain lookup        `member_id` inside the predicate
 *     exact requested version lookup   ⛔ never head / current / latest
 *     authoritative current Work read  ⭐ by THIS function, from the database
 *     resolveGuard()                   mints the proof from that reading
 *     authorize()                      the pure act
 *     persist                          one row
 *
 * ⛔ THIS CHANGES NOT ONE BYTE OF THE MANUSCRIPT. It records a permission. The
 * only `UPDATE` in this module is none.
 *
 * ⛔ AND NO BLANKET `catch`. A database that cannot answer must say so — the
 * `catch { return refuse('write_failed') }` of the retired store turned
 * unavailability into a domain refusal, which is the shape of the open S3
 * `unreachable` finding.
 */
export async function authorizeVersion(
  memberId: string, chainId: string, versionId: string,
): Promise<AuthorizeVersionResult> {
  if (!memberId || !chainId || !versionId) return no('malformed');

  /* 1 · ⭐ THE CHAIN, PROVEN TO BE THIS MEMBER'S IN THE SAME STATEMENT.
         A foreign chain returns zero rows and is reported exactly as an absent
         one — a distinguishable response would let a caller enumerate other
         members' chains by their refusal shapes alone. */
  const c = await query<{
    id: string; member_id: string; work_id: string; draft_id: string;
    base_version: number | string; target_section_id: string;
    expected_text: string; decision_chain_id: string | null; opened_at: Date;
  }>(
    `SELECT id, member_id, work_id, draft_id, base_version, target_section_id,
            expected_text, decision_chain_id, opened_at
       FROM proposal_chains WHERE id = $1 AND member_id = $2`,
    [chainId, memberId]);
  if (c.rows.length === 0) return no('chain_unknown');
  const row = c.rows[0];
  const chain: ProposalChain = {
    id: row.id, memberId: row.member_id,
    locus: {
      workId: row.work_id, draftId: row.draft_id,
      baseVersion: Number(row.base_version),
      targetSectionId: row.target_section_id, expectedText: row.expected_text,
    },
    ...(row.decision_chain_id !== null
      ? { governedBy: { decisionChainId: row.decision_chain_id } } : {}),
    openedAt: row.opened_at.toISOString(),
  };

  /* 2 · ⛔⛔ THE EXACT VERSION THE MEMBER NAMED. There is no ORDER BY, no LIMIT
         1, and no head lookup anywhere in this function. A writer may authorize
         MAIA's v2 after writing a v4 they abandoned, and the record must be
         able to say so. */
  const v = await query<{
    id: string; chain_id: string; author: 'maia' | 'member'; formulation: string;
    rationale: string | null; supersedes: string | null; authored_at: Date;
  }>(
    `SELECT id, chain_id, author, formulation, rationale, supersedes, authored_at
       FROM proposal_versions WHERE id = $1 AND chain_id = $2`,
    [versionId, chainId]);
  if (v.rows.length === 0) return no('version_unknown');
  const vr = v.rows[0];
  const version: ProposalVersion = {
    id: vr.id, chainId: vr.chain_id, supersedes: vr.supersedes,
    replacementText: vr.formulation,
    ...(vr.rationale !== null ? { rationale: vr.rationale } : {}),
    author: vr.author, authoredAt: vr.authored_at.toISOString(),
  };

  /* 3 · ⭐⭐ THE AUTHORITATIVE WORK READ — BY THE SERVER, FROM THE DATABASE.
         ⛔ The caller supplied no version, no expected text and no section
         body. `base_version` below comes from the DRAFT as it is right now, not
         from `chain.locus.baseVersion`, which is where this proposal STARTED. */
  const reading = await readWorkAtTarget(memberId, chain);
  if (!reading.ok) return no(reading.reason);

  /* 4 · The proof is minted from that reading and from nothing else. */
  const guard = resolveGuard(chain, reading.reading);
  if (!guard.ok) {
    return no(guard.reason === 'expected_text_absent' ? 'expected_text_absent'
      : guard.reason === 'expected_text_ambiguous' ? 'expected_text_ambiguous'
      : 'malformed');
  }

  /* 5 · The pure act. */
  const authorized = authorize({
    id: '00000000-0000-0000-0000-000000000000',   // replaced by the server-minted id
    memberId, chain, versions: [version], versionId: version.id,
    proof: guard.proof, authorizedAt: new Date().toISOString(),
  });
  if (!authorized.ok) return no('malformed');
  const g = authorized.authorization.guard;

  /* 6 · ⛔ NO REPLACEMENT WORDING IS PERSISTED. The row names the version; the
         wording stays on the version, immutably, where its author put it. */
  const ins = await query<AuthRow>(
    `INSERT INTO manuscript_revision_authorizations
       (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
        base_version, target_section_id, expected_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${AUTH_COLUMNS}`,
    [memberId, chain.id, version.id, g.workId, g.draftId, g.baseVersion,
      g.targetSectionId, g.expectedText]);
  return { ok: true, authorization: hydrateAuthorizationRow(ins.rows[0]) };
}

/** ⛔ Scoped to the member. Another's authorization reads as absent. */
export async function readAuthorization(
  memberId: string, authorizationId: string,
): Promise<RevisionAuthorization | null> {
  const r = await query<AuthRow>(
    `SELECT ${AUTH_COLUMNS} FROM manuscript_revision_authorizations
      WHERE id = $1 AND member_id = $2`, [authorizationId, memberId]);
  return r.rows[0] ? hydrateAuthorizationRow(r.rows[0]) : null;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE AUTHORITATIVE WORK READ
   ══════════════════════════════════════════════════════════════════════════ */

type ReadResult =
  | { ok: true; reading: WorkStateReading }
  | { ok: false; reason: 'work_unreadable' | 'section_unreadable' };

/**
 * ⭐ What the Work says NOW at this chain's target.
 *
 * ⛔ Ownership is proven by the draft's own `(manuscript_id, member_id)`, inside
 * the read — not by a separate check a later edit could drop.
 *
 * ⛔ AND IT PROJECTS THROUGH `splitStoredSection`, the same projection the
 * writing surface uses. `manuscript_draft_sections.text` is the STORED
 * representation and begins with the heading prefix; reading the column
 * directly would shift every offset by the heading's length, silently, and only
 * for sections that have one. FOCUS-W3 cost this programme two days on exactly
 * that substitution.
 */
async function readWorkAtTarget(
  memberId: string, chain: ProposalChain,
): Promise<ReadResult> {
  const d = await query<{ id: string; version: string }>(
    `SELECT id, version FROM manuscript_working_drafts
      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`,
    [chain.locus.draftId, chain.locus.workId, memberId]);
  if (d.rows.length === 0) return { ok: false, reason: 'work_unreadable' };

  const s = await query<{ id: string; text: string; heading: string | null }>(
    `SELECT s.id, s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.id = $1 AND s.draft_id = $2`,
    [chain.locus.targetSectionId, chain.locus.draftId]);
  if (s.rows.length === 0) return { ok: false, reason: 'section_unreadable' };
  const split = splitStoredSection(s.rows[0].text, s.rows[0].heading);
  if (!split) return { ok: false, reason: 'section_unreadable' };

  return {
    ok: true,
    reading: {
      workId: chain.locus.workId,
      draftId: chain.locus.draftId,
      /* ⭐ THE DRAFT'S VERSION, READ NOW. ⛔ Never the chain's baseVersion. */
      version: Number(d.rows[0].version),
      sectionId: chain.locus.targetSectionId,
      textAtTarget: split.body,
    },
  };
}

export { transaction };
