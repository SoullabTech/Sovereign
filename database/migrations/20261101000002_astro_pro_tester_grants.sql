-- ASTRO-PRO-04 (#1893) — audited, revocable Pro tester grants. Built dark.
--
-- founderOnlyPreviewAccess.ts requires that any invitation beyond the founder
-- "MUST use a separate, audited and revocable source of authority". This is
-- that source. Merely holding a grant admits no one: Pro still refuses every
-- non-founder until the deploy setting ASTRO_PRO_ACCESS_PHASE = 'tester-grant'
-- is chosen, which waits on the #1817 R20/privacy verdict and the founder's
-- acceptance of an exact Pro candidate.
--
-- Shape: an append-only event log. A member's current standing is their latest
-- event; 'grant' admits, 'revoke' (or no event) does not. History is never
-- rewritten. Erasing a member removes their events with them (R20).
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS astro_pro_tester_grant_events (
  id              BIGSERIAL PRIMARY KEY,
  member_id       UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  action          TEXT        NOT NULL CHECK (action IN ('grant', 'revoke')),
  actor_member_id UUID        NOT NULL,
  reason          TEXT        CHECK (reason IS NULL OR char_length(reason) <= 500),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_astro_pro_tester_grant_events_member_latest
  ON astro_pro_tester_grant_events (member_id, id DESC);

-- Append-only: an event may never be edited. It may be deleted only when its
-- member no longer exists (the ON DELETE CASCADE of a member erasure), so a
-- revocation can never be quietly removed to bring a grant back.
CREATE OR REPLACE FUNCTION astro_pro_tester_grant_events_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'astro_pro_tester_grant_events is append-only';
  END IF;
  IF EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION 'astro_pro_tester_grant_events rows are removed only with their member';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS astro_pro_tester_grant_events_guard ON astro_pro_tester_grant_events;
CREATE TRIGGER astro_pro_tester_grant_events_guard
  BEFORE UPDATE OR DELETE ON astro_pro_tester_grant_events
  FOR EACH ROW EXECUTE FUNCTION astro_pro_tester_grant_events_guard();

CREATE OR REPLACE FUNCTION astro_pro_tester_grant_events_no_truncate()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'astro_pro_tester_grant_events may not be truncated';
END;
$$;

DROP TRIGGER IF EXISTS astro_pro_tester_grant_events_no_truncate ON astro_pro_tester_grant_events;
CREATE TRIGGER astro_pro_tester_grant_events_no_truncate
  BEFORE TRUNCATE ON astro_pro_tester_grant_events
  FOR EACH STATEMENT EXECUTE FUNCTION astro_pro_tester_grant_events_no_truncate();

COMMIT;
