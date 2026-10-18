-- RF01 S1-B: content-free, one-turn Anthropic text-processing grant.
--
-- This schema is candidate-only and NOT applied to production. It does not
-- authorize Sanctuary inference or remove the independent S1-A serving hold.
-- A grant authorizes Anthropic TEXT processing only, not memory formation,
-- speech synthesis, other providers, or any fallback.
--
-- A separate member gesture is required. The only data retained here are
-- authenticated actor/session/turn references, processor, disclosure version,
-- and lifetime. Never write prompts, filenames, IPs, or response content.
BEGIN;

CREATE TABLE IF NOT EXISTS runtime_processing_grants (
  request_id TEXT PRIMARY KEY
    REFERENCES runtime_consent_state(request_id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  processor TEXT NOT NULL CHECK (processor = 'anthropic'),
  purpose TEXT NOT NULL CHECK (purpose = 'turn_text_generation'),
  disclosure_version TEXT NOT NULL
    CHECK (disclosure_version = 'rf01-s1b-anthropic-turn-v1'),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  CONSTRAINT rf01_processing_grant_lifetime CHECK (
    expires_at > granted_at AND
    expires_at <= granted_at + INTERVAL '5 minutes'
  )
);

CREATE INDEX IF NOT EXISTS idx_rf01_processing_grants_member_session
  ON runtime_processing_grants(member_id, session_id, granted_at DESC);

COMMENT ON TABLE runtime_processing_grants IS
  'RF01 S1-B candidate: immutable content-free Anthropic turn-processing scope. '
  'Requires a separately authenticated user act and a Sanctuary preflight. '
  'Provider/purpose/expiry are exact. Default-off; not a production consent API.';

CREATE OR REPLACE FUNCTION rf01_processing_grant_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'RF01 processing grant is immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rf01_processing_grant_immutable_trg
  ON runtime_processing_grants;
CREATE TRIGGER rf01_processing_grant_immutable_trg
  BEFORE UPDATE ON runtime_processing_grants
  FOR EACH ROW EXECUTE FUNCTION rf01_processing_grant_immutable();

COMMIT;
