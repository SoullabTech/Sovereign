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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS writer_beta_consent_member_fence_r1m
  ON writers_studio_beta_consent_events;
CREATE TRIGGER writer_beta_consent_member_fence_r1m
  BEFORE INSERT ON writers_studio_beta_consent_events
  FOR EACH ROW EXECUTE FUNCTION writer_beta_consent_member_fence_r1m();

COMMIT;
