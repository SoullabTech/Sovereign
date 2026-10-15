-- WS-BETA-CONSENT-R1 (CANDIDATE ONLY — NOT APPLIED TO LIVE BETA).
-- Consent to take part in the *specific Writer's Studio* trial is distinct
-- from being on a tester contact list, an owner allowlist, or a platform member.
-- Final consent text, retention and third-party model disclosure must be
-- approved before the matching policy SHA-256 is configured or presented.
--
-- Immutable sequence rather than timestamps determines the most recent act.
-- Member identity cannot be supplied as a different "actor" in a row.
-- No message text, manuscript content, email address or IP is retained here.

CREATE TABLE IF NOT EXISTS writers_studio_beta_consent_events (
  seq BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  actor_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('accept','revoke')),
  policy_version TEXT NOT NULL
    CHECK (length(policy_version) BETWEEN 1 AND 80 AND policy_version ~ '^[a-zA-Z0-9._-]+$'),
  policy_sha256 TEXT NOT NULL
    CHECK (policy_sha256 ~ '^[0-9a-f]{64}$'),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ws_beta_consent_self_actor CHECK (member_id = actor_member_id)
);

CREATE INDEX IF NOT EXISTS idx_ws_beta_consent_latest
  ON writers_studio_beta_consent_events(member_id, seq DESC);

COMMENT ON TABLE writers_studio_beta_consent_events IS
  'Writer Studio beta consent and revocation sequence. No cohort grant, content, PII beyond member UUID, or implicit retrospective consent. Actor must be the member. Rows are append-only under the governed API, while member erasure cascades receipts.';
COMMENT ON COLUMN writers_studio_beta_consent_events.policy_sha256 IS
  'SHA-256 of the exact, approved member-visible notice. An accepted earlier version does not grant a later version.';

-- Application runtime can be granted only SELECT and INSERT after independent
-- DB privilege review. Do not authorize UPDATE/DELETE for ordinary API roles.
-- Do not enable this migration on a live cohort without member deletion
-- treatment and the approved notice being separately witnessed.
