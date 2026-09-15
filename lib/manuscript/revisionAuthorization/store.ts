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

import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import {
  authorize, hydrateAuthorization, resolveGuard,
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

/**
 * ⭐⭐ THERE IS ONE DURABLE AUTHORIZATION HYDRATOR, AND IT IS NOT THIS FUNCTION.
 *
 * ⚠️ FOUNDER REVIEW, 2026-09-14, BLOCKER. The first cut implemented a SECOND
 * hydrator here and asserted a `RevisionAuthorization` directly, bypassing the
 * contract's runtime law. It did not preserve the refusals:
 *
 *     accepted_at non-null · resulting_version null
 *       → contract REFUSES · this turned `null` into `0` via `Number(null)`
 *
 *     accepted_at null · resulting_version 42
 *       → contract REFUSES · this returned an UNSPENT authorization and
 *         silently discarded the contradictory receipt
 *
 * ⛔ The CHECK makes both unrepresentable TODAY. That is not the point: we
 * deliberately established three laws — type · runtime hydration · database —
 * and the adapter was bypassing the middle one. A validation implementation
 * that exists in two places is one that can drift.
 *
 * ⭐ So this translates snake_case columns into the plain stored shape and
 * NOTHING ELSE. The contract decides whether that shape is an authorization.
 *
 * ⛔ AND A ROW THAT FAILS IT THROWS. Corrupted or unanswerable persistence is
 * not a member-facing domain refusal — a durable record we cannot read
 * truthfully must not be quietly rendered as something we can.
 */
export const hydrateAuthorizationRow = (r: AuthRow): RevisionAuthorization => {
  const plain = {
    id: r.id, memberId: r.member_id,
    proposalChainId: r.proposal_chain_id, proposalVersionId: r.proposal_version_id,
    guard: {
      workId: r.work_id, draftId: r.draft_id, baseVersion: Number(r.base_version),
      targetSectionId: r.target_section_id, expectedText: r.expected_text,
      operation: r.operation,
    },
    authorizedAt: r.authorized_at.toISOString(),
    acceptedAt: r.accepted_at === null ? null : r.accepted_at.toISOString(),
    /* ⛔ `null` stays `null`. It is NOT coerced through `Number()`, which is how
       a half receipt became `0` in the first cut. */
    resultingVersion: r.resulting_version === null ? null : Number(r.resulting_version),
  };
  const hydrated = hydrateAuthorization(plain);
  if (!hydrated) {
    throw new Error(
      `authorization ${r.id} could not be read truthfully from its durable row`);
  }
  return hydrated;
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

  return transaction(async (tx: TransactionClient) => {
    /* 1 · ⭐ THE CHAIN, PROVEN TO BE THIS MEMBER'S IN THE SAME STATEMENT, and
           collapsed FIRST. A foreign chain returns zero rows and is reported
           exactly as an absent one — a distinguishable response would let a
           caller enumerate other members' chains by their refusal shapes. */
    const c = await tx.query<{
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

    /* 2 · ⛔⛔ THE EXACT VERSION THE MEMBER NAMED. No ORDER BY, no LIMIT 1, no
           head lookup anywhere in this function. A writer may authorize MAIA's
           v2 after writing a v4 they abandoned, and the record must say so. */
    const v = await tx.query<{
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

    /* 3 · 4 · ⭐⭐ ONE COHERENT WORK STATE, HELD UNTIL THE PERMISSION EXISTS.
           ⚠️ FOUNDER REVIEW, BLOCKER. The first cut issued separate pool
           queries: draft version from statement A, section body from statement
           B, INSERT in statement C, with nothing joining them. Under READ
           COMMITTED a concurrent save committing between A and B produces

               WorkStateReading { version: 41, textAtTarget: <state from 42> }

           — a Work state that NEVER EXISTED. The server was reading the Work,
           and still synthesizing one state out of two committed moments, which
           violates this lane's sentence as surely as trusting the caller would.

           ⭐ THE LOCK IS NOT AUTHORIZATION AND NOT A MANUSCRIPT WRITE. It
           establishes that the state the permission records was a real coherent
           state, and remains so until the record exists.

               A proof of a current Work state must be minted from ONE current
               Work state — never a collage of reads. */
    const reading = await readWorkAtTarget(tx, memberId, chain);
    if (!reading.ok) return no(reading.reason);

    /* 5 · The proof is minted from that reading and from nothing else. */
    const guard = resolveGuard(chain, reading.reading);
    if (!guard.ok) {
      return no(guard.reason === 'expected_text_absent' ? 'expected_text_absent'
        : guard.reason === 'expected_text_ambiguous' ? 'expected_text_ambiguous'
        : 'malformed');
    }

    /* ══════════════════════════════════════════════════════════════════════
       6 · ⭐⭐ THE SAME PERMISSION, RECOVERED — NOT A SECOND ONE MINTED.

       Founder ruling, CUTOVER-01B.0:

           For one member, one exact proposal version, and one current bound
           Work version, there is at most one unspent authorization. Repeating
           that authorizing act returns that same durable permission.

       ⛔ WHY IT IS HERE AND NOT EARLIER. Searching by chain + version BEFORE
       reading the Work would let a stale unspent authorization at v41 defeat a
       legitimate new one at v42 — the permission would be recovered from a Work
       state that is no longer the Work. The natural identity is only complete
       once `guard.baseVersion` exists, so the lookup cannot precede the guard.

       ⛔ AND NO CALLER-SUPPLIED IDEMPOTENCY TOKEN. A browser-minted key would be
       a second assertion channel into a seam whose whole discipline is that the
       caller asserts nothing. The permission already HAS a natural identity;
       we look it up rather than letting anyone name it.

       ⭐ THE SERIALIZER IS THE DRAFT LOCK WE ALREADY HOLD. `readWorkAtTarget`
       took `FOR UPDATE` on the draft row at step 3 and has not released it, so
       a concurrent authorizing call is queued behind it and sees this row
       committed. ⛔ NO LOCK IS TAKEN ON THE AUTHORIZATION ROW: execution locks
       authorization → draft, and adding the reverse order here would build a
       lock-order cycle to solve a race the draft lock already settles.

       ⭐ The unique index is the floor, not the mechanism. If it ever rejects a
       write, that is a defect report, not a control path — a caller must never
       meet a raw 23505 where a permission was owed.
       ══════════════════════════════════════════════════════════════════════ */
    const existing = await tx.query<AuthRow>(
      `SELECT ${AUTH_COLUMNS} FROM manuscript_revision_authorizations
        WHERE member_id = $1 AND proposal_chain_id = $2
          AND proposal_version_id = $3 AND base_version = $4
          AND accepted_at IS NULL`,
      /* ⭐ THE WORK VERSION THIS BINDING IS AGAINST. ⛔ Read from the coherent
         reading that minted the proof — `resolveGuard` sets
         `binding.baseVersion = reading.version` and nothing else — because the
         proof deliberately exposes no `.binding`, and reaching for one would be
         attacking the unforgeability this contract exists to hold.
         ⛔ And NEVER `chain.locus.baseVersion`: that is the chain's historical
         base, not this permission's current binding. */
      [memberId, chain.id, version.id, reading.reading.version]);
    if (existing.rows.length > 0) {
      /* ⭐ Through the canonical hydrator, like every other durable read — and
         returned WHOLE: same id, same authorizedAt. ⛔ `authorize()` is NOT
         called again: the act already happened, and re-performing it would mint
         an identity the record does not carry. */
      return { ok: true as const, authorization: hydrateAuthorizationRow(existing.rows[0]) };
    }

    /* 7 · ⭐⭐ ONE IDENTITY AND ONE TIME, MINTED BEFORE THE ACT.
           ⚠️ FOUNDER REVIEW, 2026-09-14. The first cut passed a provisional
           all-zero id and `new Date()` into `authorize()`, then inserted
           NEITHER — letting `gen_random_uuid()` and `now()` supply their own.
           So the object the pure act said was created WAS NOT the object
           persisted:

               pure authorization id  ≠  durable authorization id
               pure authorizedAt      ≠  durable authorizedAt

           The guard travelled faithfully and these were silently replaced,
           which is the Step 1 adapter rule again: persistence may MOVE a proven
           fact across the boundary; it may not SUBSTITUTE a different one.

           ⭐ Minted from PostgreSQL inside this transaction, so the clock is the
           database's — the same clock every neighbouring row is stamped by —
           and both values are used in the act AND in the INSERT. */
    const minted = await tx.query<{ id: string; at: Date }>(
      `SELECT gen_random_uuid() AS id, now() AS at`);
    const mintedId = minted.rows[0].id;
    const mintedAt = minted.rows[0].at.toISOString();

    const authorized = authorize({
      id: mintedId,
      memberId, chain, versions: [version], versionId: version.id,
      proof: guard.proof, authorizedAt: mintedAt,
    });
    if (!authorized.ok) return no('malformed');
    const g = authorized.authorization.guard;

    /* 8 · ⛔ NO REPLACEMENT WORDING IS PERSISTED. The row names the version; the
           wording stays on the version, immutably, where its author put it.
           ⭐ On the SAME client, inside the draft lock. */
    const ins = await tx.query<AuthRow>(
      `INSERT INTO manuscript_revision_authorizations
         (id, member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
          base_version, target_section_id, expected_text, operation, authorized_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${AUTH_COLUMNS}`,
      /* ⭐ `g.operation` is PERSISTED, not left to the column default.
         ⚠️ Founder merge-checklist item: the pure act determines the operation,
         and the adapter was letting a SECOND source (the DB default) supply the
         same value. The fidelity guard below made that safe — it would throw if
         they disagreed — but safety by agreement between two sources is not the
         same as one source. The binding fact travels whole. */
      [mintedId, memberId, chain.id, version.id, g.workId, g.draftId, g.baseVersion,
        g.targetSectionId, g.expectedText, g.operation, mintedAt]);
    const durable = hydrateAuthorizationRow(ins.rows[0]);

    /* ⭐⭐ AND THE TWO MUST BE THE SAME AUTHORIZATION, NOT MERELY
       EQUIVALENT-LOOKING FACTS. If any field the pure act determined differs
       from what came back, the boundary substituted something, and a
       substitution that nobody notices is exactly the failure this check
       exists for. ⛔ It THROWS: a persistence layer that cannot round-trip the
       act it just performed is not in a state to report a domain outcome. */
    if (JSON.stringify(durable) !== JSON.stringify(authorized.authorization)) {
      throw new Error(
        `authorization ${mintedId} was not persisted as the act that created it`);
    }
    return { ok: true as const, authorization: durable };
  });
  /* ⛔ NO BLANKET `catch`. A database that cannot answer must say so — the
     `catch { return refuse('write_failed') }` of the retired store turned
     unavailability into a domain refusal, the shape of the open S3 finding. */
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
  tx: TransactionClient, memberId: string, chain: ProposalChain,
): Promise<ReadResult> {
  /* ⭐ FOR UPDATE. The draft row is held from here until the authorization
     exists, so the version below and the section body beneath it are ONE
     committed state and cannot drift apart underneath the proof. */
  const d = await tx.query<{ id: string; version: string }>(
    `SELECT id, version FROM manuscript_working_drafts
      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3 FOR UPDATE`,
    [chain.locus.draftId, chain.locus.workId, memberId]);
  if (d.rows.length === 0) return { ok: false, reason: 'work_unreadable' };

  const s = await tx.query<{ id: string; text: string; heading: string | null }>(
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

/* ⚠️ `export { transaction }` stood here with no consumer. ⛔ A domain store
   exposes ACTS, not its database machinery — re-exporting the transaction
   primitive invites a caller to assemble an authorization out of parts. */
