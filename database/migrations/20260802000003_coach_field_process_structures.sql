-- Migration: coach_field_process_structures  (STRUCTURAL FOUNDATION ONLY)
-- Constitutional function: STRUCTURAL — the shape of a developmental process, hung off the
--                          one relationship spine established by M1.
-- Founder rulings applied: Kelly, 2026-08-02 — M2 (position axes), M4 (enrollment),
--                          M5 (commitment provenance), the integration ruling, and the
--                          merge ruling below.
-- Requires: 20260802000002_practitioner_client_relationship.sql (M1). Ordered after it.
--
-- ─── THE MERGE RULING THIS FILE OBEYS (founder, 2026-08-02) ─────────────────
-- Option A — STRUCTURAL-ONLY FOUNDATION:
--
--   "The migration contains no substantive client or practitioner expression — only
--    identity, relationships, lifecycle, enrollment structure, stage identifiers, consent
--    mechanics, provenance, and empty publication envelopes. All free-text and
--    content-bearing fields move to the encrypted-content lane."
--
-- Structural privacy is NOT encryption at rest. Proving that no practitioner relationship
-- path reaches a person-owned table says nothing about database administrators, backups,
-- logs, exports, a future unrelated query path, or data at rest. So no table here holds
-- human expression in plaintext, and every table whose PURPOSE is to hold it is deferred
-- rather than shipped unencrypted.
--
-- ─── DEFERRED TO THE ENCRYPTED-CONTENT LANE (not created here) ──────────────
--   coach_authored_notes            title, body
--   coach_note_publications         published_title, published_body_snapshot
--   coach_client_personal_notes     title, body
--   coach_client_shared_items       label, body
--   coach_position_shares           declared_position   (verbatim client wording)
--   coach_current_focus             focus
--   coach_work_items                title, detail, duration_note
--   coach_work_item_history         old_value, new_value
--   coach_important_dates           label
--   coach_resource_recommendations  label, note, external_url
--   coach_follow_ups                label
--
-- Their designs, constraints and append-only semantics are settled — see the evidence
-- document — and they land in a following PR under the encryption contract used by
-- lib/security/phiAccessors/*. They are NOT abandoned; they are sequenced.
--
-- ─── WHAT COUNTS AS "NOT EXPRESSION", AND WHY ──────────────────────────────
-- Program titles/descriptions, stage labels and cohort titles ARE kept. They are catalogue
-- metadata a practitioner writes about their own offering — the same text that appears on
-- an invitation or a public program page. They are not about a person and reveal nothing
-- about one. `coach_client_processes.title` is NOT kept: a process label can name a
-- person's private matter ("grief work"), so in this foundation a process must belong to a
-- program, and free-standing titled processes arrive with the encrypted lane.
--
-- ─── LINEAGE ────────────────────────────────────────────────────────────────
-- Authored deliberately against the rulings. NOT generated from a database dump.
-- 20260802000001_coach_facilitator_field.sql is a DESIGN DONOR, retired in executable form:
-- its parallel `coach_client_relationships` spine is not created, and its second
-- reconciliation queue is not created. ONE relationship spine — practitioner_clients — and
-- ONE reconciliation queue — practitioner_client_reconciliation.
--
-- ─── THE IDENTITY RULE THIS SCHEMA ENCODES ──────────────────────────────────
--   A column named practitioner_id cannot be interpreted without its table contract.
-- practitioner_clients.practitioner_id -> practitioners(id), while
-- client_invites.practitioner_id -> members(id). So no table below carries a bare
-- practitioner_id: a practitioner is reached ONLY through relationship_id, and an ACTOR is
-- recorded as an explicit pair (actor_member_id and/or actor_practitioner_id).

BEGIN;

-- ════════════════════════════════════════════════════════════════════════════
-- §0  RETIRE THE REJECTED SPINE, THE SECOND QUEUE, AND ANY UNCOMMITTED DONOR STATE
-- ════════════════════════════════════════════════════════════════════════════
-- Anything a donor left in a shared database has no committed lineage and is not delivered
-- work. It is removed ONLY when empty. A populated table refuses and reports what it holds,
-- because destroying someone's work to reach a clean schema is not a migration.

DO $$
DECLARE
  t TEXT; n BIGINT; report TEXT[] := ARRAY[]::TEXT[];
  rejected TEXT[] := ARRAY[
    -- the rejected parallel spine and duplicate queue
    'coach_client_relationships', 'coach_relationship_reconciliation',
    -- structures this migration owns and recreates below
    'coach_program_definitions','coach_program_stages','coach_cohorts','coach_cohort_memberships',
    'coach_client_processes','coach_program_enrollments','coach_enrollment_stage_history',
    'coach_position_share_consents','coach_sessions','coach_client_selected_focus',
    -- content-bearing structures DEFERRED to the encrypted lane: if a donor created them,
    -- they must not survive here in plaintext
    'coach_authored_notes','coach_note_publications','coach_note_publication_events',
    'coach_client_personal_notes','coach_client_shared_items','coach_position_shares',
    'coach_current_focus','coach_work_items','coach_work_item_history',
    'coach_important_dates','coach_resource_recommendations','coach_follow_ups'
  ];
BEGIN
  FOREACH t IN ARRAY rejected LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
      IF n > 0 THEN report := report || format('%s holds %s row(s)', t, n); END IF;
    END IF;
  END LOOP;

  IF array_length(report, 1) > 0 THEN
    RAISE EXCEPTION
      'Refusing to drop populated tables: %. These structures either were rejected by founder '
      'ruling (one spine: practitioner_clients; one queue: practitioner_client_reconciliation) '
      'or exist without a committed migration. Migrate their contents deliberately, then re-run.',
      array_to_string(report, '; ');
  END IF;

  FOREACH t IN ARRAY rejected LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', t);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS coach_position_shares_no_rewrite() CASCADE;
DROP FUNCTION IF EXISTS coach_notes_publication_boundary() CASCADE;
DROP FUNCTION IF EXISTS coach_note_events_immutable() CASCADE;
DROP FUNCTION IF EXISTS coach_note_publication_immutable() CASCADE;

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
  'education and spiritual direction deliberately: none may be forced to describe itself in '
  'another discipline''s vocabulary. title/description are CATALOGUE metadata about the '
  'practitioner''s own offering — not about any person — which is why they are plaintext here.';

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
COMMENT ON TABLE coach_program_stages IS
  'Stage identifiers for a program. Same catalogue reasoning as the program itself: these '
  'describe the offering''s structure, never a person''s condition.';

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
  program_definition_id UUID NOT NULL REFERENCES coach_program_definitions(id) ON DELETE RESTRICT,
  cohort_id UUID REFERENCES coach_cohorts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','completed','former')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ccp_relationship ON coach_client_processes(relationship_id, status);
COMMENT ON TABLE coach_client_processes IS
  'One developmental process inside one relationship. A client may hold several at once and a '
  'history of former ones. status describes the PROCESS, never the person. A free-text `title` '
  'is deliberately ABSENT in this structural foundation — a process label can name a person''s '
  'private matter — so a process here must belong to a program. Free-standing titled processes '
  'arrive with the encrypted-content lane.';

-- ════════════════════════════════════════════════════════════════════════════
-- §4  ENROLLMENT AND STAGE HISTORY  (M2 + M4)
-- ════════════════════════════════════════════════════════════════════════════
-- Formal placement, administered by the practitioner. This is NOT the client's declared
-- position and must never be rendered as though it were.

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
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (changed_by_member_id IS NOT NULL OR changed_by_practitioner_id IS NOT NULL)
);
CREATE INDEX idx_cesh_enrollment ON coach_enrollment_stage_history(program_enrollment_id, effective_at DESC);
COMMENT ON TABLE coach_enrollment_stage_history IS
  'Where a client has been, as stage identifiers and provenance only. A free-text `change_reason` '
  'is deliberately ABSENT here — a reason for moving someone is clinical-adjacent expression — and '
  'arrives with the encrypted-content lane.';

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
-- §5  CONSENT MECHANICS FOR CLIENT-DECLARED POSITION  (M2 axis 3)
-- ════════════════════════════════════════════════════════════════════════════
-- field_program_positions keeps its constitutional meaning: the member declares where they
-- experience themselves to be. The practitioner never writes it and never reads it directly.
-- The CONSENT is structural and lands here. The SHARED SNAPSHOT is verbatim client wording,
-- so it lands in the encrypted lane with coach_position_shares.

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

-- ════════════════════════════════════════════════════════════════════════════
-- §6  SESSIONS
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
  stage_id_at_time UUID REFERENCES coach_program_stages(id) ON DELETE SET NULL,
  external_calendar_event_id TEXT,
  external_calendar_source TEXT
    CHECK (external_calendar_source IS NULL OR external_calendar_source IN ('google','microsoft','manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (external_calendar_source, external_calendar_event_id)
);
CREATE INDEX idx_cs_relationship ON coach_sessions(relationship_id, scheduled_for DESC);
CREATE INDEX idx_cs_upcoming ON coach_sessions(scheduled_for) WHERE status IN ('tentative','confirmed');
COMMENT ON COLUMN coach_sessions.stage_id_at_time IS
  'Where the client was when this session happened, as a stage IDENTIFIER rather than a copied '
  'label. Never recomputed: advancing someone later must not rewrite the history of a past session.';
COMMENT ON TABLE coach_sessions IS
  'Scheduling structure only. A free-text `location_note` is deliberately ABSENT — "her mother''s '
  'house" is expression about a person — and arrives with the encrypted-content lane.';

-- ════════════════════════════════════════════════════════════════════════════
-- §7  CLIENT-SELECTED FOCUS  (person-owned surface state, no content)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_client_selected_focus (
  client_member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  process_id UUID REFERENCES coach_client_processes(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE coach_client_selected_focus IS
  'PERSON-OWNED (Invariant 1): keyed on members.id with NO relationship_id, so no '
  'practitioner-scoped query can reach it. Surface state — which process the client is attending '
  'to right now. Reversible and clearable, never applied retroactively. A NULL process_id is a '
  'real choice — life outside any program — not missing data. Holds a pointer, never words.';

-- ════════════════════════════════════════════════════════════════════════════
-- §8  updated_at triggers
-- ════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'coach_program_definitions','coach_cohorts','coach_client_processes',
    'coach_program_enrollments','coach_sessions','coach_client_selected_focus',
    'coach_position_share_consents'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%1$s_updated_at ON %1$s', t);
    EXECUTE format(
      'CREATE TRIGGER update_%1$s_updated_at BEFORE UPDATE ON %1$s '
      'FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

COMMIT;
