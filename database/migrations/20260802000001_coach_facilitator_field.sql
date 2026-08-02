-- Migration: coach_facilitator_field
-- Constitutional function: STRUCTURAL — the practitioner field and the client home as
--                          two views of ONE developmental process.
-- Spec:  docs/specs/developmental-environment/COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md
-- Audit: docs/architecture/NOW_WHAT_DEVELOPMENTAL_HOME_AUDIT_2026-08-02.md
-- Rulings applied: Kelly, 2026-08-02 (C3 → option ii · D-NW-2 → isolate · bounded StageHistory)
--
-- ─── WHY A NEW NAMESPACE ─────────────────────────────────────────────────────
-- `practitioner_clients` has THREE competing CREATE TABLE IF NOT EXISTS definitions in
-- the repo (20260114000001, 20260116000001, 20260118_stellium): whichever migrates first
-- wins and the others silently no-op, so its shape is not knowable FROM THE REPO. It is
-- knowable from the RUNNING DATABASE, and that is what §1 normalizes against.
-- Per founder ruling 2026-08-02, `practitioner_clients.id` is the canonical relationship
-- key; the coach_* tables are process records hanging off it, NOT a second spine.
--
-- ─── WHAT THIS MIGRATION REVERSES (named, not slipped in) ────────────────────
-- 20260712000001 encoded: "Enrollment is declared by arrival, not administered by
-- roster… There is no enrollment table, no roster… departure hard-deletes."
-- The founder has deliberately reversed that for the coaching practice: Larry
-- administers enrollment, and StageHistory preserves where a client has been.
-- The reversal is BOUNDED (spec §16.1 + the retention rules encoded below):
--   · history records a bounded coaching process, never a behavioral dossier
--   · NO passive telemetry (browsing, hesitation, inactivity, abandonment)
--   · former/completed/paused describe the PROCESS, not the person
--   · no predictive scoring, attrition labelling, engagement ranking
--   · retention basis is modelled SEPARATELY from process status
-- `field_program_positions` is untouched and keeps its own member-sovereign rules.
--
-- ─── WHAT THIS MIGRATION DOES NOT TOUCH ──────────────────────────────────────
-- practitioner_client_notes / practitioner_client_notes_continuity  (PRs #888/#889/#890)
-- sessions.notes                                                    (plaintext PHI, unruled)
-- Both are deliberately isolated. See §RECONCILIATION.
--
-- Idempotent per migration-ledger discipline.

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. RELATIONSHIP — ADDITIVE NORMALIZATION OF THE EXISTING `practitioner_clients`
-- ═════════════════════════════════════════════════════════════════════════════
-- FOUNDER RULING 2026-08-02: `practitioner_clients.id` IS the canonical relationship
-- key. An earlier draft of this migration created a parallel `coach_client_relationships`
-- table; that was the rejected parallel-spine design and has been removed. The three
-- competing legacy DDLs are a reason for DEFENSIVE NORMALIZATION, not for a second
-- canonical relationship identity. An adapter seam may absorb live-shape differences;
-- it may not create two identities for the same relationship.
--
-- The live shape (verified against the running database, not inferred from the repo):
--   practitioner_clients.id             UUID PK          ← the canonical relationship key
--   practitioner_clients.practitioner_id UUID NOT NULL   → practitioners(id)
--   practitioner_clients.member_id      UUID NULL        → members(id) ON DELETE SET NULL
--   practitioner_clients.status         invited|active|paused|completed|archived
--   practitioners.member_id             UUID NULL        → members(id)
--
-- Both sides therefore already bridge to `members`:
--   practitioner: practitioner_clients.practitioner_id → practitioners.member_id → members.id
--   client:       practitioner_clients.member_id → members.id
--
-- PRE-ACCOUNT RELATIONSHIPS ARE PRESERVED BY CONSTRUCTION: `member_id` is nullable and
-- `name`/`email` are NOT NULL, so a relationship invited but not yet claimed keeps its
-- row, its identity and its history. Nothing below requires member_id to be present.
--
-- Everything added here is ADDITIVE. No legacy column is dropped, retyped, or
-- reinterpreted, and no legacy row is rewritten.

ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS field_slug VARCHAR(64);
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS began_on DATE;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS ended_on DATE;

-- Retention is modelled SEPARATELY from status (founder ruling): a completed
-- relationship may still have a lawful basis to retain process records, and a lapsed
-- basis must never be inferred from status alone. Legacy rows default to
-- 'unreviewed' — NOT to an assertion that a basis exists.
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS retention_basis TEXT;
ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS retention_reviewed_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_clients_retention_basis_check') THEN
    ALTER TABLE practitioner_clients ADD CONSTRAINT practitioner_clients_retention_basis_check
      CHECK (retention_basis IS NULL OR retention_basis IN
        ('unreviewed','active_engagement','continuity_of_care','legal_obligation','client_request','expired'));
  END IF;
END $$;

COMMENT ON COLUMN practitioner_clients.retention_basis IS
  'Why records are still held. Deliberately a SEPARATE axis from status so "completed" never '
  'silently implies "retain forever" and "archived" never silently implies "delete". '
  'NULL = never reviewed; absence of a basis is not a basis.';
COMMENT ON COLUMN practitioner_clients.field_slug IS
  'The practice field this relationship lives in (joins practice_fields.field_slug). Carries the '
  'invitation authorization context. NULL on legacy rows — see coach_relationship_reconciliation.';

CREATE INDEX IF NOT EXISTS idx_pc_member_status ON practitioner_clients(member_id, status)
  WHERE member_id IS NOT NULL;

-- ── Reconciliation records for ambiguous legacy rows ─────────────────────────
-- Legacy rows predate this model and may lack a field_slug, lack a member link, or have
-- been written by any of the three competing DDLs. They are LEFT IN PLACE and flagged
-- here rather than guessed at. Nothing reads a legacy row as authorized until reconciled.
CREATE TABLE IF NOT EXISTS coach_relationship_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  reason TEXT NOT NULL
    CHECK (reason IN ('no_member_link','no_field_slug','unknown_legacy_shape','duplicate_candidate')),
  detail TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by_member_id UUID REFERENCES members(id),
  UNIQUE (practitioner_client_id, reason)
);

