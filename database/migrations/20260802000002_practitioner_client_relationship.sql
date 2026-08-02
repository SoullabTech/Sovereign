-- Migration: practitioner_client_relationship
-- Constitutional function: STRUCTURAL — establishes the canonical bridge between the
--                          practitioner universe and the member universe.
-- Founder ruling: Kelly, 2026-08-02 (M1)
--
--   The person has one identity; the coaching relationship has its own bounded
--   record; each developmental process lives within that relationship; practitioner
--   and client see authorized views of the same process without being granted
--   identical sight.
--
-- ─── LINEAGE ────────────────────────────────────────────────────────────────
-- SUPERSEDES 20260802000001_coach_facilitator_field.sql, which is ruled a DESIGN
-- DONOR, NOT AN EXECUTABLE MIGRATION. That migration built a parallel
-- `coach_client_relationships` spine keyed on members(id) on both sides, and left
-- `practitioner_clients` untouched. Doing so would have reproduced the exact
-- fracture it was meant to repair: every existing practitioner-side record
-- (notes, sessions, protocol assignments, cohort membership) is keyed to
-- practitioner_clients.id and would have been orphaned from the new spine, and an
-- invited person with no account yet could not be represented at all.
--
-- The donor's downstream designs (programs, stages, processes, enrollments, stage
-- history, cohorts, focus, work items, publication boundary) are salvaged in the
-- migrations that follow this one, repointed at practitioner_clients(id).
--
-- ─── WHY THIS MIGRATION INTROSPECTS INSTEAD OF ASSUMING ─────────────────────
-- `practitioner_clients` has THREE competing CREATE TABLE IF NOT EXISTS definitions:
--   20260114000001_practitioner_themes      practitioner_id -> practitioners(id),
--                                           has member_id, email, status(5 values)
--   20260116000001_practitioner_portal      practitioner_id -> practitioners(id),
--                                           no member_id, email, status(4 values), tier
--   20260118_stellium_practitioner_layer    practitioner_id -> MEMBERS(id),
--                                           email NULLABLE, status(4 DIFFERENT values)
-- Whichever migrated first wins; the others silently no-op. The declared shape in
-- this repository is therefore NOT authoritative — not even for the target of the
-- practitioner_id foreign key. Per founder ruling this migration may rely on only
-- two columns existing:  practitioner_clients.id  and  practitioner_clients.practitioner_id.
-- Everything else is introspected and added or normalized defensively. Backfills
-- run through explicit conditional branches, never a COALESCE against an
-- identifier that may not exist (that would fail to parse, not fall through).

-- ─── §JOIN KEY — WHY THIS TABLE, AND NOT A NEW ONE, IS THE BRIDGE ───────────
-- Introspection of the live schema (2026-08-02) shows the relationship row is
-- ALREADY the de-facto universal join key, while the practitioner column is not:
--
--   client_id       -> practitioner_clients   in client_invites, practitioner_client_notes,
--                                             practitioner_sessions, studio_protocol_assignments
--   practitioner_id -> practitioners(id)      in practitioner_clients, practitioner_client_notes
--   practitioner_id -> members(id)            in client_invites, practitioner_sessions
--
-- Same column name, different referent. Service code must therefore resolve
-- practitioner identity THROUGH the relationship row and never by trusting a
-- column called practitioner_id. Building a parallel spine would have added a
-- fourth meaning to an already-overloaded name; evolving this table adds none.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════════
-- §0  SUPERSEDE THE DONOR
-- ════════════════════════════════════════════════════════════════════════════
-- The donor was applied to at least one development database. Its tables are
-- unauthorized and must not survive as a parallel live spine. They are dropped
-- ONLY if empty — a populated donor table means someone built on it, and that is
-- a fact a migration must surface rather than destroy. Never a silent deletion.

DO $$
DECLARE
  t TEXT;
  n BIGINT;
  populated TEXT[] := ARRAY[]::TEXT[];
  donor_tables TEXT[] := ARRAY[
    'coach_client_relationships','coach_program_definitions','coach_program_stages',
    'coach_cohorts','coach_cohort_memberships','coach_client_processes',
    'coach_program_enrollments','coach_enrollment_stage_history','coach_current_focus',
    'coach_position_share_consents','coach_position_shares','coach_authored_notes',
    'coach_note_publication_events','coach_sessions','coach_important_dates',
    'coach_work_items','coach_work_item_history','coach_resource_recommendations',
    'coach_follow_ups','coach_client_shared_items','coach_client_personal_notes',
    'coach_client_selected_focus'
  ];
