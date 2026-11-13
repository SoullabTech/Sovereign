-- WS beta grants — dated, audited, revocable Writer's Studio beta access. Built dark.
--
-- Founder rulings, 2026-11-13 (recorded on #1800):
--   * beta testers get one year of access;
--   * the year starts on the day dated grants ship (never shortened retroactively);
--   * the current cohort shares one end date; later testers get 365 days from their own grant;
--   * expiry removes Pro capabilities only — Works, revisions, identity and export stay;
--   * the founder can extend the whole cohort in one action, or extend/revoke one person.
-- Release ledger #1938 Gate 4 ("individually approved beta grants") is HOLD with parallel
-- preparation permitted: this table is that preparation. Nothing reads it unless
-- WS_BETA_GRANT_MODE is 'transition' or 'dated' (default 'legacy' = today's boolean only).
--
-- It replaces, in stages, the open-ended boolean ops_contacts.metadata.writers_studio_beta.
-- This is NOT the Phase 1 purchase ledger (studio_holding_events): a beta grant is
-- complimentary and owner-issued, never bought.
--
-- Shape: an append-only event log (as astro_pro_tester_grant_events). A member's standing is
-- their latest event: 'grant' / 'extend' admit until expires_at; 'revoke' (or no event) does
-- not. History is never rewritten. Erasing a member removes their events with them (R20).
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writers_studio_beta_grant_events (
  id              BIGSERIAL PRIMARY KEY,
  member_id       UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  action          TEXT        NOT NULL CHECK (action IN ('grant', 'extend', 'revoke')),
  -- When access ends. Required for grant/extend, absent for revoke.
  expires_at      TIMESTAMPTZ,
  -- Optional cohort label (e.g. 'beta-2026') so a whole cohort can be extended at once.
  cohort          TEXT        CHECK (cohort IS NULL OR cohort ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  actor_member_id UUID        NOT NULL,
  reason          TEXT        CHECK (reason IS NULL OR char_length(reason) <= 500),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT writers_studio_beta_grant_expiry_shape CHECK (
    (action = 'revoke' AND expires_at IS NULL) OR
    (action IN ('grant', 'extend') AND expires_at IS NOT NULL AND expires_at > occurred_at)
  )
);

CREATE INDEX IF NOT EXISTS idx_writers_studio_beta_grant_events_member_latest
  ON writers_studio_beta_grant_events (member_id, id DESC);

-- Append-only: an event may never be edited. It may be deleted only when its member no longer
-- exists (the ON DELETE CASCADE of a member erasure), so a revocation can never be quietly
-- removed to bring a grant back.
CREATE OR REPLACE FUNCTION writers_studio_beta_grant_events_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'writers_studio_beta_grant_events is append-only';
  END IF;
  IF EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION 'writers_studio_beta_grant_events rows are removed only with their member';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS writers_studio_beta_grant_events_guard ON writers_studio_beta_grant_events;
CREATE TRIGGER writers_studio_beta_grant_events_guard
  BEFORE UPDATE OR DELETE ON writers_studio_beta_grant_events
  FOR EACH ROW EXECUTE FUNCTION writers_studio_beta_grant_events_guard();

CREATE OR REPLACE FUNCTION writers_studio_beta_grant_events_no_truncate()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'writers_studio_beta_grant_events may not be truncated';
END;
$$;

DROP TRIGGER IF EXISTS writers_studio_beta_grant_events_no_truncate ON writers_studio_beta_grant_events;
CREATE TRIGGER writers_studio_beta_grant_events_no_truncate
  BEFORE TRUNCATE ON writers_studio_beta_grant_events
  FOR EACH STATEMENT EXECUTE FUNCTION writers_studio_beta_grant_events_no_truncate();

COMMENT ON TABLE writers_studio_beta_grant_events IS
  'Writer''s Studio dated beta grants (founder rulings 2026-11-13, #1800): append-only grant/extend/revoke with expiry. Read only when WS_BETA_GRANT_MODE is transition or dated.';

COMMIT;
