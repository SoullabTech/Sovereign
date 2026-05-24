-- Migration: Member conversational recall preference (Phase 2 consent gate)
-- Created: 2026-05-24
-- Authority: docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md §II.A (Option 3)
--
-- Purpose: Adds the consent gate for the conversational memory layer Phase 2.
-- Default is TRUE (default-on with opt-out + disclosure) matching the
-- 0fa544bc4 atoms default-flip pattern (Keep = contextual return by default).
--
-- The conversational block in lib/maia/conversationalRecallBlock.ts checks
-- this column before injecting prior cross-session exchanges into the prompt.
-- When FALSE, the block is suppressed entirely; the count still appears in
-- memoryHealth.conversational for observability but no content reaches MAIA's
-- prompt.
--
-- Sanctuary sessions structurally never enter conversation_turns (per Sanctuary
-- Mode invariant in CLAUDE.md), so this column does not govern Sanctuary
-- behavior — only normal-session cross-session recall.

BEGIN;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS conversational_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN members.conversational_recall_enabled IS
'Phase 2 consent gate for conversational memory layer. When TRUE, prior cross-session exchanges may be referenced in MAIA''s prompt context (provenance-grounded, no synthesis). When FALSE, the conversational block is suppressed and no prior-session content reaches the prompt. Default TRUE per Kelly directive 2026-05-24 — matches atoms default-flip pattern.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260524000001: members.conversational_recall_enabled column added (default TRUE)';
END $$;
