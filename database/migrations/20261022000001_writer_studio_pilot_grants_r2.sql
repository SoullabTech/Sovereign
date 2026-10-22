-- WS-TIERS-R2 / REVIEW-ONLY: individual, founder-approved Writer Studio pilot.
-- This migration is NOT authorization to apply it to production.
-- It is a product/custody candidate for independent Class A review.
-- CRITICAL: DB-only revocation is NOT restore-safe; R20 independent revocation
-- authority must seal this state before any real enrollment or source admission.
BEGIN;

CREATE TABLE IF NOT EXISTS writer_studio_beta_grants (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  grant_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (grant_state IN ('pending', 'accepted', 'revoked')),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES members(id) ON DELETE CASCADE,
  valid_until TIMESTAMPTZ,
  CHECK (valid_until IS NULL OR valid_until > approved_at),
  CHECK (
    (grant_state = 'pending' AND accepted_at IS NULL
      AND revoked_at IS NULL AND revoked_by IS NULL)
    OR
    (grant_state = 'accepted' AND accepted_at IS NOT NULL
      AND revoked_at IS NULL AND revoked_by IS NULL)
    OR
    (grant_state = 'revoked' AND revoked_at IS NOT NULL
      AND revoked_by IS NOT NULL)
  )
);

-- Initial admission is exactly two fictional/verified pilot accounts.
-- Expansion requires a later, separately reviewed founder/canary authorization.
-- Lock this single row on every grant insert to serialize competing requests.
CREATE TABLE IF NOT EXISTS writer_studio_pilot_admission_control (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton = TRUE),
  initial_seat_cap INTEGER NOT NULL DEFAULT 2 CHECK (initial_seat_cap = 2),
  -- Founder member ID deliberately UNBOUND at migration time. Independent
  -- founder-account proof must bind it before any real grant is possible.
  founder_member_id UUID REFERENCES members(id) ON DELETE SET NULL
);
INSERT INTO writer_studio_pilot_admission_control (singleton)
VALUES (TRUE) ON CONFLICT (singleton) DO NOTHING;

CREATE INDEX IF NOT EXISTS writer_studio_beta_grants_active_idx
  ON writer_studio_beta_grants (approved_at DESC)
  WHERE grant_state = 'accepted';

CREATE OR REPLACE FUNCTION writer_studio_beta_grant_guard_r2()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  cap INTEGER;
  current_grants INTEGER;
  authorized_founder UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT initial_seat_cap, founder_member_id
      INTO cap, authorized_founder
      FROM writer_studio_pilot_admission_control
     WHERE singleton = TRUE FOR UPDATE;
    IF authorized_founder IS NULL OR authorized_founder <> NEW.approved_by THEN
      RAISE EXCEPTION 'writer_pilot_founder_binding_unverified';
    END IF;
    IF cap IS DISTINCT FROM 2 THEN
      RAISE EXCEPTION 'writer_pilot_admission_gate_unavailable';
    END IF;
    SELECT COUNT(*) INTO current_grants FROM writer_studio_beta_grants;
    IF current_grants >= cap THEN
      RAISE EXCEPTION 'writer_pilot_initial_two_seat_cap';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM members f
      WHERE f.id = NEW.approved_by AND f.admin_role = 'founder'
    ) OR NOT EXISTS (
      SELECT 1 FROM ops_contacts c
      WHERE c.member_id = NEW.member_id AND c.deleted_at IS NULL
        AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
    ) THEN
      RAISE EXCEPTION 'writer_pilot_founder_or_candidate_not_verified';
    END IF;
    IF NEW.grant_state <> 'pending' THEN
      RAISE EXCEPTION 'writer_pilot_must_begin_pending';
    END IF;
    RETURN NEW;
  END IF;

  -- A grant belongs to exactly one member and one founder decision. Nothing
  -- quietly transfers it, extends its lifetime or backdates its approval.
  IF (NEW.member_id, NEW.approved_by, NEW.approved_at, NEW.valid_until)
    IS DISTINCT FROM
    (OLD.member_id, OLD.approved_by, OLD.approved_at, OLD.valid_until) THEN
    RAISE EXCEPTION 'writer_pilot_identity_and_approval_immutable';
  END IF;
  IF OLD.grant_state = 'revoked' THEN
    RAISE EXCEPTION 'writer_pilot_revocation_terminal';
  END IF;
  IF OLD.grant_state = 'accepted' AND NEW.grant_state = 'pending' THEN
    RAISE EXCEPTION 'writer_pilot_no_unaccept';
  END IF;
  IF OLD.grant_state = NEW.grant_state THEN
    RAISE EXCEPTION 'writer_pilot_no_silent_mutation';
  END IF;
  IF NEW.grant_state NOT IN ('accepted', 'revoked') THEN
    RAISE EXCEPTION 'writer_pilot_invalid_transition';
  END IF;
  IF OLD.accepted_at IS DISTINCT FROM NEW.accepted_at
    AND NOT (OLD.grant_state = 'pending' AND NEW.grant_state = 'accepted') THEN
    RAISE EXCEPTION 'writer_pilot_acceptance_timestamp_immutable';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS writer_studio_beta_grant_guard_r2
  ON writer_studio_beta_grants;
CREATE TRIGGER writer_studio_beta_grant_guard_r2
  BEFORE INSERT OR UPDATE ON writer_studio_beta_grants
  FOR EACH ROW EXECUTE FUNCTION writer_studio_beta_grant_guard_r2();

COMMENT ON TABLE writer_studio_beta_grants IS
  'Review-only individual Writer Studio founder approvals and writer acceptance; never inferred from CRM alone. R20 anti-resurrection external authority is still required.';
COMMENT ON COLUMN writer_studio_beta_grants.member_id IS
  'Verified account UUID only; no names, contacts, emails, invite tokens or manuscript content.';

COMMIT;
