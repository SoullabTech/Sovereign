-- ============================================================================
-- S5 Provenance Substrate
-- Charter: docs/architecture/SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md Part 4
-- Constitution: docs/architecture/S5_PROVENANCE_CONSTITUTION_2026-07-18.md
--
-- Constitutional sentences this migration serves (ratified 2026-07-17):
--   1. Sanctuary is not a session property. Sanctuary is a per-turn posture.
--   2. No durable object may be written without knowing what governed its creation.
--   3. Deletion is not complete if restoration can silently resurrect what
--      sovereignty required the system to forget.
--   4. The system can only reflect safely if it first knows exactly what it is
--      allowed to remember.
--
-- Everything here is CONTENT-FREE: postures, ids, timestamps, reason classes.
-- No member content enters any table created by this migration.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. runtime_consent_state — the server-side record of the posture in force
--    for a request. Turn-scoped, content-free, written at request start.
--    This is the S5 flip from "posture asserted by request flag" to "posture
--    recorded by the server"; background/queued writers resolve from this
--    record instead of trusting arguments handed down a call chain.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS runtime_consent_state (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    TEXT NOT NULL UNIQUE,   -- exchange/request id minted at the serving boundary
  member_id     TEXT,                   -- id only; never content
  session_id    TEXT,
  posture       TEXT NOT NULL CHECK (posture IN ('normal', 'sanctuary')),
  resolved_from TEXT NOT NULL DEFAULT 'request-meta',
  resolved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runtime_consent_state_session
  ON runtime_consent_state(session_id, resolved_at DESC)
  WHERE session_id IS NOT NULL;

COMMENT ON TABLE runtime_consent_state IS
'S5: per-request posture record, resolved server-side at the serving boundary. Content-free by constitution. Consumers verify posture against this record rather than trusting call-chain arguments.';

-- ----------------------------------------------------------------------------
-- 2. Deletion manifests, scopes, and tombstones — restorable-deletion
--    guarantees (R20). A sovereignty-driven deletion writes a manifest (why,
--    authorized by whom) plus either per-object tombstones or predicate
--    scopes (table + session + time window). Restores must consume these.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deletion_manifests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_class  TEXT NOT NULL CHECK (reason_class IN (
    'incident_remediation', 'member_deletion', 'sanctuary_purge', 'governance'
  )),
  incident_ref  TEXT,                   -- e.g. SANC-20260614-01
  authorized_by TEXT NOT NULL,          -- actor label (founder ruling ref), never content
  executed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note          TEXT                    -- content-free description of the deletion
);

CREATE TABLE IF NOT EXISTS deletion_manifest_scopes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id  UUID NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  table_name   TEXT NOT NULL,
  session_id   TEXT,
  member_id    TEXT,
  window_start TIMESTAMPTZ,
  window_end   TIMESTAMPTZ,
  -- A scope must actually scope something.
  CHECK (session_id IS NOT NULL OR member_id IS NOT NULL OR window_start IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_deletion_manifest_scopes_table
  ON deletion_manifest_scopes(table_name);

CREATE TABLE IF NOT EXISTS provenance_tombstones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id   UUID NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  object_kind   TEXT NOT NULL,          -- table name of the forgotten object
  object_id     TEXT NOT NULL,          -- id only; the content is gone and stays gone
  tombstoned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (object_kind, object_id)
);

COMMENT ON TABLE deletion_manifests IS
'S5/R20: content-free record of every sovereignty-driven deletion. Restores consume manifests+scopes+tombstones; a restore that ignores them is ungoverned.';
COMMENT ON TABLE provenance_tombstones IS
'S5/R20: ids of forgotten objects, kept as refusal markers so restoration can recognize what it must never resurrect.';

