-- Field Signals: The Afferent Nerve of the AIN Collective Field
--
-- Individual sessions emit symbolic signals when something meaningful crosses.
-- These signals are the nervous system of the collective — NOT surveillance.
--
-- Design principles:
-- 1. CONSENT FIRST: consent_scope is an emission gate, not a read filter.
--    Signals with scope 'private' exist for member's own continuity only.
--    Signals with scope 'commons' are anonymized and available to field weather.
-- 2. NO CONTENT: stores symbolic fingerprint, never conversation text.
-- 3. SANCTUARY ABSOLUTE: signals are NEVER emitted from sanctuary sessions.
-- 4. FIRE-AND-FORGET: emission never blocks oracle response.
-- 5. ANONYMIZABLE: member_id can be stripped for commons-level aggregation.

-- ═══════════════════════════════════════════════════════════════
-- Core Table: Field Signals
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS field_signals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id          TEXT,

  -- Signal classification
  signal_type         TEXT NOT NULL CHECK (signal_type IN (
    'breakthrough',        -- A threshold crossed (detected via breakthroughDetection)
    'collapse',            -- Energy dropped / regression (motion='stuck' + intensity drop)
    'integration',         -- Synthesis of previously separate elements
    'boundary',            -- A boundary set or honored
    'value_shift',         -- A value re-prioritized or discovered
    'vow',                 -- A commitment made (to self, another, or practice)
    'grief_wave',          -- Grief or loss surfacing (not pathological — human)
    'shadow_contact',      -- Shadow material consciously met
    'return',              -- A seasonal return (relational_phase 4)
    'autonomy_claim'       -- Independence / self-reliance signal
  )),

  -- Spiralogic position at time of signal
  element             TEXT NOT NULL CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  phase               INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 12),
  motion              TEXT CHECK (motion IS NULL OR motion IN ('ascending', 'stuck', 'breakthrough')),

  -- Signal strength and character
  intensity           NUMERIC(3, 2) NOT NULL CHECK (intensity >= 0 AND intensity <= 1),

  -- Value dynamics: what value-tension is alive in this signal
  -- Small controlled vocabulary, nullable (not every signal has clear value dynamics)
  value_axis          TEXT CHECK (value_axis IS NULL OR value_axis IN (
    'freedom_belonging',     -- autonomy vs connection
    'truth_harmony',         -- honesty vs peace-keeping
    'power_surrender',       -- agency vs letting go
    'structure_flow',        -- discipline vs spontaneity
    'self_other',            -- self-care vs service
    'known_unknown',         -- certainty vs mystery
    'creation_destruction'   -- building vs releasing
  )),

  -- Archetypal markers (symbolic fingerprint, NOT content)
  markers             TEXT[] DEFAULT '{}',

  -- Consent scope: THE sovereignty gate
  -- 'private'  = member's eyes only (supports their own field memory)
  -- 'circle'   = visible to their circle (future: practitioner, cohort)
  -- 'commons'  = anonymized for collective field weather
  consent_scope       TEXT NOT NULL DEFAULT 'private' CHECK (consent_scope IN ('private', 'circle', 'commons')),

  -- Breakthrough-specific metadata (nullable for non-breakthrough signals)
  breakthrough_type   TEXT CHECK (breakthrough_type IS NULL OR breakthrough_type IN (
    'shadow-integration', 'vision-ignition', 'emotional-release',
    'mental-clarity', 'unity-experience'
  )),
  breakthrough_depth  NUMERIC(3, 2) CHECK (breakthrough_depth IS NULL OR (breakthrough_depth >= 0 AND breakthrough_depth <= 1)),

  -- Spiral level (from breakthroughDetection's spiral-aware markers)
  spiral_level        TEXT,

  -- Coherence delta: how this signal moved the member's coherence
  -- Positive = integrating / growing / breaking through
  -- Negative = fragmenting / collapsing / regressing
  -- Zero/null = neutral or contextual
  -- This single field turns snapshots into trajectory
  coherence_delta     NUMERIC(3, 2) CHECK (coherence_delta IS NULL OR (coherence_delta >= -1 AND coherence_delta <= 1)),

  -- Idempotency: deterministic key from turn identity + emission identity
  -- Used with ON CONFLICT DO NOTHING to make retries harmless
  -- Built by cerebellum idempotency layer (never contains content)
  idempotency_key     TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- Indexes: Query paths for field weather and member timeline
-- ═══════════════════════════════════════════════════════════════

-- Member's own signal timeline (private + circle + commons)
CREATE INDEX IF NOT EXISTS idx_field_signals_member
  ON field_signals (member_id, created_at DESC);

-- Field weather aggregation (commons signals only, by element/phase)
CREATE INDEX IF NOT EXISTS idx_field_signals_commons
  ON field_signals (consent_scope, element, signal_type, created_at DESC)
  WHERE consent_scope = 'commons';

-- Signal type distribution (for weather computation)
CREATE INDEX IF NOT EXISTS idx_field_signals_type_time
  ON field_signals (signal_type, created_at DESC);

-- Element + phase distribution (for elemental weather)
CREATE INDEX IF NOT EXISTS idx_field_signals_element_phase
  ON field_signals (element, phase, created_at DESC)
  WHERE consent_scope = 'commons';

-- Idempotency: ON CONFLICT (idempotency_key) DO NOTHING
-- Partial unique index: only enforced when key is present (nullable column)
CREATE UNIQUE INDEX IF NOT EXISTS field_signals_idem_key_uidx
  ON field_signals (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- Comments: Make the schema self-documenting
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE field_signals IS
  'Afferent nerve of AIN collective field. Symbolic signal fingerprints from member sessions. NEVER contains conversation content. Sanctuary sessions NEVER emit signals.';

COMMENT ON COLUMN field_signals.consent_scope IS
  'Emission gate (not read filter). private=member only, circle=practitioner/cohort, commons=anonymized field weather.';

COMMENT ON COLUMN field_signals.signal_type IS
  'What crossed: breakthrough, collapse, integration, boundary, value_shift, vow, grief_wave, shadow_contact, return, autonomy_claim.';

COMMENT ON COLUMN field_signals.value_axis IS
  'Which value-tension is alive in this signal. Controlled vocabulary. Null if not applicable.';

COMMENT ON COLUMN field_signals.markers IS
  'Symbolic fingerprint (archetypal markers). Never raw conversation text.';

COMMENT ON COLUMN field_signals.breakthrough_depth IS
  'Depth score from breakthroughDetection (0-1). Only set for breakthrough signals.';

COMMENT ON COLUMN field_signals.coherence_delta IS
  'Trajectory vector: positive=integrating, negative=fragmenting, null=neutral. Turns signal snapshots into living story.';

COMMENT ON COLUMN field_signals.idempotency_key IS
  'Deterministic key from turn+emission identity. ON CONFLICT DO NOTHING makes retries harmless. Never contains content.';

-- ═══════════════════════════════════════════════════════════════
-- Observability View: Field Signal Summary (anonymized)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_field_signal_weather AS
SELECT
  signal_type,
  element,
  phase,
  value_axis,
  COUNT(*) as signal_count,
  AVG(intensity)::numeric(3,2) as avg_intensity,
  AVG(coherence_delta)::numeric(3,2) as avg_coherence_delta,
  MAX(created_at) as latest_signal,
  -- Time bucketing: signals in last hour, day, week
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as last_day,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week
FROM field_signals
WHERE consent_scope = 'commons'  -- ONLY commons signals feed weather
GROUP BY signal_type, element, phase, value_axis
ORDER BY last_day DESC, signal_count DESC;

COMMENT ON VIEW v_field_signal_weather IS
  'Anonymized field weather from commons-consented signals. No PII. No member_id exposure.';
