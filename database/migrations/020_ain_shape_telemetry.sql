-- AIN Shape Telemetry
-- Stores structural evaluation only (no user text) for behavioral drift detection
-- Sovereignty-aligned: structure only, opt-in in prod

CREATE TABLE IF NOT EXISTS ain_shape_telemetry (
  id BIGSERIAL PRIMARY KEY,
  formed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- structural evaluation only (no content)
  pass BOOLEAN NOT NULL,
  score SMALLINT NOT NULL CHECK (score >= 0 AND score <= 4),

  mirror BOOLEAN NOT NULL,
  bridge BOOLEAN NOT NULL,
  permission BOOLEAN NOT NULL,
  next_step BOOLEAN NOT NULL,

  -- lightweight context
  route TEXT NOT NULL DEFAULT 'maiaService',
  processing_profile TEXT,
  model TEXT,
  explorer_id TEXT,
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_ain_shape_telemetry_formed_at
  ON ain_shape_telemetry (formed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ain_shape_telemetry_pass_score
  ON ain_shape_telemetry (pass, score);