-- Seed: the known incident (SANC-20260614-01), generalizing its audit record
-- into the first first-class manifest. Predicates copied verbatim from
-- docs/incidents/INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md (execution log).
INSERT INTO deletion_manifests (id, reason_class, incident_ref, authorized_by, executed_at, note)
VALUES (
  'a0000000-5a5c-4000-8000-202606140001',
  'incident_remediation',
  'SANC-20260614-01',
  'Kelly ruling K3 (2026-07-17)',
  '2026-07-17T00:00:00Z',
  'Sanctuary content persisted during session_1781360679324 window; deleted from live DB 2026-07-17; 30 contaminated dumps destroyed. Scopes below are the restore-filter predicates.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO deletion_manifest_scopes (manifest_id, table_name, session_id, window_start, window_end)
SELECT 'a0000000-5a5c-4000-8000-202606140001', t.table_name, 'session_1781360679324',
       '2026-06-14T12:43:30Z', '2026-06-14T13:00:00Z'
FROM (VALUES ('conversation_turns'), ('agent_runs'), ('integration_passes')) AS t(table_name)
WHERE NOT EXISTS (
  SELECT 1 FROM deletion_manifest_scopes
  WHERE manifest_id = 'a0000000-5a5c-4000-8000-202606140001'
    AND table_name = t.table_name
);

-- ----------------------------------------------------------------------------
-- 3. Restore refusal (R20 made structural at the deepest layer).
--    BEFORE INSERT triggers on the content lanes silently DROP any row that is
--    tombstoned or falls inside a deletion-manifest scope, with a metadata-only
--    warning. Because triggers also fire on COPY, a data-only pg_restore into
--    the live schema cannot resurrect forgotten rows. (A full disaster-recovery
--    restore replaces the schema; that path goes through
--    scripts/restore-governed.sh, which runs the same sweep afterward.)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION s5_refuse_tombstoned() RETURNS trigger AS $$
DECLARE
  row_id TEXT;
  row_session TEXT;
  row_created TIMESTAMPTZ;
BEGIN
  -- to_jsonb(NEW) keeps the function valid across lanes regardless of exact
  -- column sets (a missing key yields NULL rather than a runtime error).
  row_id := to_jsonb(NEW) ->> 'id';
  row_session := to_jsonb(NEW) ->> 'session_id';
  row_created := (to_jsonb(NEW) ->> 'created_at')::timestamptz;

  IF EXISTS (
    SELECT 1 FROM provenance_tombstones
    WHERE object_kind = TG_TABLE_NAME AND object_id = row_id
  ) THEN
    RAISE WARNING '[PROVENANCE] restore refused — tombstoned % row dropped (id=%)',
      TG_TABLE_NAME, left(row_id, 12);
    RETURN NULL;  -- drop the row; never abort the surrounding restore
  END IF;

  IF EXISTS (
    SELECT 1 FROM deletion_manifest_scopes s
    WHERE s.table_name = TG_TABLE_NAME
      AND (s.session_id IS NULL OR s.session_id = row_session)
      AND (s.window_start IS NULL OR row_created >= s.window_start)
      AND (s.window_end IS NULL OR row_created <= s.window_end)
      -- a scope with only NULLs cannot exist (table CHECK), so this cannot
      -- swallow unscoped rows
      AND (s.session_id IS NOT NULL OR s.window_start IS NOT NULL)
  ) THEN
    RAISE WARNING '[PROVENANCE] restore refused — % row inside deletion-manifest scope dropped (id=%)',
      TG_TABLE_NAME, left(row_id, 12);
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS s5_refuse_tombstoned_trigger ON conversation_turns;
CREATE TRIGGER s5_refuse_tombstoned_trigger
  BEFORE INSERT ON conversation_turns
  FOR EACH ROW EXECUTE FUNCTION s5_refuse_tombstoned();

DO $$
BEGIN
  IF to_regclass('public.agent_runs') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS s5_refuse_tombstoned_trigger ON agent_runs';
    EXECUTE 'CREATE TRIGGER s5_refuse_tombstoned_trigger
      BEFORE INSERT ON agent_runs
      FOR EACH ROW EXECUTE FUNCTION s5_refuse_tombstoned()';
  END IF;
  IF to_regclass('public.integration_passes') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS s5_refuse_tombstoned_trigger ON integration_passes';
    EXECUTE 'CREATE TRIGGER s5_refuse_tombstoned_trigger
      BEFORE INSERT ON integration_passes
      FOR EACH ROW EXECUTE FUNCTION s5_refuse_tombstoned()';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. Turn-level posture + provenance (the incident's lane; first priority).
--    Existing rows are marked 'unknown-historical' EXPLICITLY — a truthful
--    answer, never a silently backfilled "normal" (constitution §7).
-- ----------------------------------------------------------------------------
ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT NOT NULL DEFAULT 'unknown-historical',
  ADD COLUMN IF NOT EXISTS provenance JSONB;