BEGIN
  FOREACH t IN ARRAY donor_tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
      IF n > 0 THEN
        populated := populated || format('%s (%s rows)', t, n);
      END IF;
    END IF;
  END LOOP;

  IF array_length(populated, 1) > 0 THEN
    RAISE EXCEPTION
      'Donor tables from 20260802000001 contain data: %. That migration was never authorized. '
      'Preserve or migrate the data deliberately before re-running this migration; it will not '
      'drop a populated table.', array_to_string(populated, ', ');
  END IF;

  FOREACH t IN ARRAY donor_tables LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', t);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS coach_position_shares_no_rewrite() CASCADE;
DROP FUNCTION IF EXISTS coach_notes_publication_boundary() CASCADE;
DROP FUNCTION IF EXISTS coach_note_events_immutable() CASCADE;

-- ════════════════════════════════════════════════════════════════════════════
-- §1  practitioner_clients BECOMES THE CANONICAL RELATIONSHIP RECORD
-- ════════════════════════════════════════════════════════════════════════════
-- Its meaning from here on:
--     This practitioner has a bounded professional relationship with this member.
-- It is NOT the person. members.id remains the canonical identity of an
-- authenticated person; this row is the relationship, and it is the authorized
-- bridge between practitioner-side records and member-side developmental records.

ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS member_id UUID;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS invitation_email TEXT;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS relationship_status TEXT;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS relationship_started_at TIMESTAMPTZ;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS relationship_ended_at TIMESTAMPTZ;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS invitation_id UUID;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
-- The intended scope of a pending invitation. Program and cohort references are
-- added by the downstream migration; this discriminator exists now because the
-- pending-invitation uniqueness constraint below is keyed on it.
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS intended_scope TEXT;

-- normalized_invitation_email is DERIVED, never independently writable, so the
-- matching key cannot drift from the address it claims to normalize.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioner_clients' AND column_name = 'normalized_invitation_email'
  ) THEN
    ALTER TABLE practitioner_clients
      ADD COLUMN normalized_invitation_email TEXT
      GENERATED ALWAYS AS (NULLIF(lower(btrim(invitation_email)), '')) STORED;
  END IF;
END $$;

-- member_id must reference members(id). It may already exist (themes variant) with
-- the FK, or exist without one, or have just been added above.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'practitioner_clients'::regclass
      AND contype = 'f'
      AND conname = 'practitioner_clients_member_id_fkey'
  ) THEN
    ALTER TABLE practitioner_clients
      ADD CONSTRAINT practitioner_clients_member_id_fkey
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- §2  DEFENSIVE BACKFILL FROM WHATEVER LEGACY SHAPE IS ACTUALLY PRESENT
-- ════════════════════════════════════════════════════════════════════════════
-- Every branch is guarded by an information_schema check and executed through
-- format(), so a column that does not exist is never named in parsed SQL.

-- 2a. invitation_email  <-  legacy email column, whichever name it carries.
DO $$
DECLARE src TEXT;
BEGIN
  FOREACH src IN ARRAY ARRAY['email', 'client_email', 'portal_email'] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'practitioner_clients' AND column_name = src
    ) THEN
      EXECUTE format(
        'UPDATE practitioner_clients SET invitation_email = %I
           WHERE invitation_email IS NULL AND %I IS NOT NULL AND btrim(%I) <> %L',
        src, src, src, '');
    END IF;
  END LOOP;
END $$;

-- 2b. relationship_started_at  <-  legacy created_at, else now().
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioner_clients' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'UPDATE practitioner_clients SET relationship_started_at = created_at
               WHERE relationship_started_at IS NULL';
  END IF;
END $$;
UPDATE practitioner_clients SET relationship_started_at = NOW() WHERE relationship_started_at IS NULL;

-- 2c. updated_at  <-  legacy updated_at is already the same column when present;
--     only newly-added ones need seeding.
UPDATE practitioner_clients SET updated_at = relationship_started_at WHERE updated_at IS NULL;

-- 2d. relationship_status  <-  legacy status, mapped through EXPLICIT branches.
--     The three declared vocabularies do not agree, and 'invited' vs 'waitlist'
--     vs 'inactive' do not mean the same thing. Anything not positively
--     recognised becomes 'pending' and is queued for human reconciliation in §5
--     rather than being guessed into 'active'.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioner_clients' AND column_name = 'status'
  ) THEN
    EXECUTE $sql$
      UPDATE practitioner_clients SET relationship_status =
        CASE lower(btrim(status::TEXT))
          WHEN 'active'    THEN 'active'
          WHEN 'paused'    THEN 'paused'
          WHEN 'invited'   THEN 'pending'
          WHEN 'waitlist'  THEN 'pending'
          WHEN 'completed' THEN 'ended'
          WHEN 'archived'  THEN 'ended'
          WHEN 'inactive'  THEN 'ended'
          ELSE NULL
        END
      WHERE relationship_status IS NULL
    $sql$;
  END IF;
