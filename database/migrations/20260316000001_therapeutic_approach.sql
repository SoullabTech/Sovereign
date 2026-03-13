-- Migration: Add therapeutic_approach to member_settings
-- The member's enduring preference for interpretive lens.
-- Orthogonal to tier (depth) and mode (relational stance).
-- Default 'auto' = MAIA's native Spiralogic synthesis.

ALTER TABLE member_settings
  ADD COLUMN IF NOT EXISTS therapeutic_approach VARCHAR(20) DEFAULT 'auto';