-- New rows must state their posture explicitly; the default existed only to
-- backfill the historical corpus honestly.
ALTER TABLE conversation_turns ALTER COLUMN posture_at_creation DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'conversation_turns_posture_valid'
  ) THEN
    ALTER TABLE conversation_turns ADD CONSTRAINT conversation_turns_posture_valid
      CHECK (posture_at_creation IN ('normal', 'sanctuary', 'unknown-historical'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. Mint gate on conversation_turns (constitutional sentence 2, structural).
--    A new turn row must carry:
--      - posture_at_creation = 'normal'  (sanctuary rows must never persist —
--        this is the DB-level backstop for S1; 'unknown-historical' may never
--        be minted anew)
--      - complete provenance (all six constitutional keys)
--    No layer trusts a caller: even raw SQL cannot write an unattested turn.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION s5_require_minted_provenance() RETURNS trigger AS $$
BEGIN
  IF NEW.posture_at_creation IS DISTINCT FROM 'normal' THEN
    RAISE EXCEPTION '[PROVENANCE] mint failed — % INSERT refused: posture % is not writable (sanctuary never persists; unknown-historical is never minted anew)',
      TG_TABLE_NAME, COALESCE(NEW.posture_at_creation, 'NULL');
  END IF;
  IF NEW.provenance IS NULL
     OR NOT (NEW.provenance ? 'createdBy')
     OR NOT (NEW.provenance ? 'generatedBy')
     OR NOT (NEW.provenance ? 'postureAtCreation')
     OR NOT (NEW.provenance ? 'sourceContainer')
     OR NOT (NEW.provenance ? 'source')
     OR NOT (NEW.provenance ? 'persistencePolicy') THEN
    RAISE EXCEPTION '[PROVENANCE] mint failed — % INSERT refused: provenance missing or incomplete',
      TG_TABLE_NAME;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS s5_require_minted_provenance_trigger ON conversation_turns;
CREATE TRIGGER s5_require_minted_provenance_trigger
  BEFORE INSERT ON conversation_turns
  FOR EACH ROW EXECUTE FUNCTION s5_require_minted_provenance();

COMMENT ON COLUMN conversation_turns.posture_at_creation IS
'S5: the consent posture in force when this turn occurred. unknown-historical = row predates the provenance constitution (truthful; never backfilled to normal).';
COMMENT ON COLUMN conversation_turns.provenance IS
'S5: server-minted, immutable at creation. Keys: createdBy, generatedBy, postureAtCreation, sourceContainer, source, persistencePolicy. Correction means a new object with derivation lineage, never an edit.';

-- ----------------------------------------------------------------------------
-- 6. Memory atoms — posture + typed generation source.
--    Historical corpus becomes 'unknown-historical' / 'unattributed-historical'
--    explicitly. Both live writers are updated in the same change that ships
--    this migration, so the mint gate below is safe to arm.
-- ----------------------------------------------------------------------------
ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT NOT NULL DEFAULT 'unknown-historical',
  ADD COLUMN IF NOT EXISTS generated_by TEXT NOT NULL DEFAULT 'unattributed-historical';

ALTER TABLE member_memory_atoms ALTER COLUMN posture_at_creation DROP DEFAULT;
ALTER TABLE member_memory_atoms ALTER COLUMN generated_by DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_memory_atoms_posture_valid'
  ) THEN
    ALTER TABLE member_memory_atoms ADD CONSTRAINT member_memory_atoms_posture_valid
      CHECK (posture_at_creation IN ('normal', 'sanctuary', 'unknown-historical'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_memory_atoms_generated_by_valid'
  ) THEN
    ALTER TABLE member_memory_atoms ADD CONSTRAINT member_memory_atoms_generated_by_valid
      CHECK (generated_by IN (
        'member-gesture', 'member-utterance', 'inference', 'synthesis',
        'derivation', 'practitioner-observation', 'unattributed-historical'
      ));
  END IF;
END $$;

-- Atoms mint gate: same rule as turns — new atoms must be posture 'normal'
-- and must state how they were generated ('unattributed-historical' is a
-- historical truth, never a new mint).
CREATE OR REPLACE FUNCTION s5_require_atom_attestation() RETURNS trigger AS $$
BEGIN
  IF NEW.posture_at_creation IS DISTINCT FROM 'normal' THEN
    RAISE EXCEPTION '[PROVENANCE] mint failed — member_memory_atoms INSERT refused: posture % is not writable',
      COALESCE(NEW.posture_at_creation, 'NULL');
  END IF;
  IF NEW.generated_by IS NULL OR NEW.generated_by = 'unattributed-historical' THEN
    RAISE EXCEPTION '[PROVENANCE] mint failed — member_memory_atoms INSERT refused: generated_by % is not mintable',
      COALESCE(NEW.generated_by, 'NULL');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS s5_require_atom_attestation_trigger ON member_memory_atoms;
CREATE TRIGGER s5_require_atom_attestation_trigger
  BEFORE INSERT ON member_memory_atoms
  FOR EACH ROW EXECUTE FUNCTION s5_require_atom_attestation();

-- Unknown-historical atoms are permanently ineligible for NEW collective
-- eligibility (constitution §7): crossing_allowed may not be newly enabled on
-- an unattested atom. Existing values are left untouched — a member gesture
-- that already set them is itself provenance; revoking silently would punish
-- the member for the system's past.
CREATE OR REPLACE FUNCTION s5_refuse_unknown_collective() RETURNS trigger AS $$
BEGIN
  IF NEW.posture_at_creation = 'unknown-historical'
     AND NEW.crossing_allowed = TRUE
     AND (TG_OP = 'INSERT' OR OLD.crossing_allowed IS DISTINCT FROM NEW.crossing_allowed) THEN
    RAISE EXCEPTION '[PROVENANCE] refused — unknown-historical atom may not become collective-eligible (id=%)',
      left(NEW.id::text, 12);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS s5_refuse_unknown_collective_trigger ON member_memory_atoms;
CREATE TRIGGER s5_refuse_unknown_collective_trigger
  BEFORE INSERT OR UPDATE ON member_memory_atoms
  FOR EACH ROW EXECUTE FUNCTION s5_refuse_unknown_collective();

-- ----------------------------------------------------------------------------
-- 7. Partially-wired lanes: episodic_memories, member_theme_signals,
--    agent_runs, integration_passes. These gain the posture column with an
--    honest historical backfill; NULL on a new row means "post-S5 write from a
--    not-yet-wired writer" — truthfully distinct from 'unknown-historical'.
--    Strict mint gates arm lane-by-lane as their writers are wired
--    (episodic mark route and corpus callosum are wired in this change).
-- ----------------------------------------------------------------------------
ALTER TABLE episodic_memories
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT DEFAULT 'unknown-historical';
ALTER TABLE episodic_memories ALTER COLUMN posture_at_creation DROP DEFAULT;

ALTER TABLE member_theme_signals
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT DEFAULT 'unknown-historical';
ALTER TABLE member_theme_signals ALTER COLUMN posture_at_creation DROP DEFAULT;

DO $$
BEGIN
  IF to_regclass('public.agent_runs') IS NOT NULL THEN
    EXECUTE $sql$ALTER TABLE agent_runs
      ADD COLUMN IF NOT EXISTS posture_at_creation TEXT DEFAULT 'unknown-historical'$sql$;
    EXECUTE 'ALTER TABLE agent_runs ALTER COLUMN posture_at_creation DROP DEFAULT';
  END IF;
  IF to_regclass('public.integration_passes') IS NOT NULL THEN
    EXECUTE $sql$ALTER TABLE integration_passes
      ADD COLUMN IF NOT EXISTS posture_at_creation TEXT DEFAULT 'unknown-historical'$sql$;
    EXECUTE 'ALTER TABLE integration_passes ALTER COLUMN posture_at_creation DROP DEFAULT';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'episodic_memories_posture_valid') THEN
    ALTER TABLE episodic_memories ADD CONSTRAINT episodic_memories_posture_valid
      CHECK (posture_at_creation IS NULL OR posture_at_creation IN ('normal', 'sanctuary', 'unknown-historical'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'member_theme_signals_posture_valid') THEN
    ALTER TABLE member_theme_signals ADD CONSTRAINT member_theme_signals_posture_valid
      CHECK (posture_at_creation IS NULL OR posture_at_creation IN ('normal', 'sanctuary', 'unknown-historical'));
  END IF;
  IF to_regclass('public.agent_runs') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_runs_posture_valid') THEN
    ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_posture_valid
      CHECK (posture_at_creation IS NULL OR posture_at_creation IN ('normal', 'sanctuary', 'unknown-historical'));
  END IF;
  IF to_regclass('public.integration_passes') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'integration_passes_posture_valid') THEN
    ALTER TABLE integration_passes ADD CONSTRAINT integration_passes_posture_valid
      CHECK (posture_at_creation IS NULL OR posture_at_creation IN ('normal', 'sanctuary', 'unknown-historical'));
  END IF;
END $$;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'S5 provenance substrate: runtime_consent_state + deletion manifests/tombstones + restore refusal triggers + turn/atom mint gates applied';
END $$;
