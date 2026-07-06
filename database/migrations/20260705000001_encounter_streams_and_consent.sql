-- Encounter Stewardship — Phase B, Evidence layer (spec §2, §3, §5, §6).
-- Extends the EXISTING encounters lineage (20260629000001_encounters.sql) — does NOT
-- create a competing Encounter object. Adds the two tables native dual-track recording
-- requires, plus per-participant attribution columns on transcript_turns.
--
-- Constitutional enforcement in this migration:
--   R-A1 (no recording before consent): encounter_media_streams.consent_event_id is a
--         NOT NULL FK, AND a trigger requires that event to be kind='record' for the SAME
--         participant + encounter. A stream cannot exist before its record-consent row. (Grade A/B)
--   R11  (Encounter First): every table here carries encounter_id UUID NOT NULL REFERENCES encounters.
--   No transport fields (webrtc/turn/sfu/ice) on any table here.
--
-- Reconciliation debt (NOT addressed here, by design): encounters.audio_url / audio_filename
--   (legacy, media-on-Encounter) violate the "media belongs to a participant" keystone. Native
--   dual-track writes encounter_media_streams and leaves those columns dormant. Deprecating them
--   is a later, non-destructive reconciliation.

-- ── §3 Consent threshold events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS encounter_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES encounter_participants(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('join','record','share')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  text_snapshot TEXT NULL,          -- the exact consent language shown at the threshold
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One standing consent per (participant, kind); re-granting is idempotent.
  UNIQUE (encounter_id, participant_id, kind)
);

-- ── §2 Per-participant media streams ────────────────────────────────────────
-- Media belongs to a PARTICIPANT within an Encounter — never to the Encounter directly,
-- never to a mic. consent_event_id makes R-A1 structural.
CREATE TABLE IF NOT EXISTS encounter_media_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES encounter_participants(id) ON DELETE CASCADE,
  consent_event_id UUID NOT NULL REFERENCES encounter_consent_events(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL DEFAULT 'mic' CHECK (kind IN ('mic','mixed')),
  storage_ref TEXT NULL,            -- file path/URL; null until finalized on stop
  format TEXT NULL,                 -- e.g. 'audio/webm;codecs=opus'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','recording','stopped')),
  started_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- R-A1 structural guard: the referenced consent event must be a 'record' grant for the
-- SAME participant and encounter as the stream. FK alone guarantees existence; this trigger
-- guarantees it is the right KIND and belongs to the right person. No record consent ⇒ no stream.
CREATE OR REPLACE FUNCTION enforce_record_consent_before_stream()
RETURNS TRIGGER AS $$
DECLARE
  ev RECORD;
BEGIN
  SELECT kind, participant_id, encounter_id INTO ev
    FROM encounter_consent_events WHERE id = NEW.consent_event_id;
  IF ev IS NULL THEN
    RAISE EXCEPTION 'R-A1: consent_event_id % does not exist', NEW.consent_event_id;
  END IF;
  IF ev.kind <> 'record' THEN
    RAISE EXCEPTION 'R-A1: media stream requires a record-consent event, got kind=%', ev.kind;
  END IF;
  IF ev.participant_id <> NEW.participant_id OR ev.encounter_id <> NEW.encounter_id THEN
    RAISE EXCEPTION 'R-A1: consent event participant/encounter mismatch for stream';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_record_consent_before_stream ON encounter_media_streams;
CREATE TRIGGER trg_enforce_record_consent_before_stream
  BEFORE INSERT ON encounter_media_streams
  FOR EACH ROW EXECUTE FUNCTION enforce_record_consent_before_stream();

-- ── §5/§6 Attribution + correction on existing transcript_turns ─────────────
-- Attribution is by construction (track identity = participant), not a diarization guess.
-- Raw evidence is never overwritten; a correction appends a new row (correction_status).
ALTER TABLE transcript_turns
  ADD COLUMN IF NOT EXISTS participant_id UUID NULL REFERENCES encounter_participants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_stream_id UUID NULL REFERENCES encounter_media_streams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS correction_status TEXT NOT NULL DEFAULT 'raw'
    CHECK (correction_status IN ('raw','corrected'));

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_consent_events_encounter ON encounter_consent_events(encounter_id);
CREATE INDEX IF NOT EXISTS idx_consent_events_participant ON encounter_consent_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_media_streams_encounter ON encounter_media_streams(encounter_id);
CREATE INDEX IF NOT EXISTS idx_media_streams_participant ON encounter_media_streams(participant_id);
CREATE INDEX IF NOT EXISTS idx_transcript_turns_participant ON transcript_turns(participant_id);
CREATE INDEX IF NOT EXISTS idx_transcript_turns_source_stream ON transcript_turns(source_stream_id);
