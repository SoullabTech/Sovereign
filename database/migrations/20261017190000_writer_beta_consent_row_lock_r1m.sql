-- R1M — Writer beta consent insert fence, DB-enforced for EVERY insertion route.
-- REVIEW-ONLY MIGRATION. NOT AUTHORIZED FOR PRODUCTION OR THE TESTER COHORT.
--
-- R1K's real protected author transaction takes:
--   SELECT id FROM members WHERE id = <verified member> FOR UPDATE
-- BEFORE it examines the latest immutable consent event or touches a Work.
-- All append-only consent writers, including historical/internal routes,
-- MUST serialize on that same member row even if they omit the R1K helper.
--
-- The trigger may delay consent INSERT while a prior legitimate protected
-- edit commits. It cannot make a writer's prior committed edit disappear.
-- Conversely a protected write starting AFTER a revocation commit must see
-- that newer event and refuse. Readers/exports/deletions have separate rules.
--
-- This trigger does not certify encrypted writing, producer attribution,
-- member authorization, secure key issuance or release approval. It also
-- does not replace application authentication/CSRF protections. Only a
-- separately reviewed production DB-role policy can prevent privileged
-- identities from disabling database triggers.
--
-- ROLLBACK BEFORE RELEASE: DROP TRIGGER writer_beta_consent_member_fence_r1m
-- ON writers_studio_beta_consent_events;
-- DROP FUNCTION writer_beta_consent_member_fence_r1m();
-- Never roll this migration back while live protected editorial commits depend
-- on its serialization guarantee.
BEGIN;

CREATE OR REPLACE FUNCTION writer_beta_consent_member_fence_r1m()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- A malformed/non-self act is never a member consent decision.
  IF NEW.member_id IS NULL OR
     NEW.actor_member_id IS DISTINCT FROM NEW.member_id THEN
    RAISE EXCEPTION 'writer_beta_consent_actor_invalid'
      USING ERRCODE = '23514';
  END IF;

  -- Row-level member lock is the SAME lock held by R1K through the canonical
  -- author transaction. The BEFORE INSERT trigger runs for ALL ordinary SQL
  -- consent events, regardless of which application module issued them.
  PERFORM 1 FROM members WHERE id = NEW.member_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'writer_beta_consent_member_unavailable'
      USING ERRCODE = '23503';
  END IF;

  -- PostgreSQL evaluates GENERATED ALWAYS IDENTITY defaults BEFORE a
  -- BEFORE INSERT trigger. A direct/older INSERT can therefore reserve a
  -- sequence number while WAITING for this member lock. If a transaction
  -- that already holds the lock inserts an accept before it releases, the
  -- waiting later revoke would otherwise commit with a *lower* sequence.
  -- All readers use ORDER BY seq DESC, so that would incorrectly present
  -- the prior accept as current consent. Reassign seq only AFTER the member
  -- lock is acquired; gaps from abandoned pre-trigger identity values are
  -- deliberate and harmless. The member's sequence becomes lock-ordered.
  NEW.seq := nextval(pg_get_serial_sequence(
    'writers_studio_beta_consent_events', 'seq'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS writer_beta_consent_member_fence_r1m
  ON writers_studio_beta_consent_events;
CREATE TRIGGER writer_beta_consent_member_fence_r1m
  BEFORE INSERT ON writers_studio_beta_consent_events
  FOR EACH ROW EXECUTE FUNCTION writer_beta_consent_member_fence_r1m();

COMMIT;
