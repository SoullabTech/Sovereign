-- EXP-21 Session Room Policy R3A — append-only Encounter consent decisions.
--
-- Persistence-first only. This migration does not change WebRTC, signaling,
-- TURN, recording, captions, MAIA, or production deployment state.
-- Existing standing grants are retained as legacy provenance at generation 0;
-- they do NOT authorize the new current agreement/generation.

BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE encounters
  ADD COLUMN IF NOT EXISTS consent_agreement_version TEXT,
  ADD COLUMN IF NOT EXISTS consent_generation INTEGER;

UPDATE encounters
SET consent_agreement_version = COALESCE(NULLIF(consent_agreement_version, ''), 'exp21-r3a-v1'),
    consent_generation = COALESCE(consent_generation, 1);

ALTER TABLE encounters
  ALTER COLUMN consent_agreement_version SET DEFAULT 'exp21-r3a-v1',
  ALTER COLUMN consent_agreement_version SET NOT NULL,
  ALTER COLUMN consent_generation SET DEFAULT 1,
  ALTER COLUMN consent_generation SET NOT NULL;

ALTER TABLE encounters DROP CONSTRAINT IF EXISTS encounters_consent_generation_check;
ALTER TABLE encounters ADD CONSTRAINT encounters_consent_generation_check
  CHECK (consent_generation > 0);
ALTER TABLE encounters DROP CONSTRAINT IF EXISTS encounters_consent_agreement_version_check;
ALTER TABLE encounters ADD CONSTRAINT encounters_consent_agreement_version_check
  CHECK (length(btrim(consent_agreement_version)) > 0);

ALTER TABLE encounter_consent_events
  ADD COLUMN IF NOT EXISTS actor_participant_id UUID,
  ADD COLUMN IF NOT EXISTS purpose TEXT,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS agreement_version TEXT,
  ADD COLUMN IF NOT EXISTS generation INTEGER,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legacy_provenance BOOLEAN NOT NULL DEFAULT FALSE;

-- The old discriminator is neutralized below after purpose has captured its
-- meaning. Drop the old NOT NULL first so the backfill itself is lawful.
ALTER TABLE encounter_consent_events
  ALTER COLUMN kind DROP NOT NULL;

-- Preserve old one-row standing grants as dated evidence only.
UPDATE encounter_consent_events
SET actor_participant_id = participant_id,
    purpose = CASE kind
      WHEN 'join' THEN 'join'
      WHEN 'record' THEN 'record_audio'
      WHEN 'share' THEN 'share_artifact'
    END,
    action = 'grant',
    agreement_version = 'legacy-v0',
    generation = 0,
    decided_at = COALESCE(granted_at, created_at, NOW()),
    legacy_provenance = TRUE,
    kind = NULL
WHERE purpose IS NULL;

ALTER TABLE encounter_consent_events
  ALTER COLUMN actor_participant_id SET NOT NULL,
  ALTER COLUMN purpose SET NOT NULL,
  ALTER COLUMN action SET NOT NULL,
  ALTER COLUMN agreement_version SET NOT NULL,
  ALTER COLUMN generation SET NOT NULL,
  ALTER COLUMN decided_at SET DEFAULT clock_timestamp(),
  ALTER COLUMN decided_at SET NOT NULL;

ALTER TABLE encounter_consent_events
  DROP CONSTRAINT IF EXISTS encounter_consent_events_encounter_id_participant_id_kind_key,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_kind_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_purpose_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_action_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_generation_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_actor_self_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_legacy_shape_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_agreement_version_check,
  DROP CONSTRAINT IF EXISTS encounter_consent_events_actor_participant_id_fkey;

ALTER TABLE encounter_consent_events
  ADD CONSTRAINT encounter_consent_events_purpose_check CHECK (purpose IN (
    'join','record_audio','temporary_captions','retain_transcript','maia_attendance',
    'retain_summary','retain_developmental_memory','share_artifact'
  )),
  ADD CONSTRAINT encounter_consent_events_action_check CHECK (action IN ('grant','refuse','revoke')),
  ADD CONSTRAINT encounter_consent_events_generation_check CHECK (generation >= 0),
  ADD CONSTRAINT encounter_consent_events_actor_self_check CHECK (actor_participant_id = participant_id),
  ADD CONSTRAINT encounter_consent_events_agreement_version_check CHECK (length(btrim(agreement_version)) > 0),
  ADD CONSTRAINT encounter_consent_events_legacy_shape_check CHECK (
    (legacy_provenance = TRUE AND generation = 0 AND agreement_version = 'legacy-v0'
      AND kind IS NULL)
    OR
    (legacy_provenance = FALSE AND generation > 0 AND kind IS NULL)
  ),
  ADD CONSTRAINT encounter_consent_events_actor_participant_id_fkey
    FOREIGN KEY (actor_participant_id) REFERENCES encounter_participants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_encounter_consent_scope_latest
  ON encounter_consent_events
    (encounter_id, participant_id, purpose, agreement_version, generation, decided_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_encounter_consent_current_only
  ON encounter_consent_events (encounter_id, participant_id, purpose)
  WHERE legacy_provenance = FALSE;

COMMENT ON COLUMN encounter_consent_events.legacy_provenance IS
  'True only for pre-R3A standing grants retained as historical evidence; never current-generation authority.';
COMMENT ON COLUMN encounter_consent_events.actor_participant_id IS
  'The participant capability that authored this decision; R3A requires self-authorship.';

-- Decisions are append-only. Direct UPDATE/DELETE is refused. A parent Encounter
-- or participant lifecycle deletion may still cascade through the existing FKs;
-- the child delete is allowed only after its governing parent is no longer visible.
CREATE OR REPLACE FUNCTION enforce_encounter_consent_append_only()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' AND (
    NOT EXISTS (SELECT 1 FROM public.encounters WHERE id = OLD.encounter_id)
    OR NOT EXISTS (SELECT 1 FROM public.encounter_participants WHERE id = OLD.participant_id)
  ) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'encounter-consent-append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_encounter_consent_append_only ON encounter_consent_events;
CREATE TRIGGER trg_encounter_consent_append_only
  BEFORE UPDATE OR DELETE ON encounter_consent_events
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_consent_append_only();

DROP TRIGGER IF EXISTS trg_encounter_consent_no_truncate ON encounter_consent_events;
CREATE TRIGGER trg_encounter_consent_no_truncate
  BEFORE TRUNCATE ON encounter_consent_events
  FOR EACH STATEMENT EXECUTE FUNCTION enforce_encounter_consent_append_only();

COMMIT;
