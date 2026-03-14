-- Field Orchestrator Telemetry
-- Persists per-turn FieldContext.meta from buildFieldContext()
-- Previously only went to console.info — now queryable for Command Center
--
-- Design: append-only, fire-and-forget writes (never blocks oracle)
-- Sovereignty: no conversation content, only structural field metrics

CREATE TABLE IF NOT EXISTS field_orchestrator_telemetry (
  id BIGSERIAL PRIMARY KEY,
  member_id TEXT,
  session_id TEXT,
  path TEXT,                        -- FAST / CORE / DEEP
  ms INTEGER,                       -- total orchestrator time in ms
  sources TEXT[],                   -- e.g. ['pfi','resonance','unified']
  chars INTEGER,                    -- JSON output size
  truncated BOOLEAN DEFAULT false,
  depth INTEGER,                    -- conversation depth (turn count)
  pfi_element TEXT,                 -- dominant element from PFI
  pfi_coherence REAL,               -- coherence level 0-1
  pfi_field_work_safe BOOLEAN,
  unified_dominant TEXT,            -- dominant element from Unified
  unified_coherence_level TEXT,     -- coherence level label
  resonance_word_density REAL,
  resonance_silence_prob REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Command Center queries
CREATE INDEX IF NOT EXISTS idx_fot_created ON field_orchestrator_telemetry(created_at);
CREATE INDEX IF NOT EXISTS idx_fot_member ON field_orchestrator_telemetry(member_id);
CREATE INDEX IF NOT EXISTS idx_fot_path ON field_orchestrator_telemetry(path);
