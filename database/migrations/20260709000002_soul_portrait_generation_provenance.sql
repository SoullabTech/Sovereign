-- Soul Portrait generation provenance — which engine wrote the draft.
--
-- Posture (routing settled 2026-07-09): deep-tier portraits are cloud-primary-
-- LABELED — a deliberate provider choice (forceClaude at the generator call
-- site), not a silent fallback. The label travels with the row: any portrait
-- served from a cloud engine must say so. An unlabeled cloud-served portrait
-- is a refused state. Local-primary returns when the cognition node lands
-- (measured basis: qwen2.5:14b at ~3 tok/s on minisforum CPU = 11-43 min per
-- portrait; see docs/architecture note in lib/soulPortrait/generator).
--
-- NULL on pre-provenance rows (drafts generated before this migration).

ALTER TABLE soul_portraits ADD COLUMN IF NOT EXISTS generation_provider TEXT;
ALTER TABLE soul_portraits ADD COLUMN IF NOT EXISTS generation_model    TEXT;

COMMENT ON COLUMN soul_portraits.generation_provider IS
  'Engine family that wrote the draft (e.g. anthropic, ollama). NULL = pre-provenance row.';
COMMENT ON COLUMN soul_portraits.generation_model IS
  'Exact model that wrote the draft (e.g. claude-opus-4-6, qwen2.5:14b-instruct). NULL = pre-provenance row.';
