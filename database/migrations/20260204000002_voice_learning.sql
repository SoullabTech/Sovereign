-- VOICE LEARNING: Track voice interaction data for sovereign TTS training

-- Voice turns table
CREATE TABLE IF NOT EXISTS maia_voice_turns (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT REFERENCES maia_turns(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('talk', 'care', 'note')),

  -- Latency metrics
  first_byte_latency_ms INTEGER,
  total_duration_ms INTEGER,
  audio_length_ms INTEGER,
  chunk_count INTEGER,

  -- Prosody data
  prosody_profile JSONB,

  -- TTS metadata
  tts_provider TEXT CHECK (tts_provider IN ('openai', 'xtts', 'personaplex', 'local')),
  tts_model TEXT,
  voice_id TEXT,

  -- Quality signals
  user_interrupted BOOLEAN DEFAULT false,
  user_requested_repeat BOOLEAN DEFAULT false,
  completed_listening BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voice feedback table
CREATE TABLE IF NOT EXISTS maia_voice_feedback (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT REFERENCES maia_turns(id) ON DELETE CASCADE,
  voice_quality SMALLINT CHECK (voice_quality >= 1 AND voice_quality <= 5),
  pace_appropriate BOOLEAN,
  tone_appropriate BOOLEAN,
  clarity_score NUMERIC(3,2),
  user_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_turns_session ON maia_voice_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_turns_mode ON maia_voice_turns(mode);
CREATE INDEX IF NOT EXISTS idx_voice_turns_provider ON maia_voice_turns(tts_provider);
CREATE INDEX IF NOT EXISTS idx_voice_turns_created ON maia_voice_turns(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_feedback_turn ON maia_voice_feedback(turn_id);

-- Voice performance summary view
CREATE OR REPLACE VIEW maia_voice_performance AS
SELECT
  vt.mode,
  vt.tts_provider,
  COUNT(*) as sample_count,
  AVG(vt.first_byte_latency_ms) as avg_first_byte_latency,
  AVG(vt.total_duration_ms) as avg_total_duration,
  AVG(CASE WHEN vt.completed_listening THEN 1.0 ELSE 0.0 END) as completion_rate,
  AVG(CASE WHEN vt.user_interrupted THEN 1.0 ELSE 0.0 END) as interruption_rate,
  AVG(vf.voice_quality) as avg_quality_score
FROM maia_voice_turns vt
LEFT JOIN maia_voice_feedback vf ON vt.turn_id = vf.turn_id
WHERE vt.created_at >= NOW() - INTERVAL '30 days'
GROUP BY vt.mode, vt.tts_provider;

COMMENT ON TABLE maia_voice_turns IS 'Voice interaction data for sovereign TTS training';
COMMENT ON TABLE maia_voice_feedback IS 'User feedback on voice quality for TTS improvement';