COMMENT ON TABLE coach_relationship_reconciliation IS
  'Ambiguous legacy practitioner_clients rows, flagged for human resolution. Created rather than '
  'guessed: a row whose semantics are unverified must not be silently adopted into the coach field. '
  'Legacy rows already keyed correctly to practitioner_clients.id are left untouched and unflagged.';

-- Flag existing ambiguity. Idempotent; adds no rows on a clean database.
INSERT INTO coach_relationship_reconciliation (practitioner_client_id, reason, detail)
SELECT id, 'no_member_link', 'member_id IS NULL: relationship invited but not yet claimed, or legacy row predating the bridge'
  FROM practitioner_clients WHERE member_id IS NULL
ON CONFLICT (practitioner_client_id, reason) DO NOTHING;

INSERT INTO coach_relationship_reconciliation (practitioner_client_id, reason, detail)
SELECT id, 'no_field_slug', 'field_slug IS NULL: no practice-field authorization context recorded'
  FROM practitioner_clients WHERE field_slug IS NULL
ON CONFLICT (practitioner_client_id, reason) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. PROGRAM DEFINITIONS — reusable structure Larry authors once
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_program_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  field_slug VARCHAR(64),

  name TEXT NOT NULL,
  description TEXT,
  -- Language shown to the client vs. guidance only Larry sees. Distinct on purpose.
  client_facing_language TEXT,
  practitioner_guidance   TEXT,

  kind TEXT NOT NULL DEFAULT 'coaching'
    CHECK (kind IN ('coaching','training','workshop','course','retreat','open_ended')),
  cohort_applicable BOOLEAN NOT NULL DEFAULT FALSE,

  state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active','archived')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cpd_owner ON coach_program_definitions(owner_member_id, state);

COMMENT ON TABLE coach_program_definitions IS
  'Practitioner-authored program template. Provides structure while allowing per-client adaptation. '
  'Holds NO member data.';

-- Ordered stages. `position` orders; `label` is the practitioner''s verbatim language.
-- Sequence is OPTIONAL: an open-ended engagement has zero stages and that is valid.
CREATE TABLE IF NOT EXISTS coach_program_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_definition_id UUID NOT NULL REFERENCES coach_program_definitions(id) ON DELETE CASCADE,

  position INT NOT NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'stage'
    CHECK (kind IN ('stage','phase','module','week','session','milestone')),
  description TEXT,
  client_facing_language TEXT,

  -- Defaults the practitioner may adapt per client at enrolment time.
  default_practice   TEXT,
  default_assignment TEXT,
  default_resource_ids UUID[] NOT NULL DEFAULT '{}',
  expected_offset_days INT,      -- for deriving expected important dates

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (program_definition_id, position)
);

