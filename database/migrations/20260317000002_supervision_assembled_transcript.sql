-- Assembled transcript turns from supervision_transcript_segments
-- Created per-session on stop; replaced on re-assembly.
-- session_id references supervision_sessions.id

CREATE TABLE IF NOT EXISTS supervision_assembled_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  speaker TEXT NOT NULL DEFAULT 'speaker',
  text TEXT NOT NULL,
  start_ms INTEGER NOT NULL,
  end_ms INTEGER NOT NULL,
  chunk_index_start INTEGER,
  chunk_index_end INTEGER,
  raw_segment_count INTEGER DEFAULT 1,
  assembled_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS supervision_assembled_turns_session_idx
  ON supervision_assembled_turns (session_id, start_ms);
