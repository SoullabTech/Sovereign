-- WS-TIERS-R11 — FICTIONAL ONLY: guarded service-only mutation interface.
-- Execute ONLY against a newly initialized disposable PostgreSQL16 instance
-- at 127.0.0.1:55439/postgres with the R2/R3 review-only schema.
-- NOT A DATABASE MIGRATION. NOT A PRODUCTION R20 VERIFIER.
-- The SQL mutator credential MUST be independently held by a signer service
-- once production is separately authorized. Execution proves DB isolation,
-- not that a prior signature was really sealed in immutable WORM custody.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
-- This verification secret is synthetic and generated only for this fresh
-- throwaway database. Real production secret placement remains unresolved.
CREATE SCHEMA writer_r11_private AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA writer_r11_private FROM PUBLIC;
CREATE TABLE writer_r11_private.fixture_mac_key (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton=TRUE),
  key_hex TEXT NOT NULL CHECK (key_hex ~ '^[0-9a-f]{64}$')
);

CREATE TABLE public.writer_r11_fixture_applied_operations (
  operation_id UUID PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('issued','accepted','revoked')),
  member_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  grant_id UUID NOT NULL,
  event_sequence BIGINT NOT NULL UNIQUE CHECK (event_sequence > 0),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.writer_r11_fixture_apply_event(
  p_operation_id UUID,
  p_action TEXT,
  p_member_id UUID,
  p_actor_id UUID,
  p_grant_id UUID,
  p_event_sequence BIGINT,
  p_issued_at_ms BIGINT,
  p_expires_at_ms BIGINT,
  p_mac_hex TEXT
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
DECLARE
  gate RECORD;
  prior RECORD;
  current_grant RECORD;
  secret_hex TEXT;
  message TEXT;
  expected_mac TEXT;
  now_ms BIGINT;
  last_sequence BIGINT;
BEGIN
  IF p_operation_id IS NULL OR p_member_id IS NULL
    OR p_actor_id IS NULL OR p_grant_id IS NULL
    OR p_action IS NULL
    OR p_action NOT IN ('issued','accepted','revoked')
    OR p_event_sequence IS NULL OR p_event_sequence < 1
    OR p_issued_at_ms IS NULL OR p_expires_at_ms IS NULL
    OR p_mac_hex IS NULL THEN
    RAISE EXCEPTION 'r11_event_invalid_shape';
  END IF;

  -- Verify an authorization proof rather than trusting the ability to
  -- connect as the mutation role. Canonical bytes match Node's in-memory
  -- fictional authorizer exactly; a changed actor/member/grant/action/sequence
  -- cannot reuse a signature. The SQL secret is not exposed to either LOGIN.
  now_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp())*1000)::BIGINT;
  IF p_issued_at_ms > now_ms + 2000 OR p_expires_at_ms <= now_ms
    OR p_expires_at_ms <= p_issued_at_ms
    OR p_expires_at_ms - p_issued_at_ms > 30000 THEN
    RAISE EXCEPTION 'r11_mac_receipt_stale';
  END IF;
  SELECT key_hex INTO secret_hex FROM writer_r11_private.fixture_mac_key
   WHERE singleton=TRUE;
  IF NOT FOUND OR secret_hex IS NULL THEN
    RAISE EXCEPTION 'r11_verification_key_not_provisioned';
  END IF;
  message := 'SOULLAB_WRITER_R11_SQL_CAPABILITY_V1|' ||
    p_operation_id::text || '|' || p_action || '|' ||
    p_member_id::text || '|' || p_actor_id::text || '|' ||
    p_grant_id::text || '|' || p_event_sequence::text || '|' ||
    p_issued_at_ms::text || '|' || p_expires_at_ms::text;
  expected_mac := encode(public.hmac(
    convert_to(message,'UTF8'), decode(secret_hex,'hex'), 'sha256'
  ), 'hex');
  IF p_mac_hex !~ '^[0-9a-f]{64}$'
    OR p_mac_hex IS DISTINCT FROM expected_mac THEN
    RAISE EXCEPTION 'r11_invalid_mutation_mac';
  END IF;

  -- Serializes all pilot transitions, retries and two-seat issuance.
  SELECT initial_seat_cap, issued_seats, founder_member_id
    INTO gate
    FROM public.writer_studio_pilot_admission_control
   WHERE singleton = TRUE FOR UPDATE;
  IF NOT FOUND OR gate.initial_seat_cap IS DISTINCT FROM 2
    OR gate.founder_member_id IS NULL THEN
    RAISE EXCEPTION 'r11_admission_authority_unavailable';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.members f
     WHERE f.id = gate.founder_member_id AND f.admin_role = 'founder'
  ) THEN
    RAISE EXCEPTION 'r11_founder_authority_unverified';
  END IF;

  -- Bound retry: the same ID cannot be rebound to a new actor/subject/grant.
  SELECT action, member_id, actor_id, grant_id, event_sequence
    INTO prior
    FROM public.writer_r11_fixture_applied_operations
   WHERE operation_id = p_operation_id;
  IF FOUND THEN
    IF prior.action IS DISTINCT FROM p_action
      OR prior.member_id IS DISTINCT FROM p_member_id
      OR prior.actor_id IS DISTINCT FROM p_actor_id
      OR prior.grant_id IS DISTINCT FROM p_grant_id
      OR prior.event_sequence IS DISTINCT FROM p_event_sequence THEN
      RAISE EXCEPTION 'r11_operation_replay_mismatch';
    END IF;
    -- A newer terminal revocation always supersedes a former issued or
    -- accepted event; never renew old positive state after revocation.
    IF p_action <> 'revoked' AND (
      EXISTS (
        SELECT 1 FROM public.writer_studio_beta_grants g
         WHERE g.member_id = p_member_id
           AND g.grant_id = p_grant_id AND g.grant_state = 'revoked'
      )
      OR EXISTS (
        SELECT 1 FROM public.writer_r11_fixture_applied_operations e
         WHERE e.member_id = p_member_id AND e.grant_id = p_grant_id
           AND e.action = 'revoked'
      )
    ) THEN
      RAISE EXCEPTION 'r11_revoked_generation_cannot_replay';
    END IF;
    RETURN 'replayed';
  END IF;

  SELECT COALESCE(MAX(event_sequence),0)
    INTO last_sequence FROM public.writer_r11_fixture_applied_operations;
  IF p_event_sequence IS DISTINCT FROM last_sequence + 1 THEN
    RAISE EXCEPTION 'r11_event_sequence_not_next';
  END IF;

  IF p_action = 'issued' THEN
    IF p_actor_id IS DISTINCT FROM gate.founder_member_id
      OR p_member_id = p_actor_id
      OR gate.issued_seats IS NULL OR gate.issued_seats >= 2 THEN
      RAISE EXCEPTION 'r11_founder_or_seat_unavailable';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.writer_studio_beta_grants g
       WHERE g.member_id = p_member_id OR g.grant_id = p_grant_id
    ) THEN
      RAISE EXCEPTION 'r11_grant_generation_conflict';
    END IF;
    -- The grant UUID is PROVIDED by the caller's externally sealed event;
    -- it is NOT generated by a local SQL default.
    INSERT INTO public.writer_studio_beta_grants (
      member_id, grant_id, approved_by
    )
    SELECT m.id, p_grant_id, f.id
      FROM public.members m CROSS JOIN public.members f
     WHERE m.id = p_member_id AND f.id = p_actor_id
       AND f.admin_role = 'founder'
       AND EXISTS (
         SELECT 1 FROM public.ops_contacts c
          WHERE c.member_id = m.id AND c.deleted_at IS NULL
            AND c.contact_type = 'beta_tester'
            AND c.pipeline_stage = 'active'
       );
    IF NOT FOUND THEN
      RAISE EXCEPTION 'r11_unverified_candidate';
    END IF;
  ELSE
    -- Acceptance and revocation must refer to an EXISTING canonical grant.
    SELECT grant_id, grant_state, approved_by, valid_until
      INTO current_grant
      FROM public.writer_studio_beta_grants
     WHERE member_id = p_member_id FOR UPDATE;
    IF NOT FOUND OR current_grant.grant_id IS DISTINCT FROM p_grant_id
      OR current_grant.approved_by IS DISTINCT FROM gate.founder_member_id THEN
      RAISE EXCEPTION 'r11_grant_not_current';
    END IF;
    IF p_action = 'accepted' THEN
      IF p_actor_id IS DISTINCT FROM p_member_id
        OR current_grant.grant_state <> 'pending'
        OR (current_grant.valid_until IS NOT NULL
            AND current_grant.valid_until <= NOW())
        OR NOT EXISTS (
          SELECT 1 FROM public.ops_contacts c
           WHERE c.member_id = p_member_id AND c.deleted_at IS NULL
             AND c.contact_type = 'beta_tester'
             AND c.pipeline_stage = 'active'
        ) THEN
        RAISE EXCEPTION 'r11_acceptance_denied';
      END IF;
      UPDATE public.writer_studio_beta_grants g
         SET grant_state = 'accepted', accepted_at = NOW()
       WHERE g.member_id = p_member_id AND g.grant_id = p_grant_id;
    ELSE
      IF p_actor_id IS DISTINCT FROM gate.founder_member_id
        OR current_grant.grant_state NOT IN ('pending','accepted') THEN
        RAISE EXCEPTION 'r11_revocation_denied';
      END IF;
      UPDATE public.writer_studio_beta_grants g
         SET grant_state = 'revoked', revoked_at = NOW(), revoked_by = p_actor_id
       WHERE g.member_id = p_member_id AND g.grant_id = p_grant_id;
    END IF;
  END IF;

  INSERT INTO public.writer_r11_fixture_applied_operations
    (operation_id, action, member_id, actor_id, grant_id, event_sequence)
  VALUES (p_operation_id, p_action, p_member_id, p_actor_id, p_grant_id,
    p_event_sequence);
  RETURN 'applied';
END
$function$;

-- PostgreSQL normally grants EXECUTE on functions to PUBLIC by default.
-- Refuse that default explicitly before the dedicated role gets access.
REVOKE ALL ON FUNCTION public.writer_r11_fixture_apply_event(
  UUID,TEXT,UUID,UUID,UUID,BIGINT,BIGINT,BIGINT,TEXT) FROM PUBLIC;

COMMIT;
