-- Voice journaling: add audio storage columns to quick_journal_entries
-- Supports sovereign local audio capture with optional browser transcription

ALTER TABLE quick_journal_entries
  ADD COLUMN IF NOT EXISTS audio_path TEXT,
  ADD COLUMN IF NOT EXISTS audio_mime TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration_ms INTEGER,
  ADD COLUMN IF NOT EXISTS transcript_source TEXT,
  ADD COLUMN IF NOT EXISTS transcript_confidence REAL;

-- Index for finding entries with audio
CREATE INDEX IF NOT EXISTS idx_quick_journal_has_audio
  ON quick_journal_entries(user_id)
  WHERE audio_path IS NOT NULL;

COMMENT ON COLUMN quick_journal_entries.audio_path IS 'Relative path to stored audio file (e.g., storage/audio/journals/user/file.webm)';
COMMENT ON COLUMN quick_journal_entries.audio_mime IS 'MIME type of audio (typically audio/webm)';
COMMENT ON COLUMN quick_journal_entries.audio_duration_ms IS 'Duration of audio in milliseconds';
COMMENT ON COLUMN quick_journal_entries.transcript_source IS 'How transcript was generated: web_speech, whisper, manual, none';
COMMENT ON COLUMN quick_journal_entries.transcript_confidence IS 'Confidence score of transcript (0.0-1.0) if available';
