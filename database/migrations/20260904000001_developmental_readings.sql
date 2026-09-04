-- BUILD-07C — DEVELOPMENTAL READING · persistence: ONE additive table.
--
-- CONSTITUTIONAL POSITION (docs/programme/WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md;
-- founder opening rulings 2026-09-04):
--
--   - A READING IS A RECORD OF WHAT MAIA NOTICED, FROZEN. Its identity is
--     minted here, by the database, before it is returned (INV-1); every
--     observation lives INSIDE the frozen reading and is addressable as
--     (reading_id, observationKey) (INV-2); the pair outlives the response
--     that produced it (INV-3).
--
--   - INSERT-ONLY. A frozen reading is never corrected in place (INV-4): a
--     trigger refuses any UPDATE. A correction is a new reading with a new id.
--     A superseded reading is retained (INV-22): the application has no
--     DELETE; rows go only with their manuscript (ON DELETE CASCADE), which
--     is the member deleting their Work.
--
--   - NO MANUSCRIPT PROSE. `read_state` is the BUILD-07A frozen state — ids,
--     code-point ranges, digests, topology, the member's own division labels;
--     `coverage` is depth per section; `observations` carry MAIA's observation
--     text, keys, lens, phenomenon, evidence refs and non-conclusions. The
--     observation text is hers and must survive — it is the durable thing a
--     writer will encounter. No manuscript body is copied here; the store
--     refuses a state payload that grew a text-bearing key.
--
--   - OBSERVATION-ONLY v1. The insert trigger admits exactly the observation
--     fields the contract names and refuses any other key — so interpretation,
--     questions, possibilities, uncertainty, severity, priority, confidence,
--     score and rank cannot be stored by any caller.
--
--   - TWO PARTICIPANTS, RECORDED APART (INV-25). `reader_provenance` names
--     which intelligence produced the words (DEVELOPMENTAL-READER-01, resolved
--     model, prompt hash); `classifier_provenance` names which classified them
--     (DEVELOPMENTAL-PHENOMENON-01, resolved model, prompt hash), and is NULL
--     exactly when the outcome is `none`. `frozen_at` is the database's stamp.
--
--   - `outcome` DISCRIMINATES (INV-0): `none` ⇔ zero observations, enforced by
--     CHECK.
--
-- CLASS B. Additive: no existing manuscript schema is read, moved or
-- rewritten. ROLLBACK POSTURE: code reverts cleanly; the table is left INERT
-- if it has ever received a reading — a destructive DROP is not promised as
-- rollback, because a frozen reading is a record a later author act may
-- refer back to (INV-22). The manual DROP below exists for an EMPTY table only.
--
-- Authority: docs/programme/JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01.md
--            (2026-09-04 · BUILD-07C DEVELOPMENTAL READING — OPEN)

BEGIN;

