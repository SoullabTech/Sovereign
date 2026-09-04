-- WS2-07-F1 · BUILD-07C POST-ACCEPTANCE CONTRACT CORRECTION — reading contract v2
--
-- GOVERNANCE. BUILD-07C remains CLOSED / ACCEPTED historically. It was accepted
-- against the contract and evidence available then; production-shaped evidence
-- gathered afterwards exposed a defect acceptance could not have revealed:
--
--     a descriptive taxonomy was given veto power over developmental observation.
--
-- Acceptance history is immutable. Corrective evolution is recorded forward.
-- This migration is that forward record. It does not rewrite 20260904000001.
--
-- THE PRINCIPLE, which this migration exists to enforce:
--
--     Observation has ontological priority over classification: the taxonomy
--     may describe a developmental observation, but it may neither manufacture
--     one nor veto one.
--
-- WHAT CHANGES. Exactly one thing: `phenomenon` may be ABSENT from an
-- observation. Everything else in the observation shape is untouched.
--
--   phenomenon absent   PERMITTED  (new — the classifier ran and declined)
--   phenomenon present  must still be one of the eight, else RAISE (unchanged)
--   phenomenon null     REFUSED    (omission is the only representation of
--                                   "no taxonomy claim"; two serialized states
--                                   with no semantic distinction is the thing
--                                   being avoided)
--   unknown keys        still RAISE (unchanged)
--   key / lens / observation / evidenceRefs / doesNotEstablish /
--   structureDependency                    all still REQUIRED (unchanged)
--
-- NO BACKFILL. NO REWRITE. NO RE-VALIDATION.
--
-- Every existing row carries a singular phenomenon from the eight — a valid
-- artifact of the contract and reader/classifier versions it was frozen under.
-- Those values are provenance, not data to homogenise. This migration is safe
-- for them by construction: it RELAXES a constraint, so stored rows satisfy the
-- relaxed form automatically, and this is a write-time trigger that does not
-- re-fire on rows already present. The table, its rows, and its insert-only
-- character are untouched.
--
-- READING CONTRACT VERSION. v1 is identified by the ABSENCE of
-- `provenance.readingContractVersion`. It is never backfilled: a historical
-- row's missing version IS the evidence of the legacy contract. New readings
-- carry DEVELOPMENTAL-READING-CONTRACT-02. No constraint is added for it here,
-- deliberately — requiring it would invalidate every v1 row.

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
        RAISE EXCEPTION 'observation % carries field "%", which the reading contract does not authorize', i, k;
      END IF;
    END LOOP;
    IF (o->>'key') IS DISTINCT FROM ('o' || i::text) THEN
      RAISE EXCEPTION 'observation % has key %, expected o%', i, o->>'key', i;
    END IF;
    IF (o->>'lens') NOT IN ('structure', 'development', 'continuity', 'arc', 'voice', 'coherence', 'reader') THEN
      RAISE EXCEPTION 'observation % has lens %, outside the canonical seven', i, o->>'lens';
    END IF;

    -- v2 — the taxonomy no longer vetoes the observation.
    -- Absent is permitted. Present must be one of the eight. Explicit null is
    -- refused so that "no taxonomy claim" has exactly one representation.
    IF o ? 'phenomenon' THEN
      IF jsonb_typeof(o->'phenomenon') = 'null' THEN
        RAISE EXCEPTION 'observation % has phenomenon null; omit the field instead', i;
      END IF;
      IF (o->>'phenomenon') NOT IN ('recurrence', 'unresolved-thread', 'register-shift', 'prospective-reference',
                                    're-explanation-first-mention', 'movement', 'term-drift', 'positional-asymmetry') THEN
        RAISE EXCEPTION 'observation % has phenomenon %, outside the family of eight', i, o->>'phenomenon';
      END IF;
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

-- The trigger binding is unchanged; only the function body is replaced.
