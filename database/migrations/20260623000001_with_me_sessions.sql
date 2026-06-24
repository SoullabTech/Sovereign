-- With-Me Session Room: developmental event spine
-- Separate from scribe_sessions (audio capture) — this is the symbolic event log.

CREATE TABLE IF NOT EXISTS with_me_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug          TEXT        NOT NULL,
  facilitator_id      UUID        NOT NULL REFERENCES members(id),
  member_id           UUID        REFERENCES members(id),
  member_name         TEXT,         -- for participants not yet on platform
  intention           TEXT,
  elemental_phase     TEXT,         -- current element, updated during session
  spiral_position     TEXT,         -- free text, e.g. "Water 2"
  facilitator_notes   TEXT,
  transcript          TEXT,
  closing_reflection  TEXT,
  synthesis           JSONB,        -- MAIA's proposed synthesis (candidates array)
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'closed', 'synthesized', 'complete')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at           TIMESTAMPTZ,
  synthesized_at      TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_with_me_sessions_facilitator ON with_me_sessions(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_with_me_sessions_member     ON with_me_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_with_me_sessions_field      ON with_me_sessions(field_slug);
CREATE INDEX IF NOT EXISTS idx_with_me_sessions_status     ON with_me_sessions(status);

-- Developmental event log (per Kelly's spec, 2026-06-23)
-- source: 'facilitator' | 'maia' | 'member'
CREATE TABLE IF NOT EXISTS session_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID        NOT NULL REFERENCES with_me_sessions(id) ON DELETE CASCADE,
  member_id       UUID        REFERENCES members(id),
  facilitator_id  UUID        REFERENCES members(id),
  event_type      TEXT        NOT NULL,
  elemental_phase TEXT,
  spiral_position TEXT,
  source          TEXT        NOT NULL DEFAULT 'facilitator',
  payload         JSONB       DEFAULT '{}',
  confidence      NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_events_session   ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_type      ON session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_session_events_member    ON session_events(member_id);
CREATE INDEX IF NOT EXISTS idx_session_events_created   ON session_events(created_at);
