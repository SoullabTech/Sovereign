-- Add chunk_index column and unique constraint to prevent duplicate chunk processing
ALTER TABLE supervision_transcript_segments
  ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT -1;

CREATE UNIQUE INDEX IF NOT EXISTS supervision_transcript_segments_session_chunk_idx
  ON supervision_transcript_segments (session_id, chunk_index)
  WHERE chunk_index >= 0;
