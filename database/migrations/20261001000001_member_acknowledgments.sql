-- MEMBER-ADULT-ACK-01 — a member's own acknowledgments, append-only.
--
-- Founder rulings 2026-10-01:
--   * youth is CLOSED for now: every member must confirm they are 18 or older;
--   * the founder's "all members are adults" attestation is turned into each
--     member's OWN record, collected at registration or, for existing members,
--     at their next sign-in;
--   * the "MAIA is not monitored" disclosure may be acknowledged in the same
--     prompt. Its kind is reserved here; its copy is not yet defined, so no
--     surface records it yet.
--
-- An acknowledgment is a member act. It is never inferred, never backfilled,
-- and never edited: a changed acknowledgment is a new row (a new version).
-- Absence of a row means "not acknowledged", never "acknowledged by default".

BEGIN;

CREATE TABLE IF NOT EXISTS member_acknowledgments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL CHECK (kind IN ('adult_18_plus', 'maia_not_monitored')),
  version         INTEGER NOT NULL CHECK (version >= 1),
  source          TEXT NOT NULL CHECK (source IN ('registration', 'sign_in_prompt')),
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, kind, version)
);

CREATE INDEX IF NOT EXISTS member_acknowledgments_member_idx
  ON member_acknowledgments (member_id, kind, version DESC);

CREATE OR REPLACE FUNCTION member_acknowledgments_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'member acknowledgment % is append-only: a changed acknowledgment is a new acknowledgment', OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_acknowledgments_no_update ON member_acknowledgments;
CREATE TRIGGER member_acknowledgments_no_update
  BEFORE UPDATE ON member_acknowledgments
  FOR EACH ROW EXECUTE FUNCTION member_acknowledgments_append_only();

-- A direct DELETE is refused. A DELETE caused by the member row being deleted
-- (ON DELETE CASCADE) is allowed: by then the parent row is already gone, so the
-- member's erasure is never blocked by their own acknowledgment.
CREATE OR REPLACE FUNCTION member_acknowledgments_no_direct_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION
      'member acknowledgment % cannot be deleted while its member exists', OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_acknowledgments_no_delete ON member_acknowledgments;
CREATE TRIGGER member_acknowledgments_no_delete
  BEFORE DELETE ON member_acknowledgments
  FOR EACH ROW EXECUTE FUNCTION member_acknowledgments_no_direct_delete();

CREATE OR REPLACE FUNCTION member_acknowledgments_no_truncate()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'member_acknowledgments cannot be truncated';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_acknowledgments_no_truncate ON member_acknowledgments;
CREATE TRIGGER member_acknowledgments_no_truncate
  BEFORE TRUNCATE ON member_acknowledgments
  FOR EACH STATEMENT EXECUTE FUNCTION member_acknowledgments_no_truncate();

COMMENT ON TABLE member_acknowledgments IS
  'MEMBER-ADULT-ACK-01: append-only member acknowledgments (18+ confirmation; reserved: MAIA-not-monitored disclosure). A member act, never inferred or backfilled. Absence means not acknowledged.';

COMMIT;
