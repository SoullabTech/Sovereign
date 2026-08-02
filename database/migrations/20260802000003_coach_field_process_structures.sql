-- Migration: coach_field_process_structures
-- Constitutional function: STRUCTURAL — the developmental process, hung off the one
--                          relationship spine established by M1.
-- Founder rulings applied: Kelly, 2026-08-02 — M2 (position axes), M3 (note publication),
--                          M4 (enrollment), M5 (commitment provenance), and the
--                          integration ruling that produced this file.
-- Requires: 20260802000002_practitioner_client_relationship.sql (M1). Ordered after it.
--
-- ─── LINEAGE ────────────────────────────────────────────────────────────────
-- Authored deliberately against the rulings. NOT generated from a database dump.
-- 20260802000001_coach_facilitator_field.sql is a DESIGN DONOR, retired in
-- executable form: its table designs are salvaged here, its parallel
-- `coach_client_relationships` spine is not created, and its second reconciliation
-- queue is not created. There is ONE relationship spine — practitioner_clients —
-- and ONE reconciliation queue — practitioner_client_reconciliation.
--
-- ─── THE IDENTITY RULE THIS SCHEMA ENCODES ──────────────────────────────────
--   A column named practitioner_id cannot be interpreted without its table contract.
-- Live schema proves it: practitioner_clients.practitioner_id -> practitioners(id),
-- while client_invites.practitioner_id -> members(id). So no table below carries a
-- bare practitioner_id. A practitioner is reached ONLY through relationship_id, and
-- an ACTOR is recorded as an explicit pair — actor_member_id and/or
-- actor_practitioner_id — so the referent is never inferred from a name.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════════
-- §0  RETIRE THE REJECTED SPINE AND THE SECOND QUEUE
-- ════════════════════════════════════════════════════════════════════════════
-- Anything the donor left in a shared database has no committed lineage and is not
-- delivered work. It is removed ONLY when empty. A populated table refuses and
-- prints what it holds, because destroying someone's work to reach a clean schema
-- is not a migration, it is data loss with a tidy commit message.

DO $$
DECLARE
  t TEXT; n BIGINT; report TEXT[] := ARRAY[]::TEXT[];
  rejected TEXT[] := ARRAY['coach_client_relationships', 'coach_relationship_reconciliation'];
BEGIN
  FOREACH t IN ARRAY rejected LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
      IF n > 0 THEN report := report || format('%s holds %s row(s)', t, n); END IF;
    END IF;
  END LOOP;

  IF array_length(report, 1) > 0 THEN
    RAISE EXCEPTION
      'Refusing to drop populated tables: %. These structures were rejected by founder ruling '
      '(one relationship spine: practitioner_clients; one reconciliation queue: '
      'practitioner_client_reconciliation). Migrate their contents into the canonical tables '
      'deliberately, then re-run.', array_to_string(report, '; ');
  END IF;

  FOREACH t IN ARRAY rejected LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', t);
  END LOOP;
END $$;

-- Donor tables that exist only in a shared database, with no committed migration,
-- are recreated below from this file. Same rule: refuse if populated.
DO $$
DECLARE
  t TEXT; n BIGINT; report TEXT[] := ARRAY[]::TEXT[];
  donor TEXT[] := ARRAY[
    'coach_program_definitions','coach_program_stages','coach_cohorts','coach_cohort_memberships',
    'coach_client_processes','coach_program_enrollments','coach_enrollment_stage_history',
    'coach_current_focus','coach_position_share_consents','coach_position_shares',
    'coach_authored_notes','coach_note_publication_events','coach_note_publications',
    'coach_sessions','coach_important_dates','coach_work_items','coach_work_item_history',
    'coach_resource_recommendations','coach_follow_ups','coach_client_shared_items',
    'coach_client_personal_notes','coach_client_selected_focus'
  ];
BEGIN
  FOREACH t IN ARRAY donor LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
      IF n > 0 THEN report := report || format('%s holds %s row(s)', t, n); END IF;
    END IF;
  END LOOP;

  IF array_length(report, 1) > 0 THEN
    RAISE EXCEPTION
      'Refusing to replace populated uncommitted tables: %. These exist in this database without '
      'a committed migration. Preserve the data deliberately before re-running.',
      array_to_string(report, '; ');
  END IF;

  FOREACH t IN ARRAY donor LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', t);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS coach_position_shares_no_rewrite() CASCADE;
