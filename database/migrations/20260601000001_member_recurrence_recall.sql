-- Migration: Member recurrence recall preference (single-member recurrence consent gate)
-- Created: 2026-06-01
-- Authority: Kelly directive 2026-06-01 — "Activate #2 now. Keep Morphic gated."
--
-- Single-member recurrence surfacing is its own honest capability. It reads ONLY
-- the member's own theme signals (member-scoped, WHERE member_id), never crosses
-- member boundaries, and never touches MorphicPatternService — which remains held
-- behind the consent + aggregation-only gate per
-- docs/architecture/STATE_AND_ROADMAP_2026-05-24.md (Morphic = "Later").
--
-- Purpose: Adds the consent gate for the single-member recurrence layer.
-- Default TRUE (default-on with opt-out + disclosure), mirroring
-- members.conversational_recall_enabled and members.episodic_recall_enabled.
--
-- Observability is NOT gated by this column. The recurrence receipt
-- ([MAIA/sovereign] recurrence log marker + memoryHealth.pattern) is emitted
-- regardless, matching the conversational doctrine (count appears in memoryHealth
-- for observability even when recall is OFF). This column gates only member-facing
-- SURFACING — whether MAIA may note the recurring theme in its prompt. When FALSE,
-- recurrence is still detected and counted but never spoken to the member.

BEGIN;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS recurrence_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN members.recurrence_recall_enabled IS
'Consent gate for single-member recurrence surfacing. When TRUE, MAIA may note that one of the member''s OWN themes has recurred in their recent history (member-scoped, never cross-member, never Morphic). When FALSE, recurrence is still detected for observability (memoryHealth.pattern) but never surfaced. Default TRUE per Kelly directive 2026-06-01 — mirrors conversational_recall_enabled.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260601000001: members.recurrence_recall_enabled column added (default TRUE)';
END $$;
