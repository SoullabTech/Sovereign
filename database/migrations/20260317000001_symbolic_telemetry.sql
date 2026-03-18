-- Symbolic Telemetry Events — Phase 21
-- Append-only persistence for governed symbolic pipeline items.
--
-- Philosophy: classify and count — never store raw symbolic text.
-- This table answers calibration questions across time:
--   - Did fallback spike after a deploy?
--   - Are blocked identity claims increasing?
--   - Which domains are drifting week to week?
--   - Is memory eligibility getting too permissive?
--   - Did a prompt change alter role distribution?
--
-- Write path: fire-and-forget from oracle route (never blocks response)
-- Read path: /api/debug/symbolic-telemetry?source=db&window=24

-- ═══════════════════════════════════════════════════════════════
-- Core Table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS symbolic_telemetry_events (
  id                           BIGSERIAL PRIMARY KEY,

  -- Identity — ties back to the governed PromptIngressItem
  trace_id                     TEXT NOT NULL,

  -- Session context (nullable — telemetry must never block on missing context)
  session_id                   TEXT,
  member_id                    TEXT,

  -- Governance decisions — the core of what this table stores
  domain                       TEXT NOT NULL,  -- astrology | journal | pattern_ledger | field
  authority                    TEXT NOT NULL,  -- authoritative | derived | fallback
  prompt_role                  TEXT NOT NULL,  -- fact | interpretation | uncertainty | question_seed | excluded
  render_blocked               BOOLEAN NOT NULL DEFAULT false,
  block_reason                 TEXT,           -- null when not blocked

  -- Surface eligibility flags
  allowed_in_prompt            BOOLEAN NOT NULL DEFAULT false,
  allowed_in_practitioner_view BOOLEAN NOT NULL DEFAULT false,
  allowed_in_user_view         BOOLEAN NOT NULL DEFAULT false,
  allowed_in_memory            BOOLEAN NOT NULL DEFAULT false,

  -- Timestamp (append-only — never updated)
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE symbolic_telemetry_events IS
  'Append-only governed symbolic pipeline telemetry. IDs, classifications, and decisions only — no text content.';

COMMENT ON COLUMN symbolic_telemetry_events.trace_id IS
  'From PromptIngressItem.traceId — links to the governed item in the symbolic pipeline.';

COMMENT ON COLUMN symbolic_telemetry_events.render_blocked IS
  'True when governance blocked this item from rendering. block_reason identifies which rule fired.';

COMMENT ON COLUMN symbolic_telemetry_events.allowed_in_memory IS
  'Memory is stricter than prompt. Derived+speculative items may reach prompt but not memory.';

-- ═══════════════════════════════════════════════════════════════
-- Indexes — optimized for calibration queries
-- ═══════════════════════════════════════════════════════════════

-- Primary query: time-window summaries
CREATE INDEX IF NOT EXISTS idx_syte_created_at
  ON symbolic_telemetry_events (created_at DESC);

-- Domain + authority distribution queries
CREATE INDEX IF NOT EXISTS idx_syte_domain_authority
  ON symbolic_telemetry_events (domain, authority, created_at DESC);

-- Blocked-item analysis (partial — only blocked rows)
CREATE INDEX IF NOT EXISTS idx_syte_blocked
  ON symbolic_telemetry_events (block_reason, created_at DESC)
  WHERE render_blocked = true;

-- Per-session inspection
CREATE INDEX IF NOT EXISTS idx_syte_session
  ON symbolic_telemetry_events (session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

-- Per-member historical queries
CREATE INDEX IF NOT EXISTS idx_syte_member
  ON symbolic_telemetry_events (member_id, created_at DESC)
  WHERE member_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- Observability View: Hourly Summary
-- For the debug panel's time-window trend queries.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_symbolic_telemetry_hourly AS
SELECT
  DATE_TRUNC('hour', created_at)             AS hour_bucket,
  domain,
  authority,
  prompt_role,
  render_blocked,
  block_reason,
  COUNT(*)::int                              AS event_count,
  COUNT(*) FILTER (WHERE allowed_in_prompt)::int          AS prompt_eligible,
  COUNT(*) FILTER (WHERE allowed_in_memory)::int          AS memory_eligible,
  COUNT(*) FILTER (WHERE allowed_in_user_view)::int       AS user_view_eligible
FROM symbolic_telemetry_events
GROUP BY
  DATE_TRUNC('hour', created_at),
  domain, authority, prompt_role, render_blocked, block_reason
ORDER BY hour_bucket DESC, event_count DESC;

COMMENT ON VIEW v_symbolic_telemetry_hourly IS
  'Hourly aggregates for symbolic pipeline calibration. No PII.';
