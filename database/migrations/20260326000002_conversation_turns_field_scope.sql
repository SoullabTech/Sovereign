-- ═══════════════════════════════════════════════════════════════
-- Memory Partitioning — field_slug on conversation_turns
-- ═══════════════════════════════════════════════════════════════
--
-- Add field scoping to conversation turns for memory partitioning.
-- NULL = MAIA core (backward compatible, no backfill needed).
-- When a master field is active, turns are tagged with field_slug.
-- This ensures Kelly entries never influence Jondi sessions and vice versa.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS field_slug VARCHAR(50);

-- Partial index: only field-scoped turns need fast lookup
CREATE INDEX IF NOT EXISTS idx_conversation_turns_field
  ON conversation_turns(user_id, field_slug, created_at DESC)
  WHERE field_slug IS NOT NULL;
