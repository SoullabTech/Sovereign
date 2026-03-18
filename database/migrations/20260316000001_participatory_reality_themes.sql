-- Migration: 20260316000001_participatory_reality_themes.sql
-- Purpose: Participatory Reality Framework — theme signal tracking table
--
-- Stores structural signals (which theme, what type, how strong) without
-- storing any session content. Pattern detection only.
--
-- Philosophy: Same as ain_shape_telemetry — structural metadata only.
-- Members own their content. This table never stores what was said.

-- ── Create member_theme_signals table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS member_theme_signals (
  id                BIGSERIAL PRIMARY KEY,
  member_id         UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id        TEXT,
  journal_entry_id  UUID,

  -- Which of the six themes surfaced
  theme TEXT NOT NULL CHECK (theme IN (
    'field_awareness',
    'pattern_recurrence',
    'embodied_coherence',
    'adaptive_unfolding',
    'wise_acceptance',
    'ripeness'
  )),

  -- Signal type: what kind of relationship to the theme
  signal_type TEXT NOT NULL DEFAULT 'active' CHECK (signal_type IN (
    'active',       -- clearly present in session/journal
    'emerging',     -- beginning to surface
    'blocked',      -- resistance to this theme detected
    'integrating'   -- member is working with / moving through this theme
  )),

  -- Confidence 0–1 (heuristic, not diagnostic)
  resonance_strength FLOAT CHECK (resonance_strength >= 0 AND resonance_strength <= 1),

  -- Primary element resonance for the theme at time of detection
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),

  -- Structural context only (source, processing_path, etc.) — never session content
  context JSONB NOT NULL DEFAULT '{}',

  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_member_theme_signals_member
  ON member_theme_signals (member_id);

CREATE INDEX IF NOT EXISTS idx_member_theme_signals_theme_type
  ON member_theme_signals (theme, signal_type);

CREATE INDEX IF NOT EXISTS idx_member_theme_signals_detected
  ON member_theme_signals (detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_theme_signals_member_detected
  ON member_theme_signals (member_id, detected_at DESC);

-- ── Comment ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE member_theme_signals IS
  'Participatory Reality Framework: stores which symbolic theme was detected in a session or journal entry, its signal type, and resonance strength. No session content is stored here.';

COMMENT ON COLUMN member_theme_signals.theme IS
  'One of the six participatory reality themes: field_awareness, pattern_recurrence, embodied_coherence, adaptive_unfolding, wise_acceptance, ripeness.';

COMMENT ON COLUMN member_theme_signals.signal_type IS
  'The member''s relationship to the theme: active (present), emerging (surfacing), blocked (resistance), integrating (working through).';

COMMENT ON COLUMN member_theme_signals.resonance_strength IS
  'Soft heuristic confidence 0–1. Never treat as diagnostic. Use only as pattern trend signal.';

COMMENT ON COLUMN member_theme_signals.context IS
  'Structural metadata only (e.g. source, processing_path, element at time of detection). Never stores session content.';

-- ── Register migration ────────────────────────────────────────────────────────

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260316000001_participatory_reality_themes.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