END $$;
UPDATE practitioner_clients SET relationship_status = 'pending' WHERE relationship_status IS NULL;

-- 2e. An ended relationship needs an end date; a live one must not carry one.
UPDATE practitioner_clients
   SET relationship_ended_at = COALESCE(relationship_ended_at, updated_at, NOW())
 WHERE relationship_status = 'ended' AND relationship_ended_at IS NULL;
UPDATE practitioner_clients
   SET relationship_ended_at = NULL
 WHERE relationship_status <> 'ended' AND relationship_ended_at IS NOT NULL;

-- 2f. linked_at for rows that already carry a member_id from the legacy schema.
UPDATE practitioner_clients
   SET linked_at = COALESCE(linked_at, relationship_started_at)
 WHERE member_id IS NOT NULL AND linked_at IS NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- §3  CONSTRAINTS
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE practitioner_clients ALTER COLUMN relationship_status SET DEFAULT 'pending';
ALTER TABLE practitioner_clients ALTER COLUMN relationship_status SET NOT NULL;
ALTER TABLE practitioner_clients ALTER COLUMN relationship_started_at SET DEFAULT NOW();
ALTER TABLE practitioner_clients ALTER COLUMN relationship_started_at SET NOT NULL;
ALTER TABLE practitioner_clients ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE practitioner_clients DROP CONSTRAINT IF EXISTS practitioner_clients_relationship_status_check;
ALTER TABLE practitioner_clients
  ADD CONSTRAINT practitioner_clients_relationship_status_check
  CHECK (relationship_status IN ('pending', 'active', 'paused', 'ended'));

-- Ending a relationship is dated; a live relationship carries no end date.
ALTER TABLE practitioner_clients DROP CONSTRAINT IF EXISTS practitioner_clients_ended_coherence;
ALTER TABLE practitioner_clients
  ADD CONSTRAINT practitioner_clients_ended_coherence
  CHECK ((relationship_status = 'ended') = (relationship_ended_at IS NOT NULL));

-- A linked relationship is dated as linked, and an unlinked one is not.
ALTER TABLE practitioner_clients DROP CONSTRAINT IF EXISTS practitioner_clients_link_coherence;
ALTER TABLE practitioner_clients
  ADD CONSTRAINT practitioner_clients_link_coherence
  CHECK ((member_id IS NULL) = (linked_at IS NULL));

-- A pending relationship must be reachable: it needs either an identified member
-- or an invitation address. Otherwise it is a row nobody can ever claim.
ALTER TABLE practitioner_clients DROP CONSTRAINT IF EXISTS practitioner_clients_pending_reachable;
ALTER TABLE practitioner_clients
  ADD CONSTRAINT practitioner_clients_pending_reachable
  CHECK (relationship_status <> 'pending'
         OR member_id IS NOT NULL
         OR normalized_invitation_email IS NOT NULL);

-- One ACTIVE relationship per practitioner + member. History is preserved: ended
-- and paused rows do not collide, so a client may return without overwriting the
-- record of the previous engagement.
DROP INDEX IF EXISTS uniq_practitioner_client_active;
CREATE UNIQUE INDEX uniq_practitioner_client_active
  ON practitioner_clients (practitioner_id, member_id)
  WHERE member_id IS NOT NULL AND relationship_status = 'active';

-- One PENDING invitation per practitioner + normalized email + intended scope.
-- Re-inviting the same person to the same thing must find the existing pending
-- row rather than mint a second one.
DROP INDEX IF EXISTS uniq_practitioner_client_pending_invitation;
CREATE UNIQUE INDEX uniq_practitioner_client_pending_invitation
  ON practitioner_clients (practitioner_id, normalized_invitation_email, COALESCE(intended_scope, 'general'))
  WHERE normalized_invitation_email IS NOT NULL AND relationship_status = 'pending';

