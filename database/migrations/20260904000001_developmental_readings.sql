-- BUILD-07C — DEVELOPMENTAL READING · persistence, minimal.
--
-- CONSTITUTIONAL POSITION (docs/programme/WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md):
--
--   - A READING IS A RECORD OF WHAT MAIA NOTICED, FROZEN. Its identity is
--     minted here, by the database, before it is returned (INV-1); every
--     observation is addressable as (reading_id, observation_key) (INV-2); the
--     pair outlives the response that produced it (INV-3).
--
--   - A FROZEN READING IS NEVER CORRECTED IN PLACE (INV-4). A trigger refuses
--     any UPDATE to either table. A correction is a new reading with a new id.
--
--   - A SUPERSEDED READING IS RETAINED (INV-22). The application layer has no
--     DELETE; rows go only with their manuscript (ON DELETE CASCADE), which is
--     the member deleting their Work.
--
--   - NO MEMBER PROSE. `read_state` is the BUILD-07A frozen state — ids,
--     code-point ranges, digests, topology, the member's own division labels —
--     and `coverage` is depth per section. Neither carries a character of the
--     Work; the store refuses a payload that grew a text-bearing key. The
--     `observation` column holds MAIA's claim text, verbatim from the reader,
--     which is hers, not the Work's.
--
--   - OBSERVATION-ONLY v1 (founder ruling 2026-09-04). There is no column for
--     interpretation, questions, possibilities, uncertainty, severity,
--     priority, confidence, score or rank. A column that exists gets
--     populated; absence is the enforcement.
--
--   - `outcome` DISCRIMINATES (INV-0). A `none` reading may hold no
--     observations, enforced by trigger; a `reading` must hold at least one,
--     enforced by the store's single transaction.
--
-- Additive. No existing row is read, moved or rewritten.
--
-- Authority: docs/programme/JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01.md
--            (2026-09-04 · BUILD-07C DEVELOPMENTAL READING — OPEN)

BEGIN;

CREATE TABLE IF NOT EXISTS developmental_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  -- The member whose evidence was captured. Scopes every read. No FK to
  -- members: the row belongs to the manuscript, exactly as proposals do.
  member_id uuid NOT NULL,
  draft_id uuid NOT NULL,
  revision_number integer NOT NULL CHECK (revision_number >= 1),
  commissioned_lens text NOT NULL CHECK (commissioned_lens IN
    ('structure', 'development', 'continuity', 'arc', 'voice', 'coherence', 'reader')),
  scope jsonb NOT NULL,
  -- BUILD-07A DevelopmentalReadState, inline. Frozen. No prose.
  read_state jsonb NOT NULL,
  coverage jsonb NOT NULL,
  input_fingerprint text NOT NULL CHECK (length(input_fingerprint) > 0),
  outcome text NOT NULL CHECK (outcome IN ('reading', 'none')),
  -- { reader: ReaderIdentity, classifier: ClassifierIdentity | null }. frozen_at lives in its own column.
  provenance jsonb NOT NULL,
  frozen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_developmental_readings_manuscript
  ON developmental_readings(manuscript_id, frozen_at DESC);
CREATE INDEX IF NOT EXISTS idx_developmental_readings_member
  ON developmental_readings(member_id, frozen_at DESC);

CREATE TABLE IF NOT EXISTS developmental_observations (
  reading_id uuid NOT NULL REFERENCES developmental_readings(id) ON DELETE CASCADE,
  -- Reading-internal, stable for the life of the reading: o1, o2 … (INV-2).
  observation_key text NOT NULL CHECK (observation_key ~ '^o[1-9][0-9]*$'),
  position integer NOT NULL CHECK (position >= 0),
  lens text NOT NULL CHECK (lens IN
    ('structure', 'development', 'continuity', 'arc', 'voice', 'coherence', 'reader')),
  -- UNDERSTAND §4, verbatim. No new taxonomy in implementation.
  phenomenon text NOT NULL CHECK (phenomenon IN
    ('recurrence', 'unresolved-thread', 'register-shift', 'prospective-reference',
     're-explanation', 'movement', 'term-drift', 'positional-asymmetry')),
  -- NonEmptyArray<EvidenceRef>, 07A vocabulary. Re-bound before the freeze.
  evidence_refs jsonb NOT NULL,
  -- MAIA's claim text, verbatim. Required (INV-13).
  observation text NOT NULL CHECK (length(trim(observation)) > 0),
  -- NonEmptyArray<DevelopmentalNonConclusion>, carried from the reader.
  does_not_establish jsonb NOT NULL,
  structure_dependency text NOT NULL CHECK (structure_dependency IN ('independent', 'authored-structure')),
  PRIMARY KEY (reading_id, observation_key),
  UNIQUE (reading_id, position)
);

