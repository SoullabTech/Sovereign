-- relational_signal_source_turn
--
-- Phase 2.5 — adds a nullable `source_turn_id` to `member_relational_signals`
-- so the founder review surface can join to the original conversation turn
-- at render time. The signal table itself still stores NO conversation
-- content. The join is read-time only, on a founder-only page.
--
-- Also creates `founder_relational_signal_reviews` for founder annotation
-- of signal quality ("looks_right" / "unclear" / "looks_off"). Annotations
-- are stored separately so they cannot contaminate the signal store.
--
-- See: lib/relationships/relationshipSignalService.ts
--      app/founder/relational-signals/page.tsx
--
-- Sovereignty invariants preserved:
--   - no conversation text in member_relational_signals
--   - no automatic feedback loop from review verdict into the detector
--   - founder-only surface, no member-facing exposure

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add nullable source_turn_id to member_relational_signals
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE member_relational_signals
  ADD COLUMN IF NOT EXISTS source_turn_id BIGINT;

-- Intentionally no FK constraint: labtool_manual signals have no maia_turns
-- row, and old signals pre-migration will have NULL. The founder page
-- handles the null case explicitly ("No linked turn").

CREATE INDEX IF NOT EXISTS idx_member_relational_signals_source_turn
  ON member_relational_signals (source_turn_id)
  WHERE source_turn_id IS NOT NULL;

COMMENT ON COLUMN member_relational_signals.source_turn_id IS
  'Optional bigint link to maia_turns.id. Read-time join only; signal table never stores turn text.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Founder review annotations — a separate small table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS founder_relational_signal_reviews (
  signal_id UUID PRIMARY KEY REFERENCES member_relational_signals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('looks_right', 'unclear', 'looks_off')),
  note TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_relational_signal_reviews_reviewed_at
  ON founder_relational_signal_reviews (reviewed_at DESC);

COMMENT ON TABLE founder_relational_signal_reviews IS
  'Founder-only annotation of relational signal quality. Never fed back to the detector automatically.';

COMMENT ON COLUMN founder_relational_signal_reviews.verdict IS
  'Triage verdict: looks_right | unclear | looks_off. Used for human review during the observation window.';
