-- Encounter architecture migration
-- The Encounter is the primary object; transcript is one window into it.
-- Four epistemic layers: source_record | human_reflection | ai_candidate | accepted_recognition | developmental_synthesis
-- PHI: raw_text, turn text, moment excerpt/interpretation, reflection body, interpretation content → dual-write _enc columns

CREATE TABLE IF NOT EXISTS encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  session_id UUID NULL REFERENCES studio_meetings(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','complete')),
  started_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NULL,
  duration_seconds INTEGER NULL,
  audio_url TEXT NULL,
  audio_filename TEXT NULL,
  transcription_status TEXT NOT NULL DEFAULT 'pending' CHECK (transcription_status IN ('pending','processing','complete','failed')),
  transcription_error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  person_id UUID NULL REFERENCES studio_people(id) ON DELETE SET NULL,
  display_name VARCHAR(255) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('practitioner','client','supervisor','observer')),
  member_id UUID NULL REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE UNIQUE,
  raw_text TEXT NULL,
  raw_text_enc TEXT NULL,
  raw_text_enc_meta JSONB NULL,
  word_count INTEGER NULL,
  speaker_count INTEGER NULL,
  source TEXT NOT NULL DEFAULT 'recording' CHECK (source IN ('recording','upload','manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcript_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES encounter_transcripts(id) ON DELETE CASCADE,
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  speaker VARCHAR(255) NULL,
  text TEXT NULL,
  text_enc TEXT NULL,
  text_enc_meta JSONB NULL,
  start_ms INTEGER NULL,
  end_ms INTEGER NULL,
  turn_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('emotional_shift','rupture_repair','insight','resistance','aliveness','silence','intervention','self_recognition','unresolved_question')),
  title VARCHAR(255) NOT NULL,
  start_ms INTEGER NULL,
  end_ms INTEGER NULL,
  excerpt TEXT NULL,
  excerpt_enc TEXT NULL,
  excerpt_enc_meta JSONB NULL,
  candidate_interpretation TEXT NULL,
  candidate_interpretation_enc TEXT NULL,
  candidate_interpretation_enc_meta JSONB NULL,
  confidence NUMERIC(3,2) NULL CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate','accepted','rejected','edited')),
  authored_by UUID NULL REFERENCES members(id) ON DELETE SET NULL,
  artifact_type TEXT NOT NULL DEFAULT 'ai_candidate' CHECK (artifact_type IN ('source_record','human_reflection','ai_candidate','accepted_recognition','developmental_synthesis')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  body TEXT NULL,
  body_enc TEXT NULL,
  body_enc_meta JSONB NULL,
  authored_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL CHECK (author_role IN ('practitioner','client','supervisor')),
  artifact_type TEXT NOT NULL DEFAULT 'human_reflection' CHECK (artifact_type IN ('source_record','human_reflection','ai_candidate','accepted_recognition','developmental_synthesis')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  layer TEXT NOT NULL CHECK (layer IN ('dynamics','teaching','development')),
  content JSONB NULL,
  content_enc TEXT NULL,
  content_enc_meta JSONB NULL,
  artifact_type TEXT NOT NULL DEFAULT 'ai_candidate' CHECK (artifact_type IN ('source_record','human_reflection','ai_candidate','accepted_recognition','developmental_synthesis')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_encounters_practitioner_id ON encounters(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_encounters_session_id ON encounters(session_id);
CREATE INDEX IF NOT EXISTS idx_encounter_participants_encounter_id ON encounter_participants(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_participants_person_id ON encounter_participants(person_id);
CREATE INDEX IF NOT EXISTS idx_encounter_transcripts_encounter_id ON encounter_transcripts(encounter_id);
CREATE INDEX IF NOT EXISTS idx_transcript_turns_transcript_id ON transcript_turns(transcript_id);
CREATE INDEX IF NOT EXISTS idx_transcript_turns_encounter_id ON transcript_turns(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_moments_encounter_id ON encounter_moments(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_reflections_encounter_id ON encounter_reflections(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_interpretations_encounter_id ON encounter_interpretations(encounter_id);

-- updated_at triggers (reuse pattern from existing migrations)
CREATE OR REPLACE FUNCTION update_encounters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Idempotent trigger creation: DROP IF EXISTS before CREATE so re-running this
-- migration over an out-of-band-applied schema does not abort under ON_ERROR_STOP.
DROP TRIGGER IF EXISTS trg_encounters_updated_at ON encounters;
CREATE TRIGGER trg_encounters_updated_at
  BEFORE UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_encounters_updated_at();

DROP TRIGGER IF EXISTS trg_encounter_transcripts_updated_at ON encounter_transcripts;
CREATE TRIGGER trg_encounter_transcripts_updated_at
  BEFORE UPDATE ON encounter_transcripts
  FOR EACH ROW EXECUTE FUNCTION update_encounters_updated_at();

DROP TRIGGER IF EXISTS trg_encounter_moments_updated_at ON encounter_moments;
CREATE TRIGGER trg_encounter_moments_updated_at
  BEFORE UPDATE ON encounter_moments
  FOR EACH ROW EXECUTE FUNCTION update_encounters_updated_at();

DROP TRIGGER IF EXISTS trg_encounter_reflections_updated_at ON encounter_reflections;
CREATE TRIGGER trg_encounter_reflections_updated_at
  BEFORE UPDATE ON encounter_reflections
  FOR EACH ROW EXECUTE FUNCTION update_encounters_updated_at();
