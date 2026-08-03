-- Migration: reconciliation_evidence_contract
-- Constitutional function: CORRECTIVE — restores one invariant the accepted
--                          foundation claims but did not yet enforce.
-- Founder ruling: docs/architecture/COACH_FIELD_FOUNDATION_CANONICALITY_2026-08-02.md §8
--
--   Reconciliation metadata describes MACHINE EVIDENCE, not human explanation.
--
-- ─── LINEAGE — WHY A NEW FILE AND NOT AN EDIT ───────────────────────────────
-- This amends 20260802000002_practitioner_client_relationship.sql, which merged to
-- trunk as c0c8b0ba6 (#902). That file is NOT edited and must not be. The pre-merge
-- rule — "it never reached production, so amend in place" — is correct in a draft
-- lineage and does not survive merge:
--
--   · development environments that already applied it would diverge silently;
--   · the repository would stop describing what was actually applied;
--   · the drift-detection gap becomes actively harmful rather than merely absent.
--
-- ⚠️ On that last point, verified against the runner rather than its description:
-- scripts/run-sql-migrations.sh selects by FILENAME set-membership against
-- schema_migrations, and while it adds a `checksum` column ("for future
-- compatibility") it NEVER computes, writes or compares one. There is therefore no
-- mechanism anywhere that can distinguish
--
--     a migration changed intentionally   ⟺   a migration drifted accidentally
--
-- An in-place edit is not a safe correction nobody has applied yet. It is invisible
-- divergence, indistinguishable — by the only mechanism that could tell them apart —
-- from corruption. So every environment gets a visible transition instead:
--
--     000002 (historical truth, unchanged)  →  000004 (corrective amendment)
--
-- ─── WHAT THIS CORRECTS ─────────────────────────────────────────────────────
-- 000002 shipped practitioner_client_reconciliation with two columns that carry
-- evidence but were not constrained to it:
--
--   ambiguity_reason TEXT   unconstrained and uncommented, populated by a CASE that
--                           emits one of exactly four fixed English sentences. The
--                           column's TYPE permitted arbitrary human interpretation to
--                           enter a machine reconciliation record; only the current
--                           implementation kept it out. Type, not discipline, is what
--                           makes a boundary hold.
--
--   provenance JSONB        correctly commented as "the evidence the classification
--                           rests on", but with no closed key set, no prohibition on
--                           becoming a content surface, and no validation at the
--                           write boundary.
--
-- Neither is new architecture. This completes the architecture 000002 already claims,
-- by splitting what its schema conflated:
--     machine classification  →  a constrained code
--     human explanation       →  a separate future evidence surface, not this table.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════════
-- §0  PREREQUISITE
-- ════════════════════════════════════════════════════════════════════════════
-- The runner applies unrecorded files in filename order, so 000002 normally lands
-- first. Normally is not a guarantee (README convention 1), and a corrective
-- migration that silently no-ops against a missing table is worse than one that
-- stops. Surface, never assume.

DO $$
BEGIN
  IF to_regclass('public.practitioner_client_reconciliation') IS NULL THEN
    RAISE EXCEPTION
      'practitioner_client_reconciliation is missing. This migration corrects the reconciliation '
      'evidence contract established by 20260802000002_practitioner_client_relationship.sql. '
      'Apply that migration first.';
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- §1  AMENDMENT 1 — CONSTRAINED AMBIGUITY REPRESENTATION
-- ════════════════════════════════════════════════════════════════════════════
-- The vocabulary below is closed, and it is complete: the CASE in 000002 (L544-554)
-- has exactly four non-NULL branches and one ELSE NULL. Each branch is a statement
-- about counted evidence, which is why each maps cleanly onto a code:
--
--   > 1 member claimed an invitation from this row      multiple_claimed_invitations
--   > 0 competing live relationships share the email    competing_relationship_same_email
--   > 1 member account matches the email                multiple_member_email_matches
--   = 1 match, but that member never verified it        sole_match_email_unverified
--
-- NULL keeps its existing meaning: no ambiguity was detected. It is not a fifth code.
--
-- ⚠️ ambiguity is a SEPARATE AXIS from match_basis and is not derivable from it. A row
-- can be classified verified_invitation (invite = 1) while a competing relationship
-- carrying the same email still exists. Collapsing the two columns would destroy that
-- second signal, so the amendment constrains the axis rather than removing it.

ALTER TABLE practitioner_client_reconciliation
  ADD COLUMN IF NOT EXISTS ambiguity_code TEXT;

ALTER TABLE practitioner_client_reconciliation
  DROP CONSTRAINT IF EXISTS pcr_ambiguity_code_vocabulary;
ALTER TABLE practitioner_client_reconciliation
  ADD CONSTRAINT pcr_ambiguity_code_vocabulary CHECK (
    ambiguity_code IS NULL OR ambiguity_code IN (
      'multiple_claimed_invitations',
      'competing_relationship_same_email',
      'multiple_member_email_matches',
      'sole_match_email_unverified'
    )
  );

-- 1a. Transition existing rows. The four sentences are matched exactly, not by
-- pattern: a near-match is not the same statement and must not be assumed to be.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'practitioner_client_reconciliation'
       AND column_name = 'ambiguity_reason'
  ) THEN
    EXECUTE $upd$
      UPDATE practitioner_client_reconciliation
         SET ambiguity_code = CASE ambiguity_reason
           WHEN 'More than one member claimed an invitation issued from this relationship.'
             THEN 'multiple_claimed_invitations'
           WHEN 'Another live relationship for this practitioner carries the same invitation email.'
             THEN 'competing_relationship_same_email'
           WHEN 'The invitation email matches more than one member account.'
             THEN 'multiple_member_email_matches'
           WHEN 'The only matching member has not verified that email address.'
             THEN 'sole_match_email_unverified'
           ELSE NULL
         END
       WHERE ambiguity_reason IS NOT NULL
    $upd$;

    -- 1b. NO ARBITRARY HUMAN TEXT IS PRESERVED, and none is silently discarded
    -- either. Any value outside the four known sentences means something other than
    -- the shipped function wrote to this column — which is exactly the hazard the
    -- amendment exists to close, and a fact a migration must surface rather than
    -- destroy. Resolve the unmapped rows deliberately, then re-run.
    IF EXISTS (
      SELECT 1 FROM practitioner_client_reconciliation
       WHERE ambiguity_reason IS NOT NULL AND ambiguity_code IS NULL
    ) THEN
      RAISE EXCEPTION
        'practitioner_client_reconciliation.ambiguity_reason holds values outside the four '
        'sentences emitted by practitioner_client_reconcile(). Free human text in a machine '
        'reconciliation record cannot be mapped to a code and will not be dropped silently. '
        'Inspect: SELECT id, ambiguity_reason FROM practitioner_client_reconciliation '
        'WHERE ambiguity_reason IS NOT NULL AND ambiguity_code IS NULL;';
    END IF;
  END IF;
END $$;

-- 1c. Retire the unconstrained field. Dropping it — rather than leaving it deprecated
-- — is what makes the boundary unreachable by construction instead of merely
-- discouraged. The gate asserts no free-text column survives on this table.

ALTER TABLE practitioner_client_reconciliation
  DROP COLUMN IF EXISTS ambiguity_reason;

COMMENT ON COLUMN practitioner_client_reconciliation.ambiguity_code IS
  'WHICH counted evidence made this row ambiguous, from a closed vocabulary. NULL means no '
  'ambiguity was detected. A separate axis from match_basis — a row can be verified_invitation '
  'and still carry competing_relationship_same_email. This column states machine evidence and '
  'never human explanation: no free text, no narrative, no practitioner or reviewer commentary. '
  'A human account of a resolution belongs to a note surface, which is a different object with '
  'different consent and encryption obligations.';

-- ════════════════════════════════════════════════════════════════════════════
-- §2  AMENDMENT 2 — THE provenance CONTRACT, ENFORCED
-- ════════════════════════════════════════════════════════════════════════════
-- 000002's column comment already established aligned intent ("the evidence the
-- classification rests on"). Intent stated in a comment is not a contract. What was
-- missing, and is added here: a closed key set · an explicit prohibition on becoming
-- a content surface · validation at the write boundary.
--
-- provenance is the ONLY unrestricted JSONB in the foundation. That is a deliberate,
-- singular exception and the gate asserts it stays singular — an open JSONB is a
-- content surface with the type system switched off, and one is already one more than
-- this foundation would choose again.

-- 2a. It is an object. Not a scalar, not an array, not a JSON string carrying prose.
ALTER TABLE practitioner_client_reconciliation
  DROP CONSTRAINT IF EXISTS pcr_provenance_is_object;
ALTER TABLE practitioner_client_reconciliation
  ADD CONSTRAINT pcr_provenance_is_object CHECK (jsonb_typeof(provenance) = 'object');

-- 2b. THE CLOSED KEY SET. Subtracting the approved keys must leave nothing: any key
-- not named here is refused at write time. This is what forbids 'reason', 'notes',
-- 'comment' or any other free-text key from appearing later — not a convention a
-- future author has to remember, but a constraint that rejects the INSERT.
--
-- ⏳ normalized_email is included because it is what the merged function writes
-- (000002 L486). Its retention is UNRULED — see
-- docs/architecture/COACH_FIELD_PROVENANCE_DISCLOSURE_QUESTION_2026-08-02.md. This
-- migration deliberately neither strips it nor blesses it: removing it would decide a
-- question the founder reserved, and the correct sequence is to rule what provenance
-- may reveal, and to whom, BEFORE the schema follows.
ALTER TABLE practitioner_client_reconciliation
  DROP CONSTRAINT IF EXISTS pcr_provenance_closed_keys;
ALTER TABLE practitioner_client_reconciliation
  ADD CONSTRAINT pcr_provenance_closed_keys CHECK (
    provenance - ARRAY[
      'verified_email_matches',
      'any_email_matches',
      'claimed_invitations',
      'competing_relationships',
      'normalized_email'
    ]::text[] = '{}'::jsonb
  );

-- 2c. The counted evidence is counted. A number cannot carry a sentence, so this is
-- the type discipline the key set alone does not give: it closes the path where an
-- approved key is kept but its value quietly becomes prose.
ALTER TABLE practitioner_client_reconciliation
  DROP CONSTRAINT IF EXISTS pcr_provenance_counts_are_numeric;
ALTER TABLE practitioner_client_reconciliation
  ADD CONSTRAINT pcr_provenance_counts_are_numeric CHECK (
    jsonb_typeof(provenance -> 'verified_email_matches')  IN ('number', 'null')
    AND jsonb_typeof(provenance -> 'any_email_matches')       IN ('number', 'null')
    AND jsonb_typeof(provenance -> 'claimed_invitations')     IN ('number', 'null')
    AND jsonb_typeof(provenance -> 'competing_relationships') IN ('number', 'null')
  );

COMMENT ON COLUMN practitioner_client_reconciliation.provenance IS
  'The evidence the classification rests on. A CLOSED key set, enforced by '
  'pcr_provenance_closed_keys — writing any unlisted key is refused, not merely '
  'discouraged. Allowed: verified_email_matches · any_email_matches · claimed_invitations · '
  'competing_relationships (counts, numeric, enforced) · normalized_email (⏳ UNRULED, see '
  'COACH_FIELD_PROVENANCE_DISCLOSURE_QUESTION_2026-08-02.md). '
  'PROHIBITED: this column is not a content surface. No reason, notes, comment, summary or '
  'any other narrative key; no practitioner, reviewer or member expression. Adding a key here '
  'requires ruling what provenance may reveal and to whom — the same question its one '
  'person-identifying key is currently held open on.';

-- ════════════════════════════════════════════════════════════════════════════
-- §3  THE WRITER FOLLOWS THE SCHEMA
-- ════════════════════════════════════════════════════════════════════════════
-- Identical to 000002's function in every respect except the ambiguity axis, which
-- now emits codes. Reproduced in full because CREATE OR REPLACE FUNCTION has no
-- partial form — the classification logic, the two admissible auto-link bases, and
-- the M1 founder ruling they encode are unchanged and are NOT reopened here.

CREATE OR REPLACE FUNCTION practitioner_client_reconcile()
RETURNS TABLE (queued BIGINT, auto_linked BIGINT) AS $fn$
DECLARE
  n_queued BIGINT := 0;
  n_linked BIGINT := 0;
BEGIN

INSERT INTO practitioner_client_reconciliation
  (relationship_id, candidate_member_id, match_basis, auto_linkable, provenance, ambiguity_code)
SELECT
  pc.id,
  ev.candidate_member_id,
  ev.match_basis,
  ev.match_basis IN ('verified_invitation', 'verified_unique_email'),
  jsonb_build_object(
    'verified_email_matches', ev.verified_email_matches,
    'any_email_matches',      ev.any_email_matches,
    'claimed_invitations',    ev.claimed_invitations,
    'competing_relationships', ev.competing_relationships,
    'normalized_email',       pc.normalized_invitation_email
  ),
  ev.ambiguity_code
FROM practitioner_clients pc
CROSS JOIN LATERAL (
  WITH invite AS (
    SELECT ci.claimed_by_member_id AS member_id, count(*) OVER () AS n
    FROM client_invites ci
    WHERE ci.client_id = pc.id
      AND ci.claimed_at IS NOT NULL
      AND ci.claimed_by_member_id IS NOT NULL
  ),
  verified AS (
    SELECT m.id AS member_id, count(*) OVER () AS n
    FROM members m
    WHERE pc.normalized_invitation_email IS NOT NULL
      AND lower(btrim(m.email)) = pc.normalized_invitation_email
      AND m.email_verified IS TRUE
  ),
  anymatch AS (
    SELECT count(*) AS n
    FROM members m
    WHERE pc.normalized_invitation_email IS NOT NULL
      AND lower(btrim(m.email)) = pc.normalized_invitation_email
  ),
  competing AS (
    SELECT count(*) AS n
    FROM practitioner_clients other
    WHERE other.id <> pc.id
      AND other.practitioner_id = pc.practitioner_id
      AND other.normalized_invitation_email IS NOT NULL
      AND other.normalized_invitation_email = pc.normalized_invitation_email
      AND other.relationship_status <> 'ended'
  )
  SELECT
    (SELECT count(DISTINCT member_id) FROM invite)                       AS claimed_invitations,
    (SELECT coalesce(max(n), 0) FROM verified)                           AS verified_email_matches,
    (SELECT n FROM anymatch)                                             AS any_email_matches,
    (SELECT n FROM competing)                                            AS competing_relationships,
    CASE
      WHEN (SELECT count(DISTINCT member_id) FROM invite) = 1
        THEN (SELECT DISTINCT member_id FROM invite)
      WHEN (SELECT count(DISTINCT member_id) FROM invite) = 0
       AND (SELECT coalesce(max(n), 0) FROM verified) = 1
       AND (SELECT n FROM competing) = 0
        THEN (SELECT member_id FROM verified LIMIT 1)
      ELSE NULL
    END                                                                   AS candidate_member_id,
    CASE
      WHEN (SELECT count(DISTINCT member_id) FROM invite) > 1  THEN 'conflicting_invitation'
      WHEN (SELECT count(DISTINCT member_id) FROM invite) = 1  THEN 'verified_invitation'
      WHEN pc.normalized_invitation_email IS NULL              THEN 'missing_email'
      WHEN (SELECT n FROM anymatch) = 0                        THEN 'missing_member'
      WHEN (SELECT n FROM competing) > 0                       THEN 'ambiguous_multiple_relationships'
      WHEN (SELECT coalesce(max(n), 0) FROM verified) = 1      THEN 'verified_unique_email'
      WHEN (SELECT n FROM anymatch) > 1                        THEN 'ambiguous_multiple_members'
      ELSE 'manual_review_required'
    END                                                                   AS match_basis,
    -- Same four branches as 000002, same order, same conditions. Only the emitted
    -- representation changed: a code the schema constrains, not a sentence it cannot.
    CASE
      WHEN (SELECT count(DISTINCT member_id) FROM invite) > 1
        THEN 'multiple_claimed_invitations'
      WHEN (SELECT n FROM competing) > 0
        THEN 'competing_relationship_same_email'
      WHEN (SELECT n FROM anymatch) > 1
        THEN 'multiple_member_email_matches'
      WHEN (SELECT n FROM anymatch) = 1 AND (SELECT coalesce(max(n), 0) FROM verified) = 0
        THEN 'sole_match_email_unverified'
      ELSE NULL
    END                                                                   AS ambiguity_code
) ev
WHERE pc.member_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM practitioner_client_reconciliation r
    WHERE r.relationship_id = pc.id AND r.reconciliation_status = 'open'
  );

