-- Migration: 20260311000003_ledger_annotation_types.sql
--
-- Replaces the original cogos_annotation_type enum with member-facing vocabulary.
-- The original values (contest, clarify, confirm) were OS-internal language.
-- The new values reflect how a member actually relates to a surfaced interpretation.
--
-- This migration is safe to run with an empty ledger_member_annotations table.
-- (No data exists yet — we have not yet surfaced any interpretations to members.)
--
-- New annotation semantics:
--   resonates          → positive recognition; increases routing influence
--   does_not_resonate  → decline (timing OR epistemic); reduces routing influence
--   not_now            → timing feedback only; suppresses near-term surfacing
--   add_context        → member extends the interpretation in their own words
--   clear_influence    → removes active influence; evidence remains intact
--
-- Design principle: annotation is a RESPONSE layer, not a correction layer.
-- The member meets the material consciously — they do not edit the system's record.

BEGIN;

-- ─── Step 1: Detach the column from the old enum ─────────────────────────────

ALTER TABLE ledger_member_annotations
  ALTER COLUMN annotation_type TYPE TEXT;

-- ─── Step 2: Drop the old enum ───────────────────────────────────────────────

DROP TYPE cogos_annotation_type;

-- ─── Step 3: Create the new enum with member-facing vocabulary ───────────────

CREATE TYPE cogos_annotation_type AS ENUM (
  'resonates',
  'does_not_resonate',
  'not_now',
  'add_context',
  'clear_influence'
);

COMMENT ON TYPE cogos_annotation_type IS
  'How the member responds to a surfaced interpretation. '
  'Each value represents a distinct relational response with different epistemic weight. '
  'not_now is timing-only (no influence change). '
  'does_not_resonate reduces routing weight but preserves evidence. '
  'clear_influence removes active routing influence entirely.';

-- ─── Step 4: Restore the column with the new type ────────────────────────────

ALTER TABLE ledger_member_annotations
  ALTER COLUMN annotation_type TYPE cogos_annotation_type
  USING annotation_type::cogos_annotation_type;

COMMIT;