-- The legacy UNIQUE (practitioner_id, email) forbade the same person from ever
-- appearing twice for one practitioner. That was a person-identity rule on a table
-- that is now a RELATIONSHIP record: it would make re-engagement impossible, since
-- ending a relationship and starting a new one is exactly two rows sharing an
-- invitation address. Email is invitation and matching data, not permanent
-- identity (founder ruling M1). Uniqueness now lives on the two partial indexes
-- above, which bind ACTIVE relationships and PENDING invitations only.
DO $$
DECLARE c TEXT;
BEGIN
  FOREACH c IN ARRAY ARRAY[
    'unique_practitioner_client_email',
    'practitioner_clients_practitioner_id_email_key'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_constraint
               WHERE conrelid = 'practitioner_clients'::regclass AND conname = c) THEN
      EXECUTE format('ALTER TABLE practitioner_clients DROP CONSTRAINT %I', c);
    END IF;
  END LOOP;
END $$;

-- Legacy status is left in place untouched and is NO LONGER AUTHORITATIVE. It is
-- deliberately NOT mirrored: its vocabulary differs across the three declared
-- shapes ('completed' / 'inactive' / 'waitlist' do not appear in all of them), and
-- any automatic mapping would have to invent a meaning the source never carried.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'practitioner_clients' AND column_name = 'status') THEN
    EXECUTE $c$COMMENT ON COLUMN practitioner_clients.status IS
      'DEPRECATED, non-authoritative. relationship_status is the authority for the state of the '
      'relationship. Retained only so legacy readers do not break; not kept in sync, because the '
      'three historical vocabularies disagree and no honest mapping exists.'$c$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_practitioner_clients_member
  ON practitioner_clients (member_id, relationship_status) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_practitioner
  ON practitioner_clients (practitioner_id, relationship_status);

-- A linked relationship cannot silently change to another member, and cannot be
-- silently unlinked. Re-pointing a live professional relationship at a different
-- person is not an edit; it is a new relationship.
CREATE OR REPLACE FUNCTION practitioner_client_link_is_permanent()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.member_id IS NOT NULL AND NEW.member_id IS DISTINCT FROM OLD.member_id THEN
    RAISE EXCEPTION
      'practitioner_clients.member_id is write-once (relationship %): a linked relationship '
      'cannot be re-pointed at another member, and cannot be unlinked. End this relationship '
      'and create a new one.', OLD.id;
  END IF;
  IF NEW.member_id IS NOT NULL AND OLD.member_id IS NULL AND NEW.linked_at IS NULL THEN
    NEW.linked_at := NOW();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS practitioner_client_link_guard ON practitioner_clients;
CREATE TRIGGER practitioner_client_link_guard
  BEFORE UPDATE ON practitioner_clients
  FOR EACH ROW EXECUTE FUNCTION practitioner_client_link_is_permanent();

COMMENT ON TABLE practitioner_clients IS
  'THE CANONICAL PRACTITIONER-CLIENT RELATIONSHIP RECORD (founder ruling M1, 2026-08-02). '
  'This row is the bounded professional relationship, NOT the person: members.id remains the '
  'canonical identity of an authenticated person. member_id is nullable ONLY while an invitation '
  'or pre-account relationship is pending, and is write-once thereafter. Practitioner-side records '
  '(sessions, notes, protocol assignments, cohort membership) continue to reference this id; '
  'member-side developmental records continue to reference members.id; this row is the authorized '
  'bridge between them. Legacy per-person columns (name, birth data, tags, tier) are retained '
  'untouched — they are relationship-scoped intake data, not identity.';
COMMENT ON COLUMN practitioner_clients.member_id IS
  'The identified member, once known. NULL only while pending. Write-once: enforced by '
  'practitioner_client_link_guard.';
COMMENT ON COLUMN practitioner_clients.normalized_invitation_email IS
  'DERIVED from invitation_email — invitation and matching data, never permanent identity. '
  'Generated so it cannot drift from the address it normalizes.';
COMMENT ON COLUMN practitioner_clients.relationship_status IS
  'pending | active | paused | ended. Describes the RELATIONSHIP, never the person. Ending a '
  'relationship revokes present access without deleting historical practice records.';

-- ════════════════════════════════════════════════════════════════════════════
-- §4  INVITATION PROVENANCE
-- ════════════════════════════════════════════════════════════════════════════
-- client_invites records that an invitation was issued from a relationship row,
-- but not who claimed it. Without that, an accepted invitation cannot serve as
-- strong linkage provenance. Added defensively — the table may not exist.

DO $$
BEGIN
  IF to_regclass('public.client_invites') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'client_invites' AND column_name = 'claimed_by_member_id'
    ) THEN
      ALTER TABLE client_invites ADD COLUMN claimed_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL;
      COMMENT ON COLUMN client_invites.claimed_by_member_id IS
        'Which member actually claimed this invitation. The provenance that makes verified_invitation '
        'linkage admissible — an issued invitation alone proves intent, not identity.';
    END IF;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- §5  LIVE-SHAPE RECONCILIATION QUEUE