CREATE INDEX IF NOT EXISTS idx_cps_program ON coach_program_stages(program_definition_id, position);

COMMENT ON COLUMN coach_program_stages.default_resource_ids IS
  'Refs into library_sources. The compose path RE-CHECKS ratification at read time — a reference '
  'to unratified material composes as nothing (mirrors field_program_lessons.material_ids).';

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. COHORTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  program_definition_id UUID REFERENCES coach_program_definitions(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  starts_on DATE,
  ends_on   DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_owner ON coach_cohorts(owner_member_id, status);

CREATE TABLE IF NOT EXISTS coach_cohort_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES coach_cohorts(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  joined_on DATE NOT NULL DEFAULT CURRENT_DATE,
  left_on   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cohort_id, relationship_id)
);

CREATE INDEX IF NOT EXISTS idx_ccm_cohort       ON coach_cohort_memberships(cohort_id) WHERE left_on IS NULL;
CREATE INDEX IF NOT EXISTS idx_ccm_relationship ON coach_cohort_memberships(relationship_id);

COMMENT ON TABLE coach_cohort_memberships IS
  'Cohort membership. Cohort-WIDE material is addressed to the cohort; nothing here grants any member '
  'read access to another member''s notes, conversations, homework responses, practitioner observations, '
  'or private process information (spec §14 — enforced in the service layer, which has no cross-member read).';

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. CLIENT PROCESS — the load-bearing object (spec §2)
-- ═════════════════════════════════════════════════════════════════════════════
-- Binds person + practitioner + program-or-engagement + position + continuity.
-- A process need NOT have a program: individual coaching with no named program is
-- first-class (program_definition_id NULL). Multiple concurrent processes are the
-- norm, not the exception — nothing here flattens them into one "current program".