DROP FUNCTION IF EXISTS coach_notes_publication_boundary() CASCADE;
DROP FUNCTION IF EXISTS coach_note_events_immutable() CASCADE;

-- ════════════════════════════════════════════════════════════════════════════
-- §1  PROGRAM DEFINITIONS AND STAGES  (M4 — what a practitioner administers)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_program_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'coaching'
    CHECK (kind IN ('coaching','facilitation','mentoring','education','spiritual_direction',
                    'training','workshop','course','retreat','open_ended')),
  state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cpd_owner ON coach_program_definitions(owner_practitioner_id, state);
COMMENT ON TABLE coach_program_definitions IS
  'A program the practitioner administers. `kind` spans coaching, facilitation, mentoring, '
  'education and spiritual direction deliberately: none of these may be forced to describe '
  'itself in another discipline''s vocabulary.';

CREATE TABLE coach_program_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_definition_id UUID NOT NULL REFERENCES coach_program_definitions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'stage'
    CHECK (kind IN ('stage','phase','module','week','session','milestone')),
  position INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_definition_id, position)
);
CREATE INDEX idx_cps_program ON coach_program_stages(program_definition_id, position);

-- ════════════════════════════════════════════════════════════════════════════
-- §2  COHORTS
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
  program_definition_id UUID REFERENCES coach_program_definitions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  starts_on DATE,
  ends_on DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cc_owner ON coach_cohorts(owner_practitioner_id, status);

CREATE TABLE coach_cohort_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES coach_cohorts(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  joined_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_on TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uniq_ccm_active ON coach_cohort_memberships(cohort_id, relationship_id)
  WHERE left_on IS NULL;
CREATE INDEX idx_ccm_relationship ON coach_cohort_memberships(relationship_id);

-- ════════════════════════════════════════════════════════════════════════════
-- §3  CLIENT PROCESSES  (many per relationship — a person is not one process)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_client_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  program_definition_id UUID REFERENCES coach_program_definitions(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','completed','former')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (program_definition_id IS NOT NULL OR title IS NOT NULL)
);
CREATE INDEX idx_ccp_relationship ON coach_client_processes(relationship_id, status);
COMMENT ON TABLE coach_client_processes IS
  'One developmental process inside one relationship. A client may hold several at once and a '
  'history of former ones. status describes the PROCESS, never the person.';

-- ════════════════════════════════════════════════════════════════════════════
-- §4  ENROLLMENT AND STAGE HISTORY  (M2 + M4)
-- ════════════════════════════════════════════════════════════════════════════
-- Formal placement, administered by the practitioner. This is NOT the client's
-- declared position (§6) and must never be rendered as though it were.

CREATE TABLE coach_program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES coach_client_processes(id) ON DELETE CASCADE,
  program_definition_id UUID NOT NULL REFERENCES coach_program_definitions(id) ON DELETE RESTRICT,
  current_stage_id UUID REFERENCES coach_program_stages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'enrolled'
    CHECK (status IN ('pending','enrolled','paused','completed','withdrawn')),
  enrolled_by_member_id UUID REFERENCES members(id),
  enrolled_by_practitioner_id UUID REFERENCES practitioners(id),
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (enrolled_by_member_id IS NOT NULL OR enrolled_by_practitioner_id IS NOT NULL)
);
CREATE UNIQUE INDEX uniq_cpe_live ON coach_program_enrollments(process_id, program_definition_id)
  WHERE status IN ('pending','enrolled','paused');
CREATE INDEX idx_cpe_process ON coach_program_enrollments(process_id, status);
COMMENT ON TABLE coach_program_enrollments IS
  'M4: enrollment is a real, practitioner-administered relationship to a program — distinct from '
  'program ACCESS (a door link grants entry, not enrollment), from INVITATION (a mechanism), and '
  'from VISIBILITY (permission to see a record). A pending enrollment may exist before the invited '
  'person has an account; acceptance activates it. Re-enrolment adds a row; it never rewrites the '
  'history of a previous one.';

