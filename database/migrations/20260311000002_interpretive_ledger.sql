-- Migration: 20260311000002_interpretive_ledger.sql
--
-- Creates the Interpretive Ledger — the durable cognitive memory store.
-- Runs after 20260311000001_accumulating_hypotheses.sql.
--
-- Tables:
--   interpretive_ledger         — one row per durable interpretation
--   ledger_member_annotations   — member's perspective on ledger entries
--   relational_calibration      — how the member prefers to engage

BEGIN;

-- ─── Ledger-specific enums ────────────────────────────────────────────────────

CREATE TYPE cogos_ledger_status AS ENUM (
  'active',       -- in ledger, influencing routing
  'superseded',   -- replaced by evolved interpretation
  'expired',      -- natural decay
  'revoked'       -- member cleared influence (evidence remains)
);

CREATE TYPE cogos_surfacing_status AS ENUM (
  'eligible',
  'timing_gated',
  'declined',
  'held_lightly',
  're_emergent',
  'cleared_by_member'
);

CREATE TYPE cogos_annotation_type AS ENUM (
  'contest',
  'clarify',
  'confirm',
  'clear_influence'
);

-- ─── Interpretive ledger ──────────────────────────────────────────────────────

CREATE TABLE interpretive_ledger (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id                   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  promoted_from_hypothesis_id UUID NOT NULL
    REFERENCES accumulating_hypotheses(id) ON DELETE RESTRICT,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  promoted_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  phase_at_creation           SMALLINT NOT NULL CHECK (phase_at_creation BETWEEN 1 AND 12),
  element_at_creation         TEXT NOT NULL,

  observation_summary         TEXT NOT NULL,
  interpretation              TEXT NOT NULL,
  interpretation_type         cogos_interpretation_type NOT NULL,

  evidence_summary            TEXT NOT NULL,
  evidence_event_count        INTEGER NOT NULL DEFAULT 0,
  cross_context_count         INTEGER NOT NULL DEFAULT 0,

  signal_confidence           NUMERIC(4,3) NOT NULL DEFAULT 0,
  structural_confidence       NUMERIC(4,3) NOT NULL DEFAULT 0,
  interpretive_confidence     NUMERIC(4,3) NOT NULL DEFAULT 0,
  composite_confidence        NUMERIC(4,3) NOT NULL DEFAULT 0,
  confidence_computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  routing_influence_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.70,
  surfacing_status            cogos_surfacing_status NOT NULL DEFAULT 'eligible',

  -- Decay schedule
  inactivity_sessions         INTEGER NOT NULL DEFAULT 5,
  phase_proximity_weight      NUMERIC(4,3) NOT NULL DEFAULT 0.15,
  last_decay_applied          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Falsifiability (required for every entry)
  contradiction_conditions    TEXT[] NOT NULL DEFAULT '{}',
  decay_conditions            TEXT[] NOT NULL DEFAULT '{}',
  min_contradiction_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.55,

  status                      cogos_ledger_status NOT NULL DEFAULT 'active',
  parent_ledger_entry_id      UUID REFERENCES interpretive_ledger(id) ON DELETE SET NULL,

  CONSTRAINT ledger_falsifiable CHECK (
    array_length(contradiction_conditions, 1) >= 1
  )
);

CREATE INDEX idx_ledger_member_status ON interpretive_ledger(member_id, status);
CREATE INDEX idx_ledger_member_type ON interpretive_ledger(member_id, interpretation_type)
  WHERE status = 'active';
CREATE INDEX idx_ledger_routing ON interpretive_ledger(member_id, routing_influence_weight DESC)
  WHERE status = 'active' AND routing_influence_weight > 0.1;
CREATE INDEX idx_ledger_surfacing ON interpretive_ledger(member_id, surfacing_status)
  WHERE status = 'active';
CREATE INDEX idx_ledger_parent ON interpretive_ledger(parent_ledger_entry_id)
  WHERE parent_ledger_entry_id IS NOT NULL;

COMMENT ON COLUMN interpretive_ledger.routing_influence_weight IS
  'Starts at 0.70 on promotion. Reduced by decay, contradictions, and member revocation. '
  'Evidence is preserved regardless of this value.';

COMMENT ON CONSTRAINT ledger_falsifiable ON interpretive_ledger IS
  'Every ledger entry must have at least one contradiction condition. '
  'Entries without falsifiability anchors cannot decay cleanly.';

-- ─── Member annotations ───────────────────────────────────────────────────────

CREATE TABLE ledger_member_annotations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_entry_id   UUID NOT NULL REFERENCES interpretive_ledger(id) ON DELETE CASCADE,
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  annotation        TEXT NOT NULL,
  annotation_type   cogos_annotation_type NOT NULL
);

CREATE INDEX idx_ledger_annotations_entry ON ledger_member_annotations(ledger_entry_id);

COMMENT ON TABLE ledger_member_annotations IS
  'Member perspective alongside system observation — neither overwrites the other. '
  'clear_influence annotations reduce routing_influence_weight on the parent entry.';

-- ─── Updated_at trigger for ledger ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_ledger_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_last_updated
  BEFORE UPDATE ON interpretive_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_ledger_last_updated();

-- ─── Relational calibration ───────────────────────────────────────────────────

CREATE TABLE relational_calibration (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  preference_key      TEXT NOT NULL,
  preference_value    TEXT NOT NULL,
  confidence          NUMERIC(4,3) NOT NULL DEFAULT 0.50,
  source              TEXT NOT NULL DEFAULT 'interaction'
    CHECK (source IN ('interaction', 'explicit')),
  session_count       INTEGER NOT NULL DEFAULT 1,
  member_editable     BOOLEAN NOT NULL DEFAULT TRUE,

  UNIQUE(member_id, preference_key)
);

CREATE INDEX idx_relational_cal_member ON relational_calibration(member_id);

CREATE TRIGGER trg_relational_cal_last_updated
  BEFORE UPDATE ON relational_calibration
  FOR EACH ROW
  EXECUTE FUNCTION update_ledger_last_updated();

COMMENT ON TABLE relational_calibration IS
  'How the member prefers to engage: framing style, abstraction level, etc. '
  'This is communicative fit, not interpretive claims about psychology. '
  'Members can edit directly (member_editable=true). '
  'Lighter gate than interpretive_ledger.';

COMMIT;