CREATE TABLE IF NOT EXISTS coach_client_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  program_definition_id UUID REFERENCES coach_program_definitions(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,

  -- Title for an engagement that has no program definition.
  title TEXT,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','completed','former')),

  started_on DATE NOT NULL DEFAULT CURRENT_DATE,
  target_completion_on DATE,
  ended_on DATE,

  -- AXIS 1 — FORMAL PROGRAM POSITION (program/practitioner authored; Larry reads directly).
  current_stage_id UUID REFERENCES coach_program_stages(id) ON DELETE SET NULL,
  -- Free-text position for engagements without a fixed sequence.
  current_position_label TEXT,

  goals_intentions TEXT,
  completion_note  TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A process must be identifiable: either it has a program, or it names itself.
  CHECK (program_definition_id IS NOT NULL OR title IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_ccp_relationship ON coach_client_processes(relationship_id, status);
CREATE INDEX IF NOT EXISTS idx_ccp_cohort       ON coach_client_processes(cohort_id) WHERE cohort_id IS NOT NULL;

COMMENT ON TABLE coach_client_processes IS
  'THE load-bearing object: binds person, practitioner, program-or-engagement, position, commitments, '
  'sessions, dates and continuity — without reducing the client to a profile or forcing every coaching '
  'relationship into a predefined program. Multiple concurrent processes per relationship are expected.';

-- ── Enrollment: the reversal, made explicit and auditable ────────────────────
CREATE TABLE IF NOT EXISTS coach_program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES coach_client_processes(id) ON DELETE CASCADE,
  program_definition_id UUID NOT NULL REFERENCES coach_program_definitions(id) ON DELETE RESTRICT,

  enrolled_by_member_id UUID NOT NULL REFERENCES members(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  status TEXT NOT NULL DEFAULT 'enrolled'
    CHECK (status IN ('enrolled','paused','completed','withdrawn')),
  -- Access revocation is IMMEDIATE and explicit (founder ruling): a terminated
  -- enrollment must revoke present access the moment it terminates.
  access_revoked_at TIMESTAMPTZ,

  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cpe_process ON coach_program_enrollments(process_id, status);

COMMENT ON COLUMN coach_program_enrollments.access_revoked_at IS
  'Set in the SAME transaction that moves status to withdrawn/completed where access should end. '
  'Read authorization checks this column, never status alone — "terminated enrollment revokes present '
  'access immediately" (founder ruling 2026-08-02).';

-- ── StageHistory: bounded process history, NOT behavioural telemetry ─────────
CREATE TABLE IF NOT EXISTS coach_enrollment_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES coach_client_processes(id) ON DELETE CASCADE,

  stage_id UUID REFERENCES coach_program_stages(id) ON DELETE SET NULL,
  stage_label TEXT NOT NULL,          -- snapshot: history survives stage renaming/deletion
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at  TIMESTAMPTZ,
  changed_by_member_id UUID NOT NULL REFERENCES members(id),
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cesh_process ON coach_enrollment_stage_history(process_id, entered_at DESC);

COMMENT ON TABLE coach_enrollment_stage_history IS
  'Bounded record of where a client has been within a coaching process. Changing the current stage '
  'appends here and NEVER rewrites prior rows. '
  'PROHIBITED by construction and by review: passive behavioural telemetry (browsing, hesitation, '
  'inactivity, abandoned exploration), predictive scoring, attrition labelling, engagement ranking, '
  'inferred resistance. This table holds practitioner-authored process facts ONLY.';

-- Append-only: history must not be silently rewritten when a client advances.
CREATE OR REPLACE FUNCTION coach_stage_history_no_rewrite()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'coach_enrollment_stage_history is append-only: DELETE is not permitted';
  END IF;
  -- Only closing an open interval is allowed; the recorded past is immutable.
  IF NEW.process_id   IS DISTINCT FROM OLD.process_id
     OR NEW.stage_label IS DISTINCT FROM OLD.stage_label
     OR NEW.entered_at  IS DISTINCT FROM OLD.entered_at
     OR NEW.changed_by_member_id IS DISTINCT FROM OLD.changed_by_member_id
     OR OLD.exited_at IS NOT NULL THEN
    RAISE EXCEPTION 'coach_enrollment_stage_history is append-only: only exited_at may be set, once';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_stage_history_append_only ON coach_enrollment_stage_history;
CREATE TRIGGER coach_stage_history_append_only
  BEFORE UPDATE OR DELETE ON coach_enrollment_stage_history
  FOR EACH ROW EXECUTE FUNCTION coach_stage_history_no_rewrite();

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. THE FOUR AXES — kept structurally distinct (spec §4, founder table)
-- ═════════════════════════════════════════════════════════════════════════════
--   Axis 1  Formal program position     → coach_client_processes.current_stage_id  (Larry: direct)
--   Axis 2  Practitioner observation    → coach_authored_notes purpose=private_observation
--                                                                                 (Larry: direct, private unless published)
--   Axis 3  Client-declared position    → field_program_positions (UNTOUCHED)
--                                         + coach_position_shares (Larry: ONLY via explicit member act)
--   Axis 4  Current practical focus     → coach_current_focus     (authored by either, source recorded)

CREATE TABLE IF NOT EXISTS coach_current_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES coach_client_processes(id) ON DELETE CASCADE,

  focus TEXT NOT NULL,
  -- WHO authored this focus is a first-class fact, never inferred from who typed it.
  authored_by TEXT NOT NULL CHECK (authored_by IN ('practitioner','client','jointly_recorded')),
  author_member_id UUID NOT NULL REFERENCES members(id),
  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),

  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ccf_process ON coach_current_focus(process_id, effective_from DESC);

COMMENT ON TABLE coach_current_focus IS
  'Axis 4 — the current practical focus. May be authored by the client, the practitioner, or jointly. '
  'authored_by + visibility travel WITH the row so no view can present a practitioner focus as the '
  'client''s own words, or vice versa.';

-- ── Axis 3: consent-based sharing of the client-declared position ────────────
-- Founder ruling C3 (option ii), verbatim intent:
--   "A practitioner may not read a member's self-declared program position merely
--    because the practitioner administers the program. The member may explicitly
--    share that declaration with the practitioner, item by item or as an ongoing
--    surface preference."
-- `field_program_positions` gains NO practitioner-keyed read. Sharing produces a
-- SEPARATE, member-authored record. The prohibition is narrowed, not repealed.

CREATE TABLE IF NOT EXISTS coach_position_share_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  practitioner_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  field_slug   VARCHAR(64) NOT NULL,
  program_slug VARCHAR(64) NOT NULL DEFAULT 'general',

  -- DEFAULT OFF. Ongoing sharing applies FORWARD ONLY — see the trigger note below.
  mode TEXT NOT NULL DEFAULT 'off' CHECK (mode IN ('off','ongoing')),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (client_member_id, practitioner_member_id, field_slug, program_slug)
);

COMMENT ON TABLE coach_position_share_consents IS
  'Member-authored standing preference for sharing their DECLARED position with one practitioner. '
  'Default off. Turning it on shares declarations made or updated FROM effective_from ONWARD — it never '
  'retroactively exposes earlier private declarations (founder ruling C3). Turning it off stops future '
  'sharing WITHOUT deleting records already shared. Sharing a position is NOT permission for broader '
  'Field access: no other read is keyed off this row.';

-- Each actually-shared declaration, preserved verbatim. Append-only.
CREATE TABLE IF NOT EXISTS coach_position_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  practitioner_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  field_slug   VARCHAR(64) NOT NULL,
  program_slug VARCHAR(64) NOT NULL DEFAULT 'general',

  -- The client's EXACT wording at the moment of sharing. Snapshot, never a live join:
  -- a later private edit must not silently change what was shared.
  declared_position TEXT NOT NULL,
  -- Carried from field_program_positions.stated_by so Larry always sees that this is
  -- client-declared, never practitioner-assessed.
  stated_by TEXT NOT NULL CHECK (stated_by IN ('member_confirmed','member_stated','practitioner_seeded')),
  declared_at TIMESTAMPTZ,

  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_origin TEXT NOT NULL CHECK (share_origin IN ('item','ongoing')),
  -- Withdrawal hides from FUTURE display without erasing the historical fact of sharing.
  withdrawn_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cposs_pair
  ON coach_position_shares(practitioner_member_id, client_member_id, shared_at DESC);

COMMENT ON TABLE coach_position_shares IS
  'One row per declaration the client explicitly shared. declared_position is a VERBATIM SNAPSHOT — '
  'preserving the client''s exact wording, who authored it and when. Always rendered to the practitioner '
  'as client-declared, never as practitioner assessment.';

CREATE OR REPLACE FUNCTION coach_position_shares_no_rewrite()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'coach_position_shares is append-only: DELETE is not permitted (withdraw instead)';
  END IF;
  IF NEW.declared_position IS DISTINCT FROM OLD.declared_position
     OR NEW.client_member_id IS DISTINCT FROM OLD.client_member_id
     OR NEW.practitioner_member_id IS DISTINCT FROM OLD.practitioner_member_id
     OR NEW.shared_at IS DISTINCT FROM OLD.shared_at
     OR NEW.stated_by IS DISTINCT FROM OLD.stated_by THEN
    RAISE EXCEPTION 'coach_position_shares is append-only: only withdrawn_at may change';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_position_shares_append_only ON coach_position_shares;
CREATE TRIGGER coach_position_shares_append_only
  BEFORE UPDATE OR DELETE ON coach_position_shares
  FOR EACH ROW EXECUTE FUNCTION coach_position_shares_no_rewrite();

-- ═════════════════════════════════════════════════════════════════════════════
-- 6. PRACTITIONER-AUTHORED NOTES — one entity, purpose + visibility (founder ruling)
-- ═════════════════════════════════════════════════════════════════════════════
-- "The template or presentation is a VIEW. The visibility is a GOVERNING PROPERTY
--  of the record. Those are different concerns."
-- One neutral entity; a private observation and a note for the client may use
-- different forms, but they are not different ontological entities.

CREATE TABLE IF NOT EXISTS coach_authored_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  session_id UUID,                     -- coach_sessions(id); FK added after §7
  author_practitioner_id UUID NOT NULL REFERENCES members(id),

  title TEXT,
  body  TEXT NOT NULL,

  purpose TEXT NOT NULL DEFAULT 'private_observation'
    CHECK (purpose IN ('private_observation','session_preparation','follow_up','client_guidance','administrative')),

  -- DEFAULT PRIVATE. Only an explicit publication act may change this — enforced
  -- structurally by the trigger below, not by a guard clause in application code.
  visibility TEXT NOT NULL DEFAULT 'practitioner_private'
    CHECK (visibility IN ('practitioner_private','client_visible')),

  published_at TIMESTAMPTZ,
  -- Withdrawal removes from FUTURE client display without rewriting the historical
  -- fact that it was previously shared.
  withdrawn_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,

  -- A client-visible note must carry its publication time. Cannot be visible "by accident".
  CHECK (visibility = 'practitioner_private' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_can_relationship ON coach_authored_notes(relationship_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_can_client_visible
  ON coach_authored_notes(relationship_id, published_at DESC)
  WHERE visibility = 'client_visible' AND withdrawn_at IS NULL AND archived_at IS NULL;

COMMENT ON TABLE coach_authored_notes IS
  'ONE practitioner-authored note entity with explicit purpose + visibility (founder ruling 2026-08-02). '
  'Template/presentation is a VIEW; visibility is a GOVERNING PROPERTY. '
  'Deliberately NOT built on practitioner_client_notes (#888/#889/#890 — unverified) — see §RECONCILIATION.';

-- ── THE PUBLICATION BOUNDARY, enforced structurally ─────────────────────────
-- "A practitioner-private note must not become client-visible through an ordinary
--  edit of the visibility field."
-- An ordinary UPDATE cannot publish. Publication requires the transaction to declare
-- itself: SET LOCAL app.coach_note_publication = 'on'. That flag is set ONLY by the
-- explicit publish path, which also writes an audit row. This makes accidental
-- publication — via a default, a bulk edit, or a reused component — structurally
-- impossible rather than merely discouraged.
CREATE OR REPLACE FUNCTION coach_notes_publication_boundary()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.visibility = 'practitioner_private' AND NEW.visibility = 'client_visible' THEN
    IF current_setting('app.coach_note_publication', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION
        'Publishing a note requires the explicit publication act (Share with client), not a visibility edit';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_notes_publication_gate ON coach_authored_notes;
CREATE TRIGGER coach_notes_publication_gate
  BEFORE UPDATE ON coach_authored_notes
  FOR EACH ROW EXECUTE FUNCTION coach_notes_publication_boundary();

-- Append-only audit of every publication / update-shared / withdrawal act.
CREATE TABLE IF NOT EXISTS coach_note_publication_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES coach_authored_notes(id) ON DELETE CASCADE,
  actor_member_id UUID NOT NULL REFERENCES members(id),
  action TEXT NOT NULL CHECK (action IN ('published','updated_shared','withdrawn')),
  -- What the client could see as a result of this act.
  body_snapshot TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnpe_note ON coach_note_publication_events(note_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION coach_note_events_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'coach_note_publication_events is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_note_events_append_only ON coach_note_publication_events;
CREATE TRIGGER coach_note_events_append_only
  BEFORE UPDATE OR DELETE ON coach_note_publication_events
  FOR EACH ROW EXECUTE FUNCTION coach_note_events_immutable();

COMMENT ON TABLE coach_note_publication_events IS
  'Append-only audit: who published/updated/withdrew what, and when, with a snapshot of what the client '
  'could then see. Withdrawal stops future display; it never erases the fact that sharing occurred.';

-- ═════════════════════════════════════════════════════════════════════════════
-- 7. SESSIONS · IMPORTANT DATES
-- ═════════════════════════════════════════════════════════════════════════════
-- New namespace: the legacy `sessions` table carries plaintext PHI in `sessions.notes`
-- which remains UNRULED. Nothing here reads or writes it (§RECONCILIATION).

CREATE TABLE IF NOT EXISTS coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  -- Not every session belongs to a formal program (spec §9).
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  cohort_id  UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,

  scheduled_for TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('tentative','confirmed','completed','cancelled','missed')),

  -- Stage AT THE TIME of the session. Snapshot: advancing later must NOT retroactively
  -- change a historical session's stage (spec §9).
  stage_label_at_time TEXT,

  -- Reconciliation seam for the existing calendar integration. No duplicate events:
  -- a synced event carries its external id and is matched on it.
  external_calendar_event_id TEXT,
  external_calendar_source TEXT CHECK (external_calendar_source IS NULL OR external_calendar_source IN ('google','microsoft','manual')),

  location_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (external_calendar_source, external_calendar_event_id)
);

CREATE INDEX IF NOT EXISTS idx_cs_relationship ON coach_sessions(relationship_id, scheduled_for DESC);
CREATE INDEX IF NOT EXISTS idx_cs_upcoming     ON coach_sessions(scheduled_for) WHERE status IN ('tentative','confirmed');

COMMENT ON COLUMN coach_sessions.stage_label_at_time IS
  'Snapshot of the client''s stage when this session occurred. Never recomputed — advancing a client '
  'later must not rewrite the history of a past session (spec §9).';

ALTER TABLE coach_authored_notes
  DROP CONSTRAINT IF EXISTS coach_authored_notes_session_fk;
ALTER TABLE coach_authored_notes
  ADD CONSTRAINT coach_authored_notes_session_fk
  FOREIGN KEY (session_id) REFERENCES coach_sessions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS coach_important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  cohort_id  UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,

  label TEXT NOT NULL,
  -- Dates shown to clients must distinguish their KIND (spec §12).
  kind TEXT NOT NULL
    CHECK (kind IN ('confirmed_session','suggested_date','assignment_due','program_milestone','personal_reminder','cohort_event')),
  occurs_on TIMESTAMPTZ NOT NULL,

  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  created_by_member_id UUID NOT NULL REFERENCES members(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cid_relationship ON coach_important_dates(relationship_id, occurs_on);

-- ═════════════════════════════════════════════════════════════════════════════
-- 8. WORK ITEMS — homework · practice · commitment, distinct meanings preserved
-- ═════════════════════════════════════════════════════════════════════════════
-- One table, but the three MEANINGS are preserved and enforced (spec §13):
--   homework   — requested/assigned; may have a due date; may have completion
--   practice   — repeated/lived with over time; may have NO completion state
--   commitment — the client agreed or chose it; preserves WHO ARTICULATED IT
-- CHECK constraints below make a mis-shaped row impossible rather than merely wrong.

CREATE TABLE IF NOT EXISTS coach_work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES coach_sessions(id) ON DELETE SET NULL,
  cohort_id  UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,

  kind TEXT NOT NULL CHECK (kind IN ('homework','practice','commitment')),

  title TEXT NOT NULL,
  detail TEXT,

  -- Creator = who typed it. Articulated_by = whose intention it is. Different facts.
  created_by_member_id UUID NOT NULL REFERENCES members(id),
  articulated_by TEXT NOT NULL DEFAULT 'practitioner'
    CHECK (articulated_by IN ('client','practitioner','jointly')),
  source TEXT NOT NULL DEFAULT 'individual'
    CHECK (source IN ('individual','program_default','cohort_wide')),

  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),

  due_on TIMESTAMPTZ,
  duration_note TEXT,                  -- practices live in duration, not deadlines

  state TEXT NOT NULL DEFAULT 'open'
    CHECK (state IN ('open','acknowledged','completed','released')),
  completed_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A practice has no deadline: it is lived with, not due.
  CHECK (kind <> 'practice' OR due_on IS NULL),
  -- A commitment must record whose commitment it is; 'practitioner' alone is not a commitment.
  CHECK (kind <> 'commitment' OR articulated_by IN ('client','jointly'))
);

CREATE INDEX IF NOT EXISTS idx_cwi_relationship ON coach_work_items(relationship_id, kind, state);
CREATE INDEX IF NOT EXISTS idx_cwi_due          ON coach_work_items(due_on) WHERE state = 'open' AND due_on IS NOT NULL;

COMMENT ON TABLE coach_work_items IS
  'Homework, practice and commitment share a table but NOT a meaning. CHECK constraints hold the '
  'distinctions: a practice cannot carry a due date; a commitment must be articulated by the client '
  '(or jointly). Completion tracking is never punitive or gamified — "released" exists so letting '
  'something go is a first-class outcome, not a failure state.';

-- Material changes are recorded; nothing about a client''s work is silently rewritten.
CREATE TABLE IF NOT EXISTS coach_work_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID NOT NULL REFERENCES coach_work_items(id) ON DELETE CASCADE,
  changed_by_member_id UUID NOT NULL REFERENCES members(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cwih_item ON coach_work_item_history(work_item_id, occurred_at DESC);

-- ═════════════════════════════════════════════════════════════════════════════
-- 9. RESOURCES · FOLLOW-UPS · CLIENT-SHARED ITEMS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_resource_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  cohort_id  UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,

  -- Ratified practitioner material, or an external link. Ratification is RE-CHECKED at read.
  library_source_id UUID REFERENCES library_sources(id) ON DELETE SET NULL,
  external_url TEXT,
  label TEXT NOT NULL,
  note TEXT,

  recommended_by_member_id UUID NOT NULL REFERENCES members(id),
  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (library_source_id IS NOT NULL OR external_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_crr_relationship ON coach_resource_recommendations(relationship_id, created_at DESC);

-- What Larry owes the client, and what needs revisiting next session.
CREATE TABLE IF NOT EXISTS coach_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES coach_sessions(id) ON DELETE SET NULL,

  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'practitioner_todo'
    CHECK (kind IN ('practitioner_todo','carry_to_next_session','awaiting_client')),
  -- Follow-ups are practitioner working state by default.
  visibility TEXT NOT NULL DEFAULT 'practitioner_private'
    CHECK (visibility IN ('practitioner_private','client_visible')),

  due_on TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by_member_id UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cfu_open ON coach_follow_ups(relationship_id, kind) WHERE resolved_at IS NULL;

-- Items the CLIENT shared with the practitioner. Client-authored direction of travel:
-- nothing lands here without a member act. Acknowledgement is Larry closing the loop.
CREATE TABLE IF NOT EXISTS coach_client_shared_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,

  shared_by_member_id UUID NOT NULL REFERENCES members(id),
  label TEXT NOT NULL,
  body  TEXT,
  -- Where it came from; NEVER a silent promotion — the member act created this row.
  origin TEXT NOT NULL
    CHECK (origin IN ('field_note','personal_note','declared_position','session_room','direct_message','file')),
  origin_ref UUID,

  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_member_id UUID REFERENCES members(id),
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ccsi_unack
  ON coach_client_shared_items(relationship_id, shared_at DESC)
  WHERE acknowledged_at IS NULL AND withdrawn_at IS NULL;

COMMENT ON TABLE coach_client_shared_items IS
  'What the client chose to share. Per FIELD_OBJECT_PROMOTION_RULING_2026-08-02: sources produce events; '
  'the member''s explicit act creates the shared object. NOTHING is promoted here automatically.';

-- ═════════════════════════════════════════════════════════════════════════════
-- 10. CLIENT PERSONAL NOTES — private by default, sharing is a separate act
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_client_personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  -- A personal note need not belong to any process or practitioner relationship.
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,

  title TEXT,
  body  TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  remind_on TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ccpn_member
  ON coach_client_personal_notes(client_member_id, pinned DESC, updated_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE coach_client_personal_notes IS
  'The client''s own private notes. There is NO visibility column and NO practitioner-keyed read: '
  'these rows are structurally unreachable by any practitioner query. Sharing something with the '
  'practitioner is a SEPARATE act that writes coach_client_shared_items — creating a note and sharing '
  'it are different gestures behind different gates (spec §7 of the client brief).';

-- ═════════════════════════════════════════════════════════════════════════════
-- 11. SELECTED FOCUS — surface state, not a durable object
-- ═════════════════════════════════════════════════════════════════════════════
-- Ratified Member Field re-centering: "Reference = durable · Placement = surface state."
-- Which process the client is looking at today is a changeable pointer. It is never
-- applied retroactively and never silently associates a conversation with a program.

CREATE TABLE IF NOT EXISTS coach_client_selected_focus (
  client_member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  -- NULL process_id + cleared_at NULL = the explicit "My life / something else" focus.
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE coach_client_selected_focus IS
  'Surface state: which process the client is focusing on right now. Reversible, clearable, and never '
  'retroactively applied to historical records. A NULL process_id is a real choice (life outside any '
  'program), not an absence of data.';

-- ═════════════════════════════════════════════════════════════════════════════
-- updated_at triggers
-- ═════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'coach_program_definitions','coach_program_stages',
    'coach_cohorts','coach_client_processes','coach_program_enrollments',
    'coach_authored_notes','coach_sessions','coach_important_dates',
    'coach_work_items','coach_client_personal_notes','coach_client_selected_focus'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%1$s_updated_at ON %1$s', t);
    EXECUTE format(
      'CREATE TRIGGER update_%1$s_updated_at BEFORE UPDATE ON %1$s '
      'FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- §ADAPTER / §RECONCILIATION — deliberate seams, recorded not resolved
-- ═════════════════════════════════════════════════════════════════════════════
-- 1. practitioner_clients — NORMALIZED ADDITIVELY above and adopted as THE canonical
--    relationship key (founder ruling 2026-08-02). The three competing repo DDLs were
--    resolved by inspecting the LIVE shape rather than trusting any one file. Legacy
--    rows are left in place; ambiguous ones are flagged in
--    coach_relationship_reconciliation for human resolution, never auto-adopted.
--
-- 2. practitioner_client_notes + _continuity (PRs #888/#889/#890) — NOT a dependency
--    of this build (founder ruling D-NW-2). coach_authored_notes is an independent
--    model. When that lane merges and verifies its 12 acceptance criteria, the
--    reconciliation decision is: adopt its encryption-at-rest for
--    coach_authored_notes.body, or migrate its rows into coach_authored_notes with
--    purpose/visibility mapped. NEITHER is done here, and this migration does not
--    supersede that work.
--
-- 3. sessions.notes — plaintext PHI, UNRULED. Deliberately NOT retrofitted. coach_sessions
--    is a separate table and carries no note body at all; session notes live in
--    coach_authored_notes with an explicit visibility.
--
-- 4. calendar_events / google_calendar_credentials / microsoft — reconciled by
--    coach_sessions.external_calendar_(source, event_id) with a UNIQUE constraint so a
--    re-sync updates rather than duplicates.
--
-- 5. field_program_positions — UNTOUCHED. Gains no practitioner-keyed read. The C3
--    narrowing is implemented as consent + snapshot (§5), never as a widened join.
