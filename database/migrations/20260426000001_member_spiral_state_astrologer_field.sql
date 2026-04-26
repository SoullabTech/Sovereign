-- 2026-04-26 — Astrologer field state (Symbolic Field Containment, Phase 1)
--
-- Extends Bridge D's `member_spiral_state` with two columns to persist the
-- Astrologer field-presence state per docs/canon/MAIA_THE_ASTROLOGER.md.
--
-- Persistence rule (Kelly approved 2026-04-26):
--   REQUESTED is ephemeral — never persisted to durable storage. Only the
--   states 'inactive' and 'active' are written to this column. Application
--   logic uses lib/symbolic/presence/astrologicalMaia.ts shouldPersistTransition()
--   to gate writes; the CHECK constraint below is the schema-level safety net.
--
-- Idempotent: safe to re-apply.

ALTER TABLE member_spiral_state
  ADD COLUMN IF NOT EXISTS astrologer_field_state TEXT
    DEFAULT 'inactive'
    CHECK (astrologer_field_state IN ('inactive', 'active'));

ALTER TABLE member_spiral_state
  ADD COLUMN IF NOT EXISTS astrologer_field_updated_at TIMESTAMPTZ;

-- No backfill required — DEFAULT 'inactive' covers existing rows.
-- No index required — column is read by primary key (member_id) lookup.

COMMENT ON COLUMN member_spiral_state.astrologer_field_state IS
  'Astrologer field-presence state. Values: inactive | active. REQUESTED is ephemeral and never persisted (see lib/symbolic/presence/astrologicalMaia.ts shouldPersistTransition).';

COMMENT ON COLUMN member_spiral_state.astrologer_field_updated_at IS
  'Last update timestamp for the astrologer field state. Used by decayIfStale (default 6h via DECAY_HOURS_DEFAULT) to reset stale field state on the next turn.';
