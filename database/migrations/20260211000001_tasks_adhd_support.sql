-- ADHD Support Fields for Studio Tasks
-- Adds energy state matching, felt-time anchors, and release (no-shame archive) support
-- Phase 1-4 of the ADHD daily support build

-- ============================================
-- NEW COLUMNS on studio_tasks
-- ============================================

-- Energy state the task is best suited for
-- Maps to elemental system: fire=wired, water=emotional, earth=steady, air=scattered, aether=spacious
ALTER TABLE studio_tasks
  ADD COLUMN IF NOT EXISTS energy_match TEXT
  CHECK (energy_match IN ('fire', 'water', 'earth', 'air', 'aether'));

-- Felt-time label (human-friendly duration anchor)
-- Stored as minutes, rendered as "one song", "making coffee", etc.
ALTER TABLE studio_tasks
  ADD COLUMN IF NOT EXISTS felt_time_minutes INTEGER;

-- Next smallest step (the 2-minute activation move)
ALTER TABLE studio_tasks
  ADD COLUMN IF NOT EXISTS next_step TEXT;

-- Release support (no-shame archive instead of delete)
ALTER TABLE studio_tasks
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

ALTER TABLE studio_tasks
  ADD COLUMN IF NOT EXISTS release_reason TEXT;

-- ============================================
-- MEMBER ENERGY STATE (current elemental state)
-- ============================================
CREATE TABLE IF NOT EXISTS member_energy_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  energy TEXT NOT NULL CHECK (energy IN ('fire', 'water', 'earth', 'air', 'aether')),
  set_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (member_id)
);

CREATE INDEX IF NOT EXISTS idx_member_energy_member ON member_energy_state(member_id);

-- ============================================
-- Update status CHECK to include 'released'
-- ============================================
-- Note: PostgreSQL doesn't support ALTER CHECK directly.
-- We drop and re-add. The API route already supports extra statuses.
-- The existing CHECK is: ('todo', 'in_progress', 'delegated', 'completed')
-- We add 'released' as a valid status.

ALTER TABLE studio_tasks DROP CONSTRAINT IF EXISTS studio_tasks_status_check;
ALTER TABLE studio_tasks ADD CONSTRAINT studio_tasks_status_check
  CHECK (status IN ('todo', 'pending', 'in_progress', 'delegated', 'blocked', 'completed', 'cancelled', 'released'));
