-- Migration: 20260311000001_accumulating_hypotheses.sql
--
-- Creates the Accumulating Hypothesis Buffer tables.
-- This is the pre-ledger holding space for the Cognitive OS.
--
-- Core principle: Evidence events are IMMUTABLE once written.
-- Interpretations (hypotheses) are scaffolding built on top.
--
-- Enum naming: cogos_ prefix avoids collision with existing hypothesis_* types
-- (which belong to the prompt-testing / skill-deployment system).
--
-- Tables:
--   accumulating_hypotheses        — one row per hypothesis in progress
--   hypothesis_evidence_events     — immutable observation events (many per hypothesis)
--   hypothesis_contradictions      — contradiction events (many per hypothesis)

BEGIN;

-- ─── Enums (cogos_ prefixed to avoid collision) ───────────────────────────────

CREATE TYPE cogos_hypothesis_status AS ENUM (
  'accumulating',    -- below gate thresholds, building evidence
  'eligible',        -- passes formal gates
  'worthy',          -- OS judges useful for continuity
  'promoted',        -- successfully written to ledger
  'discarded',       -- failed gates or explicitly rejected
  'expired'          -- inactivity decay / developmental irrelevance
);

CREATE TYPE cogos_evidence_type AS ENUM (
  'explicit_statement',    -- direct self-disclosure — highest weight
  'behavioral_pattern',    -- how person acts, not just what they say
  'elemental_activation',  -- specific elemental signal from conductor
  'emotional_register',    -- tone, affect, emotional quality
  'verbal_pattern',        -- recurring word choices or framings
  'topic_avoidance'        -- what isn't said, deflections
);

CREATE TYPE cogos_contradiction_source AS ENUM (
  'user_correction',       -- member explicitly disputed this — highest weight
  'explicit_statement',    -- member stated something contrary
  'behavioral_pattern',    -- member acted contrary to interpretation
  'system_observation'     -- OS noticed contradicting signal
);

CREATE TYPE cogos_interpretation_type AS ENUM (
  'elemental',             -- maps to elemental state / activation
  'phase',                 -- relates to Spiralogic phase position
  'relational',            -- pattern in how person relates to others / system
  'identity_arc',          -- longer-term identity / developmental narrative
  'style_calibration'      -- how person prefers to engage (→ relational_calibration store)
);

CREATE TYPE cogos_target_store AS ENUM (
  'interpretive_ledger',    -- main durable interpretive record
  'state_store',            -- Bridge D (updates lighter and faster)
  'relational_calibration', -- style / framing preferences
  'ephemeral'               -- interesting but not worth storing
);

-- ─── Accumulating hypotheses ──────────────────────────────────────────────────

CREATE TABLE accumulating_hypotheses (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id                   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  phase_at_creation           SMALLINT NOT NULL CHECK (phase_at_creation BETWEEN 1 AND 12),
  element_at_creation         TEXT NOT NULL,

  -- Source audit trail — archival only, never used for routing
  originating_agent           TEXT NOT NULL DEFAULT '',
  originating_model           TEXT NOT NULL DEFAULT '',
  original_language           TEXT NOT NULL DEFAULT '',

  -- OS-normalized interpretation (operational)
  observation_summary         TEXT NOT NULL,
  candidate_interpretation    TEXT NOT NULL,
  interpretation_type         cogos_interpretation_type NOT NULL,
  target_store                cogos_target_store NOT NULL,

  -- Counters (cached from evidence_events for fast gate evaluation)
  recurrence_count            INTEGER NOT NULL DEFAULT 1,
  cross_context_count         INTEGER NOT NULL DEFAULT 0,
  context_types_seen          TEXT[]  NOT NULL DEFAULT '{}',

  -- Multi-dimensional confidence (stored, not recomputed on every read)
  signal_confidence           NUMERIC(4,3) NOT NULL DEFAULT 0,
  structural_confidence       NUMERIC(4,3) NOT NULL DEFAULT 0,
  interpretive_confidence     NUMERIC(4,3) NOT NULL DEFAULT 0,
  composite_confidence        NUMERIC(4,3) NOT NULL DEFAULT 0,
  confidence_computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Gate status per dimension
  gate_recurrence             TEXT NOT NULL DEFAULT 'pending' CHECK (gate_recurrence IN ('pending','passed','failed')),
  gate_cross_context          TEXT NOT NULL DEFAULT 'pending' CHECK (gate_cross_context IN ('pending','passed','failed')),
  gate_developmental_rel      TEXT NOT NULL DEFAULT 'pending' CHECK (gate_developmental_rel IN ('pending','passed','failed')),
  gate_structural_complete    TEXT NOT NULL DEFAULT 'pending' CHECK (gate_structural_complete IN ('pending','passed','failed')),
  gate_store_routing          TEXT NOT NULL DEFAULT 'pending' CHECK (gate_store_routing IN ('pending','passed','failed')),
  gate_confidence_floor       TEXT NOT NULL DEFAULT 'pending' CHECK (gate_confidence_floor IN ('pending','passed','failed')),
  gate_evaluated_at           TIMESTAMPTZ,

  -- Falsifiability anchors (required for ledger admission)
  contradiction_conditions    TEXT[] NOT NULL DEFAULT '{}',
  decay_conditions            TEXT[] NOT NULL DEFAULT '{}',

  status                      cogos_hypothesis_status NOT NULL DEFAULT 'accumulating',
  routing_influence_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.05,

  -- Lineage: refinement of an earlier hypothesis (not replacement)
  parent_hypothesis_id        UUID REFERENCES accumulating_hypotheses(id) ON DELETE SET NULL
);

