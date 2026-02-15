-- Field Monitor Turns
-- Unified per-turn telemetry for the oracle pipeline.
-- One row per oracle conversation turn, capturing all subsystem activity.
-- Sovereignty-aligned: structure only (no user text), fire-and-forget writes.

CREATE TABLE IF NOT EXISTS field_monitor_turns (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identity
  request_id TEXT NOT NULL,
  member_id TEXT,
  session_id TEXT,

  -- Spiralogic position
  element TEXT,
  phase SMALLINT,
  motion TEXT,
  intensity REAL,

  -- Framework selection
  frameworks_active TEXT[] DEFAULT '{}',
  framework_count SMALLINT DEFAULT 0,

  -- AIN Response Shape (from assessAINResponseShape)
  ain_pass BOOLEAN,
  ain_score SMALLINT CHECK (ain_score IS NULL OR (ain_score >= 0 AND ain_score <= 4)),
  ain_mirror BOOLEAN,
  ain_bridge BOOLEAN,
  ain_permission BOOLEAN,
  ain_next_step BOOLEAN,
  ain_menu_mode BOOLEAN,

  -- Opus Axioms
  opus_is_gold BOOLEAN,
  opus_passed SMALLINT,
  opus_warnings SMALLINT,
  opus_violations SMALLINT,
  opus_rupture BOOLEAN,

  -- Socratic Validator
  socratic_decision TEXT,
  socratic_is_gold BOOLEAN,
  socratic_rupture_count SMALLINT,
  socratic_regenerated BOOLEAN,

  -- Memory Layers Accessed (which layers returned non-null data)
  mem_session BOOLEAN DEFAULT false,
  mem_episodic BOOLEAN DEFAULT false,
  mem_somatic BOOLEAN DEFAULT false,
  mem_morphic BOOLEAN DEFAULT false,
  mem_semantic BOOLEAN DEFAULT false,
  mem_coherence BOOLEAN DEFAULT false,
  mem_evolution BOOLEAN DEFAULT false,
  mem_anamnesis BOOLEAN DEFAULT false,

  -- Voice & Relational
  voice_element TEXT,
  voice_archetype TEXT,
  voice_hysteresis TEXT,
  relational_stance TEXT,
  relational_hold_level TEXT,

  -- Field Safety
  field_safe BOOLEAN,
  cognitive_altitude REAL,

  -- Collapse & Breakthrough Detection
  dissociation_detected BOOLEAN DEFAULT false,
  breakthrough_detected BOOLEAN DEFAULT false,
  breakthrough_type TEXT,

  -- Performance
  duration_ms INTEGER,
  provider TEXT,
  model TEXT,
  used_fallback BOOLEAN DEFAULT false
);

-- Primary lookup: recent turns
CREATE INDEX IF NOT EXISTS idx_field_monitor_created_at
  ON field_monitor_turns (created_at DESC);

-- Per-member history
CREATE INDEX IF NOT EXISTS idx_field_monitor_member
  ON field_monitor_turns (member_id, created_at DESC);

-- Lookup by request
CREATE INDEX IF NOT EXISTS idx_field_monitor_request
  ON field_monitor_turns (request_id);
