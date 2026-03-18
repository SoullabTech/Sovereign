-- Studio Practitioner Loop
-- Adds the evidence-input layer beneath studio_decisions and studio_changes.
--
-- New tables:
--   studio_inquiry_responses        — client answers to structured prompt sets
--   studio_field_signals            — somatic/relational/behavioral signals from the field
--   studio_practitioner_observations — second-person practitioner observations
--   studio_change_experiments       — intervention hypothesis + practice design
--
-- Note: prompt sets are seeded at application layer (lib/studio/practitioner/promptSets.ts)
-- and intervention templates at (lib/studio/practitioner/interventionTemplates.ts).
-- No DB table needed for built-in templates.

-- ─── Client Inquiry Responses ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_inquiry_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id       UUID REFERENCES studio_decisions(id) ON DELETE CASCADE,
  change_id         UUID REFERENCES studio_changes(id) ON DELETE CASCADE,
  studio_session_id UUID,             -- future: link to session record
  client_id         UUID,             -- nullable: may not have a linked client record
  practitioner_id   UUID NOT NULL,
  prompt_set_id     TEXT NOT NULL,    -- references built-in or custom prompt set by ID
  prompt_set_title  TEXT NOT NULL,
  responses         JSONB NOT NULL DEFAULT '[]',  -- InquiryAnswer[]
  summary_text      TEXT,             -- optional digest (practitioner or AI generated)
  tags              TEXT[] NOT NULL DEFAULT '{}',
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- at least one context anchor required
  CONSTRAINT inquiry_has_context CHECK (
    decision_id IS NOT NULL OR change_id IS NOT NULL OR studio_session_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_inquiry_responses_decision ON studio_inquiry_responses(decision_id) WHERE decision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_change ON studio_inquiry_responses(change_id) WHERE change_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_practitioner ON studio_inquiry_responses(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_client ON studio_inquiry_responses(client_id) WHERE client_id IS NOT NULL;

-- ─── Field Signals ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_field_signals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id       UUID REFERENCES studio_decisions(id) ON DELETE CASCADE,
  change_id         UUID REFERENCES studio_changes(id) ON DELETE CASCADE,
  studio_session_id UUID,
  client_id         UUID,
  practitioner_id   UUID NOT NULL,
  source            TEXT NOT NULL CHECK (source IN ('client', 'practitioner', 'maia')),
  signal_type       TEXT NOT NULL CHECK (signal_type IN ('somatic', 'relational', 'behavioral', 'emotional', 'symbolic', 'cognitive')),
  title             TEXT NOT NULL,
  content           TEXT NOT NULL,
  intensity         NUMERIC(3, 2) CHECK (intensity IS NULL OR (intensity >= 0 AND intensity <= 1)),
  tags              TEXT[] NOT NULL DEFAULT '{}',
  signal_timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_signals_decision ON studio_field_signals(decision_id) WHERE decision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_field_signals_change ON studio_field_signals(change_id) WHERE change_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_field_signals_practitioner ON studio_field_signals(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_field_signals_client ON studio_field_signals(client_id) WHERE client_id IS NOT NULL;

-- ─── Practitioner Observations ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_practitioner_observations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id       UUID REFERENCES studio_decisions(id) ON DELETE CASCADE,
  change_id         UUID REFERENCES studio_changes(id) ON DELETE CASCADE,
  studio_session_id UUID,
  practitioner_id   UUID NOT NULL,
  client_id         UUID,
  observation_type  TEXT NOT NULL CHECK (observation_type IN (
    'in_session', 'relational_field', 'somatic_shift', 'pattern_notice',
    'interruption', 'repair', 'other'
  )),
  content           TEXT NOT NULL,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observations_decision ON studio_practitioner_observations(decision_id) WHERE decision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_observations_change ON studio_practitioner_observations(change_id) WHERE change_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_observations_practitioner ON studio_practitioner_observations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_observations_client ON studio_practitioner_observations(client_id) WHERE client_id IS NOT NULL;

-- ─── Change Experiments (Intervention Design) ────────────────────────

CREATE TABLE IF NOT EXISTS studio_change_experiments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_id            UUID NOT NULL REFERENCES studio_changes(id) ON DELETE CASCADE,
  practitioner_id      UUID NOT NULL,
  title                TEXT NOT NULL,
  hypothesis           TEXT NOT NULL,
  intervention_type    TEXT NOT NULL CHECK (intervention_type IN (
    'hypnosis', 'nlp', 'somatic', 'relational', 'journaling', 'maia_practice', 'mixed', 'other'
  )),
  instructions         TEXT NOT NULL,
  observation_window   TEXT NOT NULL,       -- "next 2 sessions", "1 week", etc.
  success_signals      TEXT[] NOT NULL DEFAULT '{}',
  risk_notes           TEXT,
  follow_up_intention  TEXT,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'abandoned')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_experiments_change ON studio_change_experiments(change_id);
CREATE INDEX IF NOT EXISTS idx_change_experiments_practitioner ON studio_change_experiments(practitioner_id);