CREATE INDEX idx_accum_hyp_member_status ON accumulating_hypotheses(member_id, status);
CREATE INDEX idx_accum_hyp_member_type ON accumulating_hypotheses(member_id, interpretation_type);
CREATE INDEX idx_accum_hyp_parent ON accumulating_hypotheses(parent_hypothesis_id)
  WHERE parent_hypothesis_id IS NOT NULL;

COMMENT ON COLUMN accumulating_hypotheses.original_language IS
  'Archival only. Never used for routing, gate evaluation, or promotion.';

-- ─── Evidence events (immutable) ─────────────────────────────────────────────

CREATE TABLE hypothesis_evidence_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hypothesis_id     UUID NOT NULL REFERENCES accumulating_hypotheses(id) ON DELETE CASCADE,
  session_id        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  observation       TEXT NOT NULL,
  context_domain    TEXT NOT NULL,
  context_element   TEXT NOT NULL,
  context_mode      TEXT NOT NULL CHECK (context_mode IN ('Talk', 'Care', 'Note')),
  evidence_type     cogos_evidence_type NOT NULL,
  evidence_weight   NUMERIC(4,3) NOT NULL CHECK (evidence_weight BETWEEN 0 AND 1),
  signal_strength   NUMERIC(4,3) NOT NULL CHECK (signal_strength BETWEEN 0 AND 1)
);

CREATE INDEX idx_hyp_evidence_hypothesis ON hypothesis_evidence_events(hypothesis_id);
CREATE INDEX idx_hyp_evidence_session ON hypothesis_evidence_events(session_id);

COMMENT ON TABLE hypothesis_evidence_events IS
  'Immutable. Evidence events cannot be modified once written. '
  'Interpretations built on evidence are revisable; the evidence itself is not.';

-- ─── Contradiction events ─────────────────────────────────────────────────────

CREATE TABLE hypothesis_contradictions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hypothesis_id           UUID NOT NULL REFERENCES accumulating_hypotheses(id) ON DELETE CASCADE,
  session_id              TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observation             TEXT NOT NULL,
  context_domain          TEXT NOT NULL,
  context_element         TEXT NOT NULL,
  source                  cogos_contradiction_source NOT NULL,
  contradiction_weight    NUMERIC(4,3) NOT NULL CHECK (contradiction_weight BETWEEN 0 AND 1),
  user_initiated          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_hyp_contradiction_hypothesis ON hypothesis_contradictions(hypothesis_id);

COMMENT ON TABLE hypothesis_contradictions IS
  'Contradiction events do NOT delete the hypothesis. '
  'They reduce structural_confidence. '
  'User corrections (user_initiated=true) receive the highest weight (0.95).';

-- ─── Updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_hypothesis_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hypothesis_last_updated
  BEFORE UPDATE ON accumulating_hypotheses
  FOR EACH ROW
  EXECUTE FUNCTION update_hypothesis_last_updated();

COMMIT;