-- ════════════════════════════════════════════════════════════════════════════
-- The declared schema is not authoritative and legacy rows were never modelled as
-- relationships. Every unlinked legacy row is classified by the strength of its
-- provenance and recorded here. Ambiguous rows STAY UNLINKED. Email similarity,
-- display-name similarity, and practitioner expectation are never sufficient.

CREATE TABLE IF NOT EXISTS practitioner_client_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  candidate_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  match_basis TEXT NOT NULL
    CHECK (match_basis IN (
      'verified_invitation',
      'verified_unique_email',
      'ambiguous_multiple_members',
      'ambiguous_multiple_relationships',
      'missing_member',
      'missing_email',
      'conflicting_invitation',
      'manual_review_required'
    )),
  auto_linkable BOOLEAN NOT NULL DEFAULT FALSE,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  ambiguity_reason TEXT,
  reconciliation_status TEXT NOT NULL DEFAULT 'open'
    CHECK (reconciliation_status IN ('open', 'auto_linked', 'resolved_linked', 'resolved_no_link', 'dismissed')),
  resolved_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((reconciliation_status = 'open') = (resolved_at IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pcr_open_per_relationship
  ON practitioner_client_reconciliation (relationship_id)
  WHERE reconciliation_status = 'open';
CREATE INDEX IF NOT EXISTS idx_pcr_open
  ON practitioner_client_reconciliation (match_basis, created_at)
  WHERE reconciliation_status = 'open';

COMMENT ON TABLE practitioner_client_reconciliation IS
  'One row per legacy relationship whose member identity could not be established with strong '
  'provenance. Auto-linking is permitted ONLY for verified_invitation and verified_unique_email '
  '(founder ruling M1, 2026-08-02). Everything else waits for a human. A wrong link here would '
  'expose one person''s developmental record to another; guessing is not an available option.';
COMMENT ON COLUMN practitioner_client_reconciliation.provenance IS
  'The evidence the classification rests on — candidate counts, invitation ids, whether the email '
  'was verified. Recorded so a human resolving the row can see WHY it was queued.';

-- 5a. THE RECONCILIATION MECHANISM.
-- A FUNCTION, not a one-shot migration statement: relationships keep arriving from
-- legacy paths, and the same classification must stay re-runnable — and testable —
-- long after this migration has run. Re-running is safe; it considers only rows
-- with no member_id and no open queue entry.
--
-- client_invites is a hard dependency: it is named in parsed SQL, so a runtime
-- to_regclass guard would not save us. It is created by 20260122_client_invites.sql,
-- which orders before this migration.
DO $$
BEGIN
  IF to_regclass('public.client_invites') IS NULL THEN
    RAISE EXCEPTION
      'client_invites is missing. Invitation provenance is the strongest admissible linkage basis '
      'and this migration will not classify relationships without it. Apply 20260122_client_invites.sql first.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION practitioner_client_reconcile()
RETURNS TABLE (queued BIGINT, auto_linked BIGINT) AS $fn$
DECLARE
  n_queued BIGINT := 0;
  n_linked BIGINT := 0;
BEGIN

INSERT INTO practitioner_client_reconciliation
  (relationship_id, candidate_member_id, match_basis, auto_linkable, provenance, ambiguity_reason)
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
  ev.ambiguity_reason
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
    CASE
      WHEN (SELECT count(DISTINCT member_id) FROM invite) > 1
        THEN 'More than one member claimed an invitation issued from this relationship.'
      WHEN (SELECT n FROM competing) > 0
        THEN 'Another live relationship for this practitioner carries the same invitation email.'
      WHEN (SELECT n FROM anymatch) > 1
        THEN 'The invitation email matches more than one member account.'
      WHEN (SELECT n FROM anymatch) = 1 AND (SELECT coalesce(max(n), 0) FROM verified) = 0
        THEN 'The only matching member has not verified that email address.'
      ELSE NULL
    END                                                                   AS ambiguity_reason
) ev
WHERE pc.member_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM practitioner_client_reconciliation r
    WHERE r.relationship_id = pc.id AND r.reconciliation_status = 'open'
  );

GET DIAGNOSTICS n_queued = ROW_COUNT;

-- 5b. Auto-link ONLY the two admissible bases. Everything else waits for a human.
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
  '(founder ruling M1, 2026-08-02). Idempotent and re-runnable. Returns (queued, auto_linked).';

-- Run once now, over whatever legacy rows exist.
SELECT * FROM practitioner_client_reconcile();

COMMIT;
