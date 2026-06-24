-- Migration: Noticing Experiment substrate (Experiment 01 — "Something I noticed")
-- Created: 2026-06-22
-- Authority: Kelly directive 2026-06-20 — v1 design lock approved.
--   docs/specs/EXPERIMENT_01_ATTENTION_MADE_VISIBLE_2026-06-20.md §"v1 design lock"
--
-- This migration adds:
--   1. members.noticing_enabled         — explicit opt-in gate (DEFAULT FALSE — experiment,
--                                         not a product feature; must never auto-enroll).
--   2. members.noticing_last_offered_at — throttle column; prevents the offer from
--                                         appearing more often than once per ~10 days.
--   3. noticing_events                  — observability table. Holds the free-text member
--                                         answer (the PRIMARY metric per spec §Measurement)
--                                         + usefulness + referents_json. Cannot use the
--                                         content-free runtime_events table because we need
--                                         to persist free-text answers.
--
-- Idempotent: all alterations use IF NOT EXISTS / CREATE TABLE IF NOT EXISTS.

BEGIN;

-- ── 1. Consent gate (opt-in; DEFAULT FALSE — explicit experiment posture) ──────
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS noticing_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN members.noticing_enabled IS
'Consent gate for Experiment 01 ("Something I noticed"). DEFAULT FALSE — explicit opt-in required. When TRUE AND member is a tester AND session is not Sanctuary, MAIA may occasionally offer a three-observation noticing surface. Gated by NOTICING_EXPERIMENT_ENABLED env flag at the route layer.';

-- ── 2. Offer-throttle column ────────────────────────────────────────────────────
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS noticing_last_offered_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN members.noticing_last_offered_at IS
'Timestamp of the most recent noticing offer. Used to enforce a ~10-day minimum interval between offers. NULL means never offered.';

-- ── 3. Observability / measurement table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticing_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID        NOT NULL,
  -- event_type values: offered | accepted | declined | answered | usefulness
  event_type   TEXT        NOT NULL,
  -- referents surfaced at offer/accept time; NULL for non-referent events
  referents_json JSONB     NULL,
  -- free-text member answer to "Does anything here feel important to you?"
  -- PRIMARY metric per spec §Measurement
  answer_text  TEXT        NULL,
  -- member usefulness response: yes | no | not_sure
  usefulness   TEXT        NULL
    CHECK (usefulness IS NULL OR usefulness IN ('yes', 'no', 'not_sure')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for per-member event lookups (most recent first)
CREATE INDEX IF NOT EXISTS idx_noticing_events_member_created
  ON noticing_events(member_id, created_at DESC);

-- Index for event_type aggregation (experiment analysis)
CREATE INDEX IF NOT EXISTS idx_noticing_events_type
  ON noticing_events(event_type, created_at DESC);

COMMENT ON TABLE noticing_events IS
'Observability table for Experiment 01 — Faithful Attention Made Visible. Holds the member''s free-text answer (primary metric), usefulness rating, and the referents that were surfaced. event_type: offered | accepted | declined | answered | usefulness.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260622000001: noticing_experiment columns + table created (idempotent)';
END $$;
