-- Field Monitor Turns
-- Per-turn observability: which frameworks, memory layers, and field dynamics expressed
-- Sovereignty-aligned: structural signals only (no conversation content)
--
-- Follows Bridge D pattern: fire-and-forget writes, graceful degradation on read

CREATE TABLE IF NOT EXISTS field_monitor_turns (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  member_id TEXT NOT NULL,
  session_id TEXT,
  route TEXT NOT NULL DEFAULT 'oracle',          -- 'oracle' | 'stream'

  -- Spiral position
  element TEXT,
  phase SMALLINT,
  motion TEXT,

  -- Therapeutic frameworks detected (JSONB array of {framework, confidence})
  frameworks_detected JSONB DEFAULT '[]',
  primary_framework TEXT,
  framework_count SMALLINT DEFAULT 0,
  integration_score NUMERIC(3,2),                -- 0.00-1.00

  -- AIN Shape evaluation
  ain_pass BOOLEAN,
  ain_score SMALLINT,                            -- 0-4
  ain_mirror BOOLEAN,
  ain_bridge BOOLEAN,
  ain_permission BOOLEAN,
  ain_next_step BOOLEAN,

  -- Memory layers hit
  memory_layers_hit JSONB DEFAULT '{}',          -- {episodic, somatic, morphic, semantic, session}
  memory_layer_count SMALLINT DEFAULT 0,

  -- Voice & relational
  voice_mode TEXT,                               -- talk/care/note
  relational_stance TEXT,
  processing_path TEXT,                          -- FAST/CORE/DEEP

  -- Diversity scoring
  diversity_score NUMERIC(3,2),                  -- 0.00-1.00
  mono_modal_alert BOOLEAN DEFAULT false,        -- true if only 1 framework for 3+ turns

  -- Field Intelligence (talkModeFieldIntelligence)
  field_intelligence JSONB,                      -- {element, phase, spiralScale, userState, complexity, confidence}
  wisdom_field TEXT,                              -- selected wisdom field move
  user_state TEXT,                                -- detected user state (clear/confused/overwhelmed/etc.)
  spiral_scale TEXT,                              -- micro/meso/macro/collective

  -- Response Quality Metrics
  quality_score NUMERIC(3,2),                    -- overall quality 0.00-1.00

  -- PFI Mind State (when enabled)
  pfi_realm TEXT,                                -- UNDERWORLD/MIDDLEWORLD/UPPERWORLD_SYMBOLIC
  pfi_coherence NUMERIC(3,2),                    -- coherence level 0.00-1.00
  pfi_field_work_safe BOOLEAN,                   -- whether field work is safe
  pfi_signals JSONB                              -- full PFI mind state signals
);

-- Query patterns: recent turns, member history, alert detection
CREATE INDEX IF NOT EXISTS idx_field_monitor_created
  ON field_monitor_turns (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_field_monitor_member
  ON field_monitor_turns (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_field_monitor_alerts
  ON field_monitor_turns (mono_modal_alert) WHERE mono_modal_alert = true;
