-- Phase 4.5: Mycelial Memory – Meta-Layer Columns
-- Adds Aether-layer metadata to consciousness_traces table
-- Safely reversible (no destructive changes)

BEGIN;

ALTER TABLE consciousness_traces
  ADD COLUMN IF NOT EXISTS meta_layer_code TEXT,
  ADD COLUMN IF NOT EXISTS meta_layer_trigger TEXT,
  ADD COLUMN IF NOT EXISTS meta_layer_confidence NUMERIC;

COMMENT ON COLUMN consciousness_traces.meta_layer_code IS
  'Aether meta-layer resonance code (Æ1–Æ3)';
COMMENT ON COLUMN consciousness_traces.meta_layer_trigger IS
  'Trigger or symbolic condition that activated meta-layer analysis';
COMMENT ON COLUMN consciousness_traces.meta_layer_confidence IS
  'Confidence level (0–1) for meta-layer inference';

CREATE INDEX IF NOT EXISTS idx_traces_meta_layer_code
  ON consciousness_traces(meta_layer_code);

COMMIT;

-- Verification
-- SELECT meta_layer_code, meta_layer_trigger, meta_layer_confidence
-- FROM consciousness_traces LIMIT 5;
