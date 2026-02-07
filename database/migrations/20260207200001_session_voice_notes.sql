-- Session Voice Notes
-- Voice recordings attached to sessions, transcribed via local Faster-Whisper

CREATE TABLE IF NOT EXISTS session_voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  practitioner_id UUID NOT NULL,
  client_id UUID NULL,

  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  original_filename TEXT NULL,
  duration_ms INT NULL,

  transcript TEXT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_voice_notes_session_id
  ON session_voice_notes(session_id);

CREATE INDEX IF NOT EXISTS idx_session_voice_notes_practitioner_id
  ON session_voice_notes(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_session_voice_notes_created_at
  ON session_voice_notes(created_at DESC);