GET DIAGNOSTICS n_queued = ROW_COUNT;

-- Auto-link ONLY the two admissible bases. Everything else waits for a human.
-- Email similarity, display-name similarity and practitioner expectation are not
-- evidence. A wrong link exposes one person's developmental record to another.
UPDATE practitioner_clients pc
   SET member_id = r.candidate_member_id,
       linked_at = NOW()
  FROM practitioner_client_reconciliation r
 WHERE r.relationship_id = pc.id
   AND r.reconciliation_status = 'open'
   AND r.auto_linkable IS TRUE
   AND r.candidate_member_id IS NOT NULL
   AND pc.member_id IS NULL;

GET DIAGNOSTICS n_linked = ROW_COUNT;

UPDATE practitioner_client_reconciliation r
   SET reconciliation_status = 'auto_linked',
       resolved_at = NOW()
  FROM practitioner_clients pc
 WHERE r.relationship_id = pc.id
   AND r.reconciliation_status = 'open'
   AND r.auto_linkable IS TRUE
   AND pc.member_id IS NOT NULL
   AND pc.member_id = r.candidate_member_id;

queued := n_queued;
auto_linked := n_linked;
RETURN NEXT;
END;
$fn$ LANGUAGE plpgsql;

COMMENT ON FUNCTION practitioner_client_reconcile() IS
  'Classifies every unlinked practitioner-client relationship by the strength of its identity '
  'provenance, queues it, and auto-links ONLY verified_invitation and verified_unique_email '
  '(founder ruling M1, 2026-08-02). Ambiguity is recorded as a constrained code, never as prose '
  '(corrective amendment 20260802000004). Idempotent and re-runnable. Returns (queued, auto_linked).';

-- Deliberately NOT re-run here. 000002 already classified the legacy rows; this
-- migration corrects how the outcome is REPRESENTED and must not also change which
-- relationships are linked. A corrective amendment that quietly auto-links members
-- would be a state change hiding inside a schema change.

COMMIT;
