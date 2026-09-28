-- WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C2
-- Themes: eighth developmental lens + durable Work Theme governance.
--
-- Forward-only:
--   * historical developmental readings remain untouched;
--   * new Themes observations require a frozen MAIA-authored themeLabel;
--   * Work Theme identity is separate from observation identity;
--   * member Accept / Rename / Reject / Restore acts are append-only.
--
-- Authority:
--   docs/programme/WRITERS-STUDIO-FLAGSHIP-ROADMAP-01_D5C1_THEMES_GOVERNED_SUBSTRATE_CONTRACT_2026-09-26.md

BEGIN;

-- ── 1. Eight-lens developmental-reading vocabulary ──────────────────────────
ALTER TABLE developmental_readings
  DROP CONSTRAINT IF EXISTS developmental_readings_commissioned_lens_check;

ALTER TABLE developmental_readings
  ADD CONSTRAINT developmental_readings_commissioned_lens_check
  CHECK (commissioned_lens IN (
    'structure', 'development', 'continuity', 'arc',
    'themes', 'voice', 'coherence', 'reader'
  ));

-- The canonical JSON observation guard remains closed. D5C2 adds exactly one
-- optional field, themeLabel, and permits it only for the Themes lens.
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
      'structure', 'development', 'continuity', 'arc',
      'themes', 'voice', 'coherence', 'reader'
    ) THEN
      RAISE EXCEPTION
        'observation % has lens %, outside the canonical eight',
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

-- ── 2. Durable Work Theme identity ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS writer_studio_work_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  provenance_kind text NOT NULL CHECK (provenance_kind IN (
    'member-declared', 'template-selected', 'textual-entity', 'maia-observation'
  )),

  initial_label text NOT NULL
    CHECK (length(trim(initial_label)) BETWEEN 1 AND 120),

  source_reading_id uuid REFERENCES developmental_readings(id) ON DELETE CASCADE,
  source_observation_id text,
  template_name text,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT writer_studio_work_themes_source_shape CHECK (
    (
      provenance_kind = 'maia-observation'
      AND source_reading_id IS NOT NULL
      AND source_observation_id IS NOT NULL
      AND length(trim(source_observation_id)) > 0
      AND template_name IS NULL
    )
    OR (
      provenance_kind = 'template-selected'
      AND source_reading_id IS NULL
      AND source_observation_id IS NULL
      AND template_name IS NOT NULL
      AND length(trim(template_name)) > 0
    )
    OR (
      provenance_kind IN ('member-declared', 'textual-entity')
      AND source_reading_id IS NULL
      AND source_observation_id IS NULL
      AND template_name IS NULL
    )
  ),

  UNIQUE (id, member_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_writer_studio_work_theme_maia_source
  ON writer_studio_work_themes(member_id, manuscript_id, source_reading_id, source_observation_id)
  WHERE provenance_kind = 'maia-observation';

CREATE INDEX IF NOT EXISTS idx_writer_studio_work_themes_work
  ON writer_studio_work_themes(member_id, manuscript_id, created_at);

-- ── 3. Append-only member governance ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS writer_studio_work_theme_events (
  id bigserial PRIMARY KEY,
  theme_id uuid NOT NULL,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'accept', 'rename', 'reject', 'restore'
  )),
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT writer_studio_work_theme_event_owner_fkey
    FOREIGN KEY (theme_id, member_id)
    REFERENCES writer_studio_work_themes(id, member_id)
    ON DELETE CASCADE,

  CONSTRAINT writer_studio_work_theme_event_label_shape CHECK (
    (event_type = 'rename' AND label IS NOT NULL
      AND length(trim(label)) BETWEEN 1 AND 120)
    OR
    (event_type <> 'rename' AND label IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_writer_studio_work_theme_events_theme
  ON writer_studio_work_theme_events(theme_id, created_at, id);

-- Events are historical acts. UPDATE is always refused. Direct/pruning
-- DELETE is refused while both of the event's custody parents still exist.
-- A lawful FK cascade is distinguishable because at least one parent is already
-- absent when the child BEFORE DELETE trigger runs.
CREATE OR REPLACE FUNCTION writer_studio_work_theme_events_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION
      'writer studio theme event % is immutable; append a successor event',
      OLD.id;
  END IF;

  IF TG_OP = 'DELETE'
     AND EXISTS (
       SELECT 1 FROM writer_studio_work_themes
       WHERE id = OLD.theme_id AND member_id = OLD.member_id
     )
     AND EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION
      'writer studio theme event % may be deleted only by lawful parent custody cascade',
      OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_work_theme_events_immutable_check
  ON writer_studio_work_theme_events;

CREATE TRIGGER writer_studio_work_theme_events_immutable_check
  BEFORE UPDATE OR DELETE ON writer_studio_work_theme_events
  FOR EACH ROW EXECUTE FUNCTION writer_studio_work_theme_events_immutable();

CREATE OR REPLACE FUNCTION writer_studio_work_theme_events_refuse_truncate()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'TRUNCATE refused on writer_studio_work_theme_events; events leave custody only with their parent';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_work_theme_events_no_truncate
  ON writer_studio_work_theme_events;
CREATE TRIGGER writer_studio_work_theme_events_no_truncate
  BEFORE TRUNCATE ON writer_studio_work_theme_events
  FOR EACH STATEMENT EXECUTE FUNCTION writer_studio_work_theme_events_refuse_truncate();

COMMIT;