-- INV-4 — never corrected in place. Any UPDATE aborts.
CREATE OR REPLACE FUNCTION developmental_readings_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'developmental reading % is immutable: a frozen reading is never corrected in place; a correction is a new reading',
    OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS developmental_readings_immutable_check ON developmental_readings;
CREATE TRIGGER developmental_readings_immutable_check
  BEFORE UPDATE ON developmental_readings
  FOR EACH ROW EXECUTE FUNCTION developmental_readings_immutable();

CREATE OR REPLACE FUNCTION developmental_observations_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'developmental observation (%, %) is immutable: a frozen reading is never corrected in place',
    OLD.reading_id, OLD.observation_key;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS developmental_observations_immutable_check ON developmental_observations;
CREATE TRIGGER developmental_observations_immutable_check
  BEFORE UPDATE ON developmental_observations
  FOR EACH ROW EXECUTE FUNCTION developmental_observations_immutable();

-- INV-0 — a `none` reading holds no observations.
CREATE OR REPLACE FUNCTION developmental_observations_outcome_check()
RETURNS TRIGGER AS $$
DECLARE
  o text;
BEGIN
  SELECT outcome INTO o FROM developmental_readings WHERE id = NEW.reading_id;
  IF o IS NULL THEN
    RAISE EXCEPTION 'observation names reading %, which does not exist', NEW.reading_id;
  END IF;
  IF o = 'none' THEN
    RAISE EXCEPTION 'reading % has outcome none and cannot carry observations', NEW.reading_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS developmental_observations_outcome ON developmental_observations;
CREATE TRIGGER developmental_observations_outcome
  BEFORE INSERT ON developmental_observations
  FOR EACH ROW EXECUTE FUNCTION developmental_observations_outcome_check();

COMMENT ON TABLE developmental_readings IS
  'BUILD-07C. A frozen developmental reading of a Work: identity, scope, the 07A read state (no prose), coverage, provenance, outcome. IMMUTABLE by trigger.';
COMMENT ON TABLE developmental_observations IS
  'BUILD-07C. What MAIA noticed, one row per accepted reader claim, addressed as (reading_id, observation_key). Observation-only v1: no interpretation, questions, possibilities. IMMUTABLE by trigger.';
COMMENT ON COLUMN developmental_readings.read_state IS
  'BUILD-07A DevelopmentalReadState: ids, code-point ranges, digests, topology, frozen authored-structure labels. Carries no character of the Work.';
COMMENT ON COLUMN developmental_observations.observation IS
  'MAIA''s claim text, verbatim from the DEVELOPMENTAL-READER-01 result. Hers, not the Work''s.';

COMMIT;

-- ROLLBACK (manual):
--   Both tables are referenced by nothing and hold no member prose. Dropping
--   them discards readings and touches no manuscript.
--
--   DROP TRIGGER IF EXISTS developmental_observations_outcome ON developmental_observations;
--   DROP TRIGGER IF EXISTS developmental_observations_immutable_check ON developmental_observations;
--   DROP TRIGGER IF EXISTS developmental_readings_immutable_check ON developmental_readings;
--   DROP FUNCTION IF EXISTS developmental_observations_outcome_check();
--   DROP FUNCTION IF EXISTS developmental_observations_immutable();
--   DROP FUNCTION IF EXISTS developmental_readings_immutable();
--   DROP TABLE IF EXISTS developmental_observations;
--   DROP TABLE IF EXISTS developmental_readings;