CREATE TABLE coach_enrollment_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_enrollment_id UUID NOT NULL REFERENCES coach_program_enrollments(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES coach_program_stages(id) ON DELETE SET NULL,
  to_stage_id UUID REFERENCES coach_program_stages(id) ON DELETE SET NULL,
  changed_by_member_id UUID REFERENCES members(id),
  changed_by_practitioner_id UUID REFERENCES practitioners(id),
  change_reason TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (changed_by_member_id IS NOT NULL OR changed_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cesh_enrollment ON coach_enrollment_stage_history(program_enrollment_id, effective_at DESC);

CREATE OR REPLACE FUNCTION coach_stage_history_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'coach_enrollment_stage_history is append-only: % is not permitted. Where a client '
                  'has been is not editable.', TG_OP;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER coach_stage_history_immutable
  BEFORE UPDATE OR DELETE ON coach_enrollment_stage_history
  FOR EACH ROW EXECUTE FUNCTION coach_stage_history_append_only();

-- ════════════════════════════════════════════════════════════════════════════
-- §5  CURRENT PRACTICAL FOCUS  (M2 axis 4)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_current_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES coach_client_processes(id) ON DELETE CASCADE,
  focus TEXT NOT NULL,
  authored_by TEXT NOT NULL CHECK (authored_by IN ('practitioner','client','jointly_recorded')),
  author_member_id UUID REFERENCES members(id),
  author_practitioner_id UUID REFERENCES practitioners(id),
  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (author_member_id IS NOT NULL OR author_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_ccf_process ON coach_current_focus(process_id, effective_from DESC);
COMMENT ON TABLE coach_current_focus IS
  'M2 axis 4. authored_by and visibility travel WITH the row, so no view can present a '
  'practitioner''s framing as the client''s own words, or the reverse.';

-- ════════════════════════════════════════════════════════════════════════════
-- §6  CLIENT-DECLARED POSITION — VISIBLE ONLY WHEN SHARED  (M2 axis 3)
-- ════════════════════════════════════════════════════════════════════════════
-- field_program_positions keeps its constitutional meaning: the member declares
-- where they experience themselves to be. The practitioner never writes it, and
-- never reads it directly. What a practitioner may see is a SNAPSHOT the client
-- chose to share — forward-only and revocable.

CREATE TABLE coach_position_share_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  client_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'off' CHECK (mode IN ('off','ongoing')),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (relationship_id, client_member_id)
);
COMMENT ON TABLE coach_position_share_consents IS
  'Member-authored standing preference, default OFF. Turning it on shares declarations made or '
  'updated FROM effective_from ONWARD — it never retroactively exposes earlier private '
  'declarations. Turning it off stops future sharing without deleting what was already shared. '
  'Sharing a position is not permission for any broader Field access: no other read keys off this row.';

CREATE TABLE coach_position_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  client_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  declared_position TEXT NOT NULL,
  stated_by TEXT NOT NULL CHECK (stated_by IN ('member_confirmed','member_stated')),
  declared_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_origin TEXT NOT NULL CHECK (share_origin IN ('item','ongoing')),
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cposs_relationship ON coach_position_shares(relationship_id, shared_at DESC);
COMMENT ON TABLE coach_position_shares IS
  'One row per declaration the client explicitly shared. declared_position is a VERBATIM SNAPSHOT: '
  'the client''s exact wording, preserved. Always rendered as client-declared, never as practitioner '
  'assessment. stated_by admits no practitioner-seeded value — a position the practitioner authored '
  'is not a declared position, it is a focus (§5).';

CREATE OR REPLACE FUNCTION coach_position_shares_no_rewrite()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'coach_position_shares is append-only: DELETE is not permitted (withdraw instead)';
  END IF;
  IF NEW.declared_position IS DISTINCT FROM OLD.declared_position
     OR NEW.client_member_id  IS DISTINCT FROM OLD.client_member_id
     OR NEW.relationship_id   IS DISTINCT FROM OLD.relationship_id
     OR NEW.shared_at         IS DISTINCT FROM OLD.shared_at
     OR NEW.stated_by         IS DISTINCT FROM OLD.stated_by THEN
    RAISE EXCEPTION 'coach_position_shares is append-only: only withdrawn_at may change';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER coach_position_shares_append_only
  BEFORE UPDATE OR DELETE ON coach_position_shares
  FOR EACH ROW EXECUTE FUNCTION coach_position_shares_no_rewrite();

-- ════════════════════════════════════════════════════════════════════════════
-- §7  PRACTITIONER-AUTHORED NOTES AND THEIR PUBLICATION  (M3)
-- ════════════════════════════════════════════════════════════════════════════
-- ONE neutral source note, private by construction. It carries NO visibility
-- column and NO published flag — so there is nothing on it to toggle, and
-- publication cannot happen by editing. Publication is a separate object.
-- The note template is a VIEW; ownership, purpose, visibility and publication are
-- structural properties. Serves coaching, facilitation, mentoring, education and
-- spiritual direction without importing a clinical ontology.

CREATE TABLE coach_authored_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  session_id UUID,                       -- FK added in §8, after coach_sessions exists
  author_member_id UUID REFERENCES members(id),
  author_practitioner_id UUID REFERENCES practitioners(id),
  purpose TEXT NOT NULL DEFAULT 'private_observation'
    CHECK (purpose IN ('private_observation','session_preparation','session_record','follow_up',
                       'client_guidance','administrative')),
  template TEXT,
  title TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  CHECK (author_member_id IS NOT NULL OR author_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_can_relationship ON coach_authored_notes(relationship_id, created_at DESC);
COMMENT ON TABLE coach_authored_notes IS
  'M3: ONE practitioner-authored source note, private by construction. There is deliberately no '
  'visibility column: a private note cannot be published by editing it, because nothing on it '
  'expresses publication. Sharing writes a coach_note_publications row instead. `template` is '
  'presentation only — a VIEW over the same record, never a type. Deliberately NOT built on '
  'practitioner_client_notes (#888/#890, unverified) — see the reconciliation seam in the spec.';
COMMENT ON COLUMN coach_authored_notes.template IS
  'Practitioner-selectable vocabulary/layout. A VIEW, not a type: changing it never changes '
  'ownership, purpose, visibility or publication state.';

CREATE TABLE coach_note_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id UUID NOT NULL REFERENCES coach_authored_notes(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  published_by_member_id UUID REFERENCES members(id),
  published_by_practitioner_id UUID REFERENCES practitioners(id),
  published_title TEXT,
  published_body_snapshot TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  superseded_by_id UUID REFERENCES coach_note_publications(id) ON DELETE SET NULL,
  CHECK (published_by_member_id IS NOT NULL OR published_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cnp_relationship ON coach_note_publications(relationship_id, published_at DESC);
CREATE UNIQUE INDEX uniq_cnp_live_per_note ON coach_note_publications(source_note_id)
  WHERE withdrawn_at IS NULL AND superseded_by_id IS NULL;
COMMENT ON TABLE coach_note_publications IS
  'M3: the delivery object. Belongs to the relational client environment — it is NOT placed into '
  'the member''s Field and never becomes a member-authored object. published_body_snapshot is what '
  'the client actually received, so the practitioner''s private source note can keep evolving '
  'without silently rewriting what was sent. Updating a shared note is a NEW publication that '
  'supersedes the last. Withdrawal removes current display and preserves the fact of publication.';

CREATE OR REPLACE FUNCTION coach_note_publication_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'coach_note_publications is append-only: DELETE is not permitted (withdraw instead)';
  END IF;
  IF NEW.published_body_snapshot IS DISTINCT FROM OLD.published_body_snapshot
     OR NEW.published_title   IS DISTINCT FROM OLD.published_title
     OR NEW.source_note_id    IS DISTINCT FROM OLD.source_note_id
     OR NEW.relationship_id   IS DISTINCT FROM OLD.relationship_id
     OR NEW.published_at      IS DISTINCT FROM OLD.published_at THEN
    RAISE EXCEPTION 'coach_note_publications is append-only: only withdrawn_at and superseded_by_id '
                    'may change. What the client received is not editable after the fact.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER coach_note_publication_append_only
  BEFORE UPDATE OR DELETE ON coach_note_publications
  FOR EACH ROW EXECUTE FUNCTION coach_note_publication_immutable();

-- ════════════════════════════════════════════════════════════════════════════
-- §8  SESSIONS AND IMPORTANT DATES
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('tentative','confirmed','completed','cancelled','missed')),
  stage_label_at_time TEXT,
  external_calendar_event_id TEXT,
  external_calendar_source TEXT
    CHECK (external_calendar_source IS NULL OR external_calendar_source IN ('google','microsoft','manual')),
  location_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (external_calendar_source, external_calendar_event_id)
);
CREATE INDEX idx_cs_relationship ON coach_sessions(relationship_id, scheduled_for DESC);
CREATE INDEX idx_cs_upcoming ON coach_sessions(scheduled_for) WHERE status IN ('tentative','confirmed');
COMMENT ON COLUMN coach_sessions.stage_label_at_time IS
  'Snapshot of where the client was when this session happened. Never recomputed: advancing '
  'someone later must not rewrite the history of a past session.';

ALTER TABLE coach_authored_notes
  ADD CONSTRAINT coach_authored_notes_session_fk
  FOREIGN KEY (session_id) REFERENCES coach_sessions(id) ON DELETE SET NULL;

CREATE TABLE coach_important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL
    CHECK (kind IN ('confirmed_session','suggested_date','assignment_due','program_milestone',
                    'personal_reminder','cohort_event')),
  occurs_on TIMESTAMPTZ NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  created_by_member_id UUID REFERENCES members(id),
  created_by_practitioner_id UUID REFERENCES practitioners(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (created_by_member_id IS NOT NULL OR created_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cid_relationship ON coach_important_dates(relationship_id, occurs_on);

-- ════════════════════════════════════════════════════════════════════════════
-- §9  HOMEWORK · PRACTICES · COMMITMENTS  (M5 — provenance and assent)
-- ════════════════════════════════════════════════════════════════════════════
-- Three meanings, one table, held apart by CHECK constraints. Authorship is never
-- inferred from who typed the row: originated_by is whose intention it was,
-- recorded_by is who entered it, and a proposal only becomes the client's
-- commitment when the member affirms it.

CREATE TABLE coach_work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  source_session_id UUID REFERENCES coach_sessions(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('homework','practice','commitment')),
  title TEXT NOT NULL,
  detail TEXT,

  originated_by_role TEXT NOT NULL
    CHECK (originated_by_role IN ('member','practitioner','joint','program','legacy_unknown')),
  originated_by_member_id UUID REFERENCES members(id),
  originated_by_practitioner_id UUID REFERENCES practitioners(id),
  recorded_by_member_id UUID REFERENCES members(id),
  recorded_by_practitioner_id UUID REFERENCES practitioners(id),

  proposed_at TIMESTAMPTZ,
  member_affirmed_at TIMESTAMPTZ,
  practitioner_acknowledged_at TIMESTAMPTZ,

  source TEXT NOT NULL DEFAULT 'individual'
    CHECK (source IN ('individual','program_default','cohort_wide')),
  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  due_on TIMESTAMPTZ,
  duration_note TEXT,
  state TEXT NOT NULL DEFAULT 'open'
    CHECK (state IN ('proposed','open','acknowledged','completed','released')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (recorded_by_member_id IS NOT NULL OR recorded_by_practitioner_id IS NOT NULL),
  -- a practice lives in duration, not deadlines
  CHECK (kind <> 'practice' OR due_on IS NULL),
  -- M5: a practitioner-proposed action is not the client's commitment until the
  -- member affirms it. Until then it is a proposal or an assignment.
  CHECK (kind <> 'commitment' OR member_affirmed_at IS NOT NULL),
  CHECK (originated_by_role <> 'member' OR originated_by_member_id IS NOT NULL),
  CHECK (originated_by_role <> 'practitioner' OR originated_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cwi_relationship ON coach_work_items(relationship_id, kind, state);
CREATE INDEX idx_cwi_due ON coach_work_items(due_on) WHERE state = 'open' AND due_on IS NOT NULL;
COMMENT ON TABLE coach_work_items IS
  'Homework, practice and commitment share a table but NOT a meaning, and the CHECK constraints '
  'hold them apart. M5: origin is recorded, never inferred — "recorded_by" is not "originated_by", '
  'and a commitment requires member_affirmed_at, so Larry entering something cannot make it the '
  'client''s commitment. Completion is never punitive: "released" exists so letting something go '
  'is a first-class outcome, not a failure.';

CREATE TABLE coach_work_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID NOT NULL REFERENCES coach_work_items(id) ON DELETE CASCADE,
  changed_by_member_id UUID REFERENCES members(id),
  changed_by_practitioner_id UUID REFERENCES practitioners(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (changed_by_member_id IS NOT NULL OR changed_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cwih_item ON coach_work_item_history(work_item_id, occurred_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- §10  RESOURCES, FOLLOW-UPS, SHARED ITEMS, CLIENT-PRIVATE NOTES, FOCUS
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_resource_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,
  library_source_id UUID,
  external_url TEXT,
  label TEXT NOT NULL,
  note TEXT,
  recommended_by_member_id UUID REFERENCES members(id),
  recommended_by_practitioner_id UUID REFERENCES practitioners(id),
  visibility TEXT NOT NULL DEFAULT 'client_visible'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (library_source_id IS NOT NULL OR external_url IS NOT NULL),
  CHECK (recommended_by_member_id IS NOT NULL OR recommended_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_crr_relationship ON coach_resource_recommendations(relationship_id, created_at DESC);

-- library_sources is optional in some environments; bind the FK only if it exists.
DO $$
BEGIN
  IF to_regclass('public.library_sources') IS NOT NULL THEN
    ALTER TABLE coach_resource_recommendations
      ADD CONSTRAINT coach_resource_recommendations_library_fk
      FOREIGN KEY (library_source_id) REFERENCES library_sources(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE coach_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES coach_sessions(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'practitioner_todo'
    CHECK (kind IN ('practitioner_todo','carry_to_next_session','awaiting_client')),
  visibility TEXT NOT NULL DEFAULT 'practitioner_private'
    CHECK (visibility IN ('practitioner_private','client_visible')),
  due_on TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by_member_id UUID REFERENCES members(id),
  created_by_practitioner_id UUID REFERENCES practitioners(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (created_by_member_id IS NOT NULL OR created_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cfu_open ON coach_follow_ups(relationship_id, kind) WHERE resolved_at IS NULL;

CREATE TABLE coach_client_shared_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  shared_by_member_id UUID NOT NULL REFERENCES members(id),
  label TEXT NOT NULL,
  body TEXT,
  origin TEXT NOT NULL
    CHECK (origin IN ('field_note','personal_note','declared_position','session_room',
                      'direct_message','file')),
  origin_ref UUID,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_member_id UUID REFERENCES members(id),
  withdrawn_at TIMESTAMPTZ
);
CREATE INDEX idx_ccsi_unack ON coach_client_shared_items(relationship_id, shared_at DESC)
  WHERE acknowledged_at IS NULL AND withdrawn_at IS NULL;
COMMENT ON TABLE coach_client_shared_items IS
  'What the client chose to hand over. Sources produce events; the member''s explicit act creates '
  'the shared object. Nothing is promoted here automatically.';

CREATE TABLE coach_client_personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  remind_on TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_ccpn_member ON coach_client_personal_notes(client_member_id, pinned DESC, updated_at DESC)
  WHERE deleted_at IS NULL;
COMMENT ON TABLE coach_client_personal_notes IS
  'The client''s own private notes. There is no visibility column and no relationship_id: these '
  'rows are structurally unreachable from any practitioner-scoped query. Sharing something is a '
  'SEPARATE act writing coach_client_shared_items — writing and sharing are different gestures '
  'behind different gates.';

CREATE TABLE coach_client_selected_focus (
  client_member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE coach_client_selected_focus IS
  'Surface state: which process the client is attending to right now. Reversible and clearable, '
  'never applied retroactively. A NULL process_id is a real choice — life outside any program — '
  'not missing data.';

-- ════════════════════════════════════════════════════════════════════════════
-- §11  updated_at triggers
-- ════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'coach_program_definitions','coach_cohorts','coach_client_processes',
    'coach_program_enrollments','coach_authored_notes','coach_sessions',
    'coach_important_dates','coach_work_items','coach_client_personal_notes',
    'coach_client_selected_focus','coach_position_share_consents'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%1$s_updated_at ON %1$s', t);
    EXECUTE format(
      'CREATE TRIGGER update_%1$s_updated_at BEFORE UPDATE ON %1$s '
      'FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

COMMIT;
