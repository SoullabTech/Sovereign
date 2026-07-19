-- 20260619000001_coherence_captures.sql
-- MAIA Coherence Engine v0 — capture surface for "loose ends safely held".
-- Doctrine: docs/canon/MAIA_COHERENCE_ENGINE_v0.md
--
-- This is a COHERENCE layer, not a productivity/task layer. A capture is a
-- freeform note a member sets down so they can be present; classification is
-- LIGHT (today / later / time_sensitive / ongoing) and member-chosen — it is
-- not a priority, status, or AI-inferred field. In v0 the text is stored
-- VERBATIM. No AI parsing, no calendar event creation, no reminders.
--
-- Releasing a capture is reversible: released_at IS NULL means "still held";
-- a timestamp means the member let it go (can be restored by setting NULL).
--
-- Idempotent (CREATE TABLE IF NOT EXISTS). Fresh DB: creates table + index.
-- Re-run: no-op. No ALTER of an existing table, so no orphan/backfill risk.

CREATE TABLE IF NOT EXISTS coherence_captures (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  capture_text   TEXT NOT NULL,
  classification TEXT NOT NULL DEFAULT 'today'
    CHECK (classification IN ('today', 'later', 'time_sensitive', 'ongoing')),
  released_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE coherence_captures IS
  'MAIA Coherence Engine v0: lightweight member-authored captures ("loose ends safely held"). Not a task manager. See docs/canon/MAIA_COHERENCE_ENGINE_v0.md';
COMMENT ON COLUMN coherence_captures.classification IS
  'Light, member-chosen disposition: today | later | time_sensitive | ongoing. Not a priority or status, never AI-inferred.';
COMMENT ON COLUMN coherence_captures.released_at IS
  'NULL = still held. Timestamp = member released it (reversible by setting back to NULL).';

-- Held captures, newest first, scoped per member (the only read path in v0).
CREATE INDEX IF NOT EXISTS idx_coherence_captures_member_held
  ON coherence_captures (member_id, created_at DESC)
  WHERE released_at IS NULL;
