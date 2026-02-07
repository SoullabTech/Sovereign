-- Voice Notes for Studio Sessions
-- Practitioner voice recordings attached to sessions, transcribed locally via Whisper
-- Session-first: session_id is required, client_id is denormalized for future queries

DO $$ BEGIN

CREATE TABLE IF NOT EXISTS voice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL,
    session_id UUID NOT NULL,
    client_id UUID,

    -- Audio file
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'audio/webm',
    size_bytes BIGINT NOT NULL,
    duration_seconds INT,

    -- Transcript
    transcript TEXT,
    transcription_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (transcription_status IN ('pending', 'transcribing', 'completed', 'failed')),
    transcription_error TEXT,

    -- Drafted note (MAIA-generated structured session note)
    drafted_note TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transcribed_at TIMESTAMPTZ
);

RAISE NOTICE 'Created voice_notes table';

EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE 'voice_notes table already exists';
END $$;

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_voice_notes_session ON voice_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_practitioner ON voice_notes(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_client ON voice_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_status ON voice_notes(transcription_status);

COMMENT ON TABLE voice_notes IS 'Voice recordings attached to sessions, transcribed locally via Whisper';
COMMENT ON COLUMN voice_notes.client_id IS 'Denormalized from session for efficient client-level queries';
COMMENT ON COLUMN voice_notes.drafted_note IS 'MAIA-generated structured session note from transcript';
