-- WRITERS-STUDIO-CHAPTER-FIRST-IMPRESSION-R1
-- Adds one governed developmental lens: overview.
-- Forward-only. Existing readings and Themes governance remain unchanged.

BEGIN;

SET LOCAL lock_timeout = '5s';

ALTER TABLE developmental_readings
  DROP CONSTRAINT IF EXISTS developmental_readings_commissioned_lens_check;

ALTER TABLE developmental_readings
  ADD CONSTRAINT developmental_readings_commissioned_lens_check
  CHECK (commissioned_lens IN (
    'overview', 'structure', 'development', 'continuity', 'arc',
    'themes', 'voice', 'coherence', 'reader'
  ));

CREATE OR REPLACE FUNCTION developmental_readings_observations_check()
RETURNS TRIGGER AS $$
DECLARE
  o jsonb;
  i integer := 0;
  k text;
  identity_field_count integer;
  position_key_count integer;
BEGIN
  FOR o IN SELECT * FROM jsonb_array_elements(NEW.observations) LOOP
    i := i + 1;

    IF jsonb_typeof(o) <> 'object' THEN
      RAISE EXCEPTION 'observation % is not an object', i;
    END IF;

    FOR k IN SELECT jsonb_object_keys(o) LOOP
      IF k NOT IN (
        'key', 'lens', 'phenomenon', 'evidenceRefs', 'observation',
        'themeLabel', 'doesNotEstablish', 'structureDependency',
        'observationId', 'admissionIndex', 'basisFingerprint', 'position'
      ) THEN
        RAISE EXCEPTION
          'observation % carries field "%", which the reading contract does not authorize',
          i, k;
      END IF;
    END LOOP;

    identity_field_count :=
      (CASE WHEN o ? 'observationId' THEN 1 ELSE 0 END)
      + (CASE WHEN o ? 'admissionIndex' THEN 1 ELSE 0 END)
      + (CASE WHEN o ? 'basisFingerprint' THEN 1 ELSE 0 END)
      + (CASE WHEN o ? 'position' THEN 1 ELSE 0 END);

    IF identity_field_count NOT IN (0, 4) THEN
      RAISE EXCEPTION
        'observation % carries a partial canonical identity group (% of 4 fields)',
        i, identity_field_count;
    END IF;

    IF identity_field_count = 4 THEN
      IF jsonb_typeof(o->'observationId') <> 'string'
         OR length(trim(coalesce(o->>'observationId', ''))) = 0
         OR (o->>'observationId') !~ '^dobs_.+$' THEN
        RAISE EXCEPTION 'observation % has malformed observationId', i;
      END IF;

      IF jsonb_typeof(o->'admissionIndex') <> 'number'
         OR (o->>'admissionIndex') !~ '^[0-9]+$'
         OR (o->>'admissionIndex')::integer <> i - 1 THEN
        RAISE EXCEPTION
          'observation % has admissionIndex %, expected %',
          i, o->>'admissionIndex', i - 1;
      END IF;

      IF jsonb_typeof(o->'basisFingerprint') <> 'string'
         OR (o->>'basisFingerprint') !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'observation % has malformed basisFingerprint', i;
      END IF;

      IF jsonb_typeof(o->'position') = 'null' THEN
        NULL;
      ELSIF jsonb_typeof(o->'position') = 'object' THEN
        SELECT count(*) INTO position_key_count
          FROM jsonb_object_keys(o->'position');

        IF position_key_count <> 2
           OR NOT ((o->'position') ? 'sectionPosition')
           OR NOT ((o->'position') ? 'codePointStart')
           OR EXISTS (
             SELECT 1 FROM jsonb_object_keys(o->'position') AS pkey
              WHERE pkey NOT IN ('sectionPosition', 'codePointStart')
           ) THEN
          RAISE EXCEPTION 'observation % has malformed position keys', i;
        END IF;

        IF jsonb_typeof(o->'position'->'sectionPosition') <> 'number'
           OR (o->'position'->>'sectionPosition') !~ '^[0-9]+$'
           OR jsonb_typeof(o->'position'->'codePointStart') <> 'number'
           OR (o->'position'->>'codePointStart') !~ '^[0-9]+$' THEN
          RAISE EXCEPTION 'observation % has malformed position values', i;
        END IF;
      ELSE
        RAISE EXCEPTION 'observation % position must be an object or null', i;
      END IF;
    END IF;

    IF (o->>'key') IS DISTINCT FROM ('o' || i::text) THEN
      RAISE EXCEPTION 'observation % has key %, expected o%', i, o->>'key', i;
    END IF;

    IF (o->>'lens') NOT IN (
      'overview', 'structure', 'development', 'continuity', 'arc',
      'themes', 'voice', 'coherence', 'reader'
    ) THEN
      RAISE EXCEPTION
        'observation % has lens %, outside the canonical nine',
        i, o->>'lens';
    END IF;

    IF (o->>'lens') = 'themes' THEN
      IF jsonb_typeof(o->'themeLabel') <> 'string'
         OR length(trim(coalesce(o->>'themeLabel', ''))) = 0
         OR length(trim(o->>'themeLabel')) > 120 THEN
        RAISE EXCEPTION
          'Themes observation % requires themeLabel of 1-120 characters',
          i;
      END IF;
    ELSIF o ? 'themeLabel' THEN
      RAISE EXCEPTION
        'observation % carries themeLabel outside the Themes lens',
        i;
    END IF;

    IF o ? 'phenomenon' THEN
      IF jsonb_typeof(o->'phenomenon') = 'null' THEN
        RAISE EXCEPTION
          'observation % has phenomenon null; omit the field instead',
          i;
      END IF;
      IF (o->>'phenomenon') NOT IN (
        'recurrence', 'unresolved-thread', 'register-shift',
        'prospective-reference', 're-explanation-first-mention',
        'movement', 'term-drift', 'positional-asymmetry'
      ) THEN
        RAISE EXCEPTION
          'observation % has phenomenon %, outside the family of eight',
          i, o->>'phenomenon';
      END IF;
    END IF;

    IF length(trim(coalesce(o->>'observation', ''))) = 0 THEN
      RAISE EXCEPTION 'observation % has no text', i;
    END IF;

    IF jsonb_typeof(o->'evidenceRefs') <> 'array'
       OR jsonb_array_length(o->'evidenceRefs') = 0 THEN
      RAISE EXCEPTION 'observation % rests on no evidence', i;
    END IF;

    IF jsonb_typeof(o->'doesNotEstablish') <> 'array'
       OR jsonb_array_length(o->'doesNotEstablish') = 0 THEN
      RAISE EXCEPTION
        'observation % states nothing it does not establish',
        i;
    END IF;

    IF (o->'structureDependency'->>'kind')
       NOT IN ('independent', 'authored-structure') THEN
      RAISE EXCEPTION
        'observation % has an unknown structureDependency',
        i;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
