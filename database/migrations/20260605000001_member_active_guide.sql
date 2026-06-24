-- Member Active Wisdom Guide — Phase 1 of Guide-as-Operating-Lens.
--
-- A chosen wisdom guide is a STANDING continuity field (like spiral state,
-- migrations/20260213200001_member_spiral_state.sql): it persists across
-- sessions until changed or deactivated, and informs MAIA on every path.
--
-- Canon: a guide is a chosen lineage lens with STANDING — never MAIA's identity,
-- never an authority that overrides the member's own meaning.
--
-- Two tables:
--   member_active_guide   — current selection (one row per member)
--   member_guide_history  — append-only lifecycle log (chosen/changed/deactivated)

-- ═══════════════════════════════════════════════════════════════
-- Current selection: one row per member
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS member_active_guide (
  member_id      UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,

  guide_id       TEXT NOT NULL,   -- tradition id from ELDER_COUNCIL_TRADITIONS
  guide_name     TEXT NOT NULL,
  element        TEXT CHECK (element IS NULL OR element IN ('fire','water','earth','air','aether')),

  -- Compact WisdomGuideSelection snapshot (name/element/description/archetype/
  -- mantra/principles) captured at selection time, so the server can build the
  -- lens addendum WITHOUT importing the heavy @ts-nocheck ELDER_COUNCIL dataset.
  guide_payload  JSONB,

  selected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- when the CURRENT guide was chosen (guideChangedAt)
  deactivated_at TIMESTAMPTZ,                          -- non-null = member cleared their guide

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_active_guide_updated
  ON member_active_guide (updated_at DESC);

COMMENT ON TABLE member_active_guide IS
  'Current chosen wisdom guide per member (standing source). One row per member; deactivated_at set when cleared. NOT MAIA identity — a chosen lineage lens with standing.';
COMMENT ON COLUMN member_active_guide.selected_at IS
  'When the current guide was chosen (guideChangedAt). Reset on change, not on every turn.';
COMMENT ON COLUMN member_active_guide.guide_payload IS
  'Compact WisdomGuideSelection snapshot captured at selection so the server builds the lens addendum without importing the heavy tradition dataset.';

-- ═══════════════════════════════════════════════════════════════
-- Lifecycle log: append-only (guideHistory[])
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS member_guide_history (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  guide_id    TEXT,            -- null only for some 'deactivated' rows
  guide_name  TEXT,
  action      TEXT NOT NULL CHECK (action IN ('selected','changed','deactivated')),
  at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_guide_history_member
  ON member_guide_history (member_id, at DESC);

COMMENT ON TABLE member_guide_history IS
  'Append-only lifecycle log of guide choices (guideHistory[]). MAIA knows when a guide was chosen, changed, or deactivated.';