CREATE TABLE IF NOT EXISTS developmental_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The existing canonical Work identity that BUILD-07A evidence is keyed by;
  -- the same ownership convention as manuscript_structure_proposals.
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  -- The member whose evidence was captured. Scopes every read.
  member_id uuid NOT NULL,
  draft_id uuid NOT NULL,
  revision_number integer NOT NULL CHECK (revision_number >= 1),
  commissioned_lens text NOT NULL CHECK (commissioned_lens IN
    ('structure', 'development', 'continuity', 'arc', 'voice', 'coherence', 'reader')),
  scope jsonb NOT NULL,
  -- BUILD-07A DevelopmentalReadState, inline; structure context inside it. No prose.
  read_state jsonb NOT NULL,
  coverage jsonb NOT NULL,
  input_fingerprint text NOT NULL CHECK (length(input_fingerprint) > 0),
  outcome text NOT NULL CHECK (outcome IN ('reading', 'none')),
  -- [{ key, lens, phenomenon, evidenceRefs, observation, doesNotEstablish, structureDependency }]
  observations jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(observations) = 'array'),
  reader_provenance jsonb NOT NULL,
  classifier_provenance jsonb,
  frozen_at timestamptz NOT NULL DEFAULT now(),
  -- INV-0 — the outcome discriminates the observations, both directions.
  CONSTRAINT developmental_readings_outcome_observations CHECK (
    (outcome = 'none'    AND jsonb_array_length(observations) = 0 AND classifier_provenance IS NULL)
    OR
    (outcome = 'reading' AND jsonb_array_length(observations) > 0 AND classifier_provenance IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_developmental_readings_manuscript
  ON developmental_readings(manuscript_id, frozen_at DESC);
CREATE INDEX IF NOT EXISTS idx_developmental_readings_member
  ON developmental_readings(member_id, frozen_at DESC);

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

-- The observation shape, enforced at insert: exactly the v1 fields, keys
-- o1…oN in position order, the closed lens and phenomenon sets, non-empty
-- text, refs and non-conclusions. A key outside the set — interpretation,
-- questions, possibilities, uncertainty, severity … — is refused.
CREATE OR REPLACE FUNCTION developmental_readings_observations_check()
RETURNS TRIGGER AS $$
DECLARE
  o jsonb;
  i integer := 0;
  k text;
BEGIN
  FOR o IN SELECT * FROM jsonb_array_elements(NEW.observations) LOOP
    i := i + 1;
    IF jsonb_typeof(o) <> 'object' THEN
      RAISE EXCEPTION 'observation % is not an object', i;
    END IF;
    FOR k IN SELECT jsonb_object_keys(o) LOOP
      IF k NOT IN ('key', 'lens', 'phenomenon', 'evidenceRefs', 'observation', 'doesNotEstablish', 'structureDependency') THEN
        RAISE EXCEPTION 'observation % carries field "%", which v1 does not authorize', i, k;
      END IF;
    END LOOP;
    IF (o->>'key') IS DISTINCT FROM ('o' || i::text) THEN
      RAISE EXCEPTION 'observation % has key %, expected o%', i, o->>'key', i;
    END IF;
    IF (o->>'lens') NOT IN ('structure', 'development', 'continuity', 'arc', 'voice', 'coherence', 'reader') THEN
      RAISE EXCEPTION 'observation % has lens %, outside the canonical seven', i, o->>'lens';
    END IF;
    IF (o->>'phenomenon') NOT IN ('recurrence', 'unresolved-thread', 'register-shift', 'prospective-reference',
                                  're-explanation-first-mention', 'movement', 'term-drift', 'positional-asymmetry') THEN
      RAISE EXCEPTION 'observation % has phenomenon %, outside the v1 family of eight', i, o->>'phenomenon';
    END IF;
    IF length(trim(coalesce(o->>'observation', ''))) = 0 THEN
      RAISE EXCEPTION 'observation % has no text', i;
    END IF;
    IF jsonb_typeof(o->'evidenceRefs') <> 'array' OR jsonb_array_length(o->'evidenceRefs') = 0 THEN
      RAISE EXCEPTION 'observation % rests on no evidence', i;
    END IF;
    IF jsonb_typeof(o->'doesNotEstablish') <> 'array' OR jsonb_array_length(o->'doesNotEstablish') = 0 THEN
      RAISE EXCEPTION 'observation % states nothing it does not establish', i;
    END IF;
    IF (o->'structureDependency'->>'kind') NOT IN ('independent', 'authored-structure') THEN
      RAISE EXCEPTION 'observation % has an unknown structureDependency', i;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS developmental_readings_observations ON developmental_readings;
CREATE TRIGGER developmental_readings_observations
  BEFORE INSERT ON developmental_readings
  FOR EACH ROW EXECUTE FUNCTION developmental_readings_observations_check();

COMMENT ON TABLE developmental_readings IS
  'BUILD-07C. A frozen developmental reading of a Work: identity, scope, the 07A read state (no prose), coverage, observations (MAIA''s text, keyed o1…oN), reader + classifier provenance, outcome. INSERT-ONLY by trigger.';
COMMENT ON COLUMN developmental_readings.read_state IS
  'BUILD-07A DevelopmentalReadState: ids, code-point ranges, digests, topology, frozen authored-structure labels. Carries no character of the Work.';
COMMENT ON COLUMN developmental_readings.observations IS
  'What MAIA noticed, one element per accepted reader claim, verbatim text, addressed as (id, key). Observation-only v1: the insert trigger refuses any other field.';
COMMENT ON COLUMN developmental_readings.classifier_provenance IS
  'DEVELOPMENTAL-PHENOMENON-01: provider, resolved model, prompt hash. NULL exactly when outcome = none.';

COMMIT;

-- ROLLBACK (manual, EMPTY TABLE ONLY):
--   If the table has ever received a reading, leave it inert — a frozen
--   reading is a record (INV-22). Nothing else references it.
--
--   DROP TRIGGER IF EXISTS developmental_readings_observations ON developmental_readings;
--   DROP TRIGGER IF EXISTS developmental_readings_immutable_check ON developmental_readings;
--   DROP FUNCTION IF EXISTS developmental_readings_observations_check();
--   DROP FUNCTION IF EXISTS developmental_readings_immutable();
--   DROP TABLE IF EXISTS developmental_readings;
